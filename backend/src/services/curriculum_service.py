from sqlalchemy import text
from sqlalchemy.orm import Session
from src.models.schemas import (
    CourseOut, SemesterBreakdown, CategoryBreakdown,
    AggregatedReport, CurriculumDiff,
)


def get_semester_curriculum(
    db: Session, program_id: int, semester: int, batch_year: int | None = None
) -> list[CourseOut]:
    query = """
        SELECT c.*, p.name as program_name
        FROM curriculum c
        JOIN programs p ON p.id = c.program_id
        WHERE c.program_id = :pid
          AND c.semester = :sem
          AND c.is_active = true
    """
    params = {"pid": program_id, "sem": semester}
    if batch_year:
        query += " AND c.batch_year = :by"
        params["by"] = batch_year
    query += " ORDER BY c.category, c.course_code"

    rows = db.execute(text(query), params).all()
    return _rows_to_course_out(rows)


def get_total_credits(db: Session, program_id: int) -> dict:
    row = db.execute(
        text("""
            SELECT SUM(credits) as total_credits, COUNT(*) as total_courses
            FROM curriculum
            WHERE program_id = :pid AND is_active = true
        """),
        {"pid": program_id},
    ).one()
    return {
        "total_credits": float(row[0]) if row[0] else 0,
        "total_courses": row[1] or 0,
    }


def get_program_credits_required(db: Session, program_id: int) -> int:
    row = db.execute(
        text("SELECT total_credits_required FROM programs WHERE id = :pid"),
        {"pid": program_id},
    ).scalar()
    return row or 0


def get_electives_by_semester(db: Session, program_id: int, semester: int) -> list[CourseOut]:
    rows = db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.program_id = :pid
              AND c.semester = :sem
              AND c.category = 'Elective'
              AND c.is_active = true
            ORDER BY c.course_code
        """),
        {"pid": program_id, "sem": semester},
    ).all()
    return _rows_to_course_out(rows)


def get_course_relationships(db: Session, course_code: str, program_id: int) -> list[dict]:
    rows = db.execute(
        text("""
            SELECT cr.related_course_code as code,
                   c.course_name as name,
                   cr.relationship_type
            FROM course_relationships cr
            LEFT JOIN curriculum c ON c.course_code = cr.related_course_code
                AND c.program_id = cr.program_id
            WHERE cr.course_code = :cc AND cr.program_id = :pid
            UNION
            SELECT cr.course_code as code,
                   c.course_name as name,
                   cr.relationship_type
            FROM course_relationships cr
            LEFT JOIN curriculum c ON c.course_code = cr.course_code
                AND c.program_id = cr.program_id
            WHERE cr.related_course_code = :cc2 AND cr.program_id = :pid2
            ORDER BY relationship_type, code
        """),
        {"cc": course_code, "pid": program_id, "cc2": course_code, "pid2": program_id},
    ).all()

    return [
        {"code": r[0], "name": r[1] or "", "type": r[2]}
        for r in rows
    ]


def get_category_breakdown(db: Session, program_id: int, batch_year: int | None = None) -> list[SemesterBreakdown]:
    query = """
        SELECT semester, category,
               COUNT(*) as cnt,
               SUM(credits) as total_credits
        FROM curriculum
        WHERE program_id = :pid AND is_active = true
    """
    params = {"pid": program_id}
    if batch_year:
        query += " AND batch_year = :by"
        params["by"] = batch_year
    query += """
        GROUP BY semester, category
        ORDER BY semester, category
    """

    rows = db.execute(text(query), params).all()
    sem_map: dict[int, list[CategoryBreakdown]] = {}

    for r in rows:
        sem = r[0]
        cat = CategoryBreakdown(
            category=r[1],
            count=r[2],
            total_credits=float(r[3]) if r[3] else 0,
        )
        if sem not in sem_map:
            sem_map[sem] = []
        sem_map[sem].append(cat)

    result = []
    for sem in sorted(sem_map.keys()):
        cats = sem_map[sem]
        result.append(SemesterBreakdown(
            semester=sem,
            total_courses=sum(c.count for c in cats),
            total_credits=sum(c.total_credits for c in cats),
            categories=cats,
        ))
    return result


def get_all_programs_aggregated(db: Session) -> list[AggregatedReport]:
    rows = db.execute(
        text("""
            SELECT p.id, p.name, p.code,
                   COUNT(c.id) as total_courses,
                   SUM(c.credits) as total_credits,
                   c.semester,
                   c.category,
                   COUNT(c.id) as cat_count,
                   SUM(c.credits) as cat_credits
            FROM programs p
            LEFT JOIN curriculum c ON c.program_id = p.id AND c.is_active = true
            WHERE p.is_active = true
            GROUP BY p.id, p.name, p.code, c.semester, c.category
            ORDER BY p.code, c.semester, c.category
        """),
    ).all()

    prog_map: dict[int, AggregatedReport] = {}
    sem_map: dict[tuple[int, int], dict] = {}

    for r in rows:
        pid = r[0]
        if pid not in prog_map:
            prog_map[pid] = AggregatedReport(
                program_name=r[1],
                program_code=r[2],
                total_courses=0,
                total_credits=0.0,
                semester_breakdown=[],
            )

    # Re-query with two levels
    prog_data = db.execute(
        text("""
            SELECT p.id, p.name, p.code,
                   COUNT(c.id) as total_courses,
                   COALESCE(SUM(c.credits), 0) as total_credits
            FROM programs p
            LEFT JOIN curriculum c ON c.program_id = p.id AND c.is_active = true
            WHERE p.is_active = true
            GROUP BY p.id, p.name, p.code
            ORDER BY p.code
        """),
    ).all()

    reports = []
    for r in prog_data:
        sems = get_category_breakdown(db, r[0])
        reports.append(AggregatedReport(
            program_name=r[1],
            program_code=r[2],
            total_courses=r[3] or 0,
            total_credits=float(r[4]) if r[4] else 0.0,
            semester_breakdown=sems,
        ))

    return reports


def get_core_elective_split(db: Session, program_id: int, semester: int | None = None) -> dict:
    query = """
        SELECT category,
               COUNT(*) as cnt,
               SUM(credits) as total_credits
        FROM curriculum
        WHERE program_id = :pid AND is_active = true
    """
    params = {"pid": program_id}
    if semester:
        query += " AND semester = :sem"
        params["sem"] = semester
    query += " GROUP BY category ORDER BY category"

    rows = db.execute(text(query), params).all()
    return {
        "program_id": program_id,
        "semester": semester,
        "breakdown": [
            {"category": r[0], "count": r[1], "total_credits": float(r[2]) if r[2] else 0}
            for r in rows
        ],
    }


def compare_batch_curricula(
    db: Session, program_id: int, batch_year_old: int, batch_year_new: int
) -> CurriculumDiff:
    old = db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.program_id = :pid AND c.batch_year = :by AND c.is_active = true
        """),
        {"pid": program_id, "by": batch_year_old},
    ).all()

    new = db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.program_id = :pid AND c.batch_year = :by AND c.is_active = true
        """),
        {"pid": program_id, "by": batch_year_new},
    ).all()

    old_map = {(r.course_code, r.semester): r for r in old}
    new_map = {(r.course_code, r.semester): r for r in new}

    added_keys = set(new_map.keys()) - set(old_map.keys())
    removed_keys = set(old_map.keys()) - set(new_map.keys())
    common_keys = set(old_map.keys()) & set(new_map.keys())

    added = [_row_to_out(new_map[k]) for k in sorted(added_keys)]
    removed = [_row_to_out(old_map[k]) for k in sorted(removed_keys)]

    changed = []
    for k in sorted(common_keys):
        o = old_map[k]
        n = new_map[k]
        diffs = {}
        if float(o.credits) != float(n.credits):
            diffs["credits"] = {"old": float(o.credits), "new": float(n.credits)}
        if o.category != n.category:
            diffs["category"] = {"old": o.category, "new": n.category}
        if o.course_name != n.course_name:
            diffs["course_name"] = {"old": o.course_name, "new": n.course_name}
        if diffs:
            changed.append({
                "course_code": k[0],
                "semester": k[1],
                "changes": diffs,
            })

    return CurriculumDiff(
        batch_year_old=batch_year_old,
        batch_year_new=batch_year_new,
        program_id=program_id,
        added=added,
        removed=removed,
        changed=changed,
    )


def export_curriculum(db: Session, program_id: int, batch_year: int | None = None) -> tuple[dict, list[CourseOut]]:
    program = db.execute(
        text("SELECT * FROM programs WHERE id = :pid"),
        {"pid": program_id},
    ).one()

    query = """
        SELECT c.*, p.name as program_name
        FROM curriculum c
        JOIN programs p ON p.id = c.program_id
        WHERE c.program_id = :pid AND c.is_active = true
    """
    params = {"pid": program_id}
    if batch_year:
        query += " AND c.batch_year = :by"
        params["by"] = batch_year
    query += " ORDER BY c.semester, c.category, c.course_code"

    rows = db.execute(text(query), params).all()

    program_dict = {
        "id": program.id,
        "name": program.name,
        "code": program.code,
        "duration": program.duration,
        "total_semesters": program.total_semesters,
        "total_credits_required": program.total_credits_required,
        "degree_level": program.degree_level,
    }

    return program_dict, _rows_to_course_out(rows)


def _rows_to_course_out(rows) -> list[CourseOut]:
    return [_row_to_out(r) for r in rows]


def _row_to_out(r) -> CourseOut:
    return CourseOut(
        id=r.id,
        course_code=r.course_code,
        course_name=r.course_name,
        credits=float(r.credits),
        category=r.category,
        lecture_hours=r.lecture_hours or 0,
        tutorial_hours=r.tutorial_hours or 0,
        practical_hours=r.practical_hours or 0,
        description=r.description or "",
        department=r.department or "",
        program_id=r.program_id,
        program_name=getattr(r, "program_name", ""),
        semester=r.semester,
        batch_year=r.batch_year,
        source_url=r.source_url or "",
        is_active=r.is_active,
    )
