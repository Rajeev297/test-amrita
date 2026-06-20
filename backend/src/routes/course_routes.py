from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.schemas import (
    CourseOut, CourseCreate, CourseUpdate,
    SemesterBreakdown, AggregatedReport,
    CurriculumDiff, SearchResult,
    CategoryBreakdown, ExportResponse,
)
from src.services.search_service import search_courses_3layer
from src.services.curriculum_service import (
    get_semester_curriculum, get_total_credits, get_program_credits_required,
    get_electives_by_semester, get_course_relationships,
    get_category_breakdown, get_all_programs_aggregated,
    get_core_elective_split, compare_batch_curricula, export_curriculum,
)
from src.auth.jwt import require_admin, get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/search", response_model=SearchResult)
def search_courses(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    results, match_type = search_courses_3layer(db, q, limit)
    return SearchResult(
        query=q,
        results=results,
        total=len(results),
        match_type=match_type,
    )


@router.get("/semester/{program_id}/{semester}", response_model=list[CourseOut])
def semester_courses(
    program_id: int,
    semester: int,
    batch_year: int | None = None,
    db: Session = Depends(get_db),
):
    return get_semester_curriculum(db, program_id, semester, batch_year)


@router.get("/credits/{program_id}")
def program_credits(program_id: int, db: Session = Depends(get_db)):
    creds = get_total_credits(db, program_id)
    required = get_program_credits_required(db, program_id)
    return {
        **creds,
        "credits_required": required,
    }


@router.get("/electives/{program_id}/{semester}", response_model=list[CourseOut])
def electives_by_semester(
    program_id: int, semester: int, db: Session = Depends(get_db)
):
    return get_electives_by_semester(db, program_id, semester)


@router.get("/relationships/{course_code}")
def course_relationships(
    course_code: str,
    program_id: int = Query(1),
    db: Session = Depends(get_db),
):
    return get_course_relationships(db, course_code, program_id)


@router.get("/breakdown/{program_id}", response_model=list[SemesterBreakdown])
def category_breakdown(
    program_id: int,
    batch_year: int | None = None,
    db: Session = Depends(get_db),
):
    return get_category_breakdown(db, program_id, batch_year)


@router.get("/core-elective-split/{program_id}")
def core_elective_split(
    program_id: int,
    semester: int | None = None,
    db: Session = Depends(get_db),
):
    return get_core_elective_split(db, program_id, semester)


@router.get("/compare", response_model=CurriculumDiff)
def compare_batch(
    program_id: int = Query(...),
    batch_year_old: int = Query(...),
    batch_year_new: int = Query(...),
    db: Session = Depends(get_db),
):
    return compare_batch_curricula(db, program_id, batch_year_old, batch_year_new)


@router.get("/export/{program_id}", response_model=ExportResponse)
def export_data(
    program_id: int,
    batch_year: int | None = None,
    db: Session = Depends(get_db),
):
    prog, courses = export_curriculum(db, program_id, batch_year)
    from datetime import datetime, timezone
    return ExportResponse(
        program=prog,
        courses=courses,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


@router.get("/aggregated", response_model=list[AggregatedReport])
def aggregated_reports(db: Session = Depends(get_db)):
    return get_all_programs_aggregated(db)


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    data: CourseUpdate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin),
):
    existing = db.execute(
        text("SELECT * FROM curriculum WHERE id = :cid"),
        {"cid": course_id},
    ).one_or_none()
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")

    updates = data.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clauses = ", ".join(f"{k} = :{k}" for k in updates.keys())
    updates["cid"] = course_id

    db.execute(
        text(f"UPDATE curriculum SET {set_clauses} WHERE id = :cid"),
        updates,
    )
    db.commit()

    row = db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.id = :cid
        """),
        {"cid": course_id},
    ).one()

    return CourseOut(
        id=row.id, course_code=row.course_code, course_name=row.course_name,
        credits=float(row.credits), category=row.category,
        lecture_hours=row.lecture_hours or 0,
        tutorial_hours=row.tutorial_hours or 0,
        practical_hours=row.practical_hours or 0,
        description=row.description or "",
        department=row.department or "",
        program_id=row.program_id, semester=row.semester,
        batch_year=row.batch_year, source_url=row.source_url or "",
        is_active=row.is_active, program_name=row.program_name,
    )


@router.post("", response_model=CourseOut, status_code=201)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin),
):
    existing = db.execute(
        text("""
            SELECT id FROM curriculum
            WHERE course_code = :cc AND program_id = :pid
              AND batch_year = :by AND semester = :sem AND is_active = true
        """),
        {"cc": data.course_code, "pid": data.program_id,
         "by": data.batch_year, "sem": data.semester},
    ).one_or_none()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Course already exists for this program, batch, and semester",
        )

    result = db.execute(
        text("""
            INSERT INTO curriculum (course_code, course_name, credits, category,
                lecture_hours, tutorial_hours, practical_hours, description,
                department, program_id, semester, batch_year, source_url)
            VALUES (:cc, :cn, :cr, :cat, :lh, :th, :ph, :desc, :dept, :pid, :sem, :by, :url)
            RETURNING id
        """),
        {
            "cc": data.course_code, "cn": data.course_name,
            "cr": data.credits, "cat": data.category,
            "lh": data.lecture_hours, "th": data.tutorial_hours,
            "ph": data.practical_hours, "desc": data.description,
            "dept": data.department, "pid": data.program_id,
            "sem": data.semester, "by": data.batch_year,
            "url": data.source_url,
        },
    )
    db.commit()
    new_id = result.scalar()

    row = db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.id = :cid
        """),
        {"cid": new_id},
    ).one()

    return CourseOut(
        id=row.id, course_code=row.course_code, course_name=row.course_name,
        credits=float(row.credits), category=row.category,
        lecture_hours=row.lecture_hours or 0,
        tutorial_hours=row.tutorial_hours or 0,
        practical_hours=row.practical_hours or 0,
        description=row.description or "",
        department=row.department or "",
        program_id=row.program_id, semester=row.semester,
        batch_year=row.batch_year, source_url=row.source_url or "",
        is_active=row.is_active, program_name=row.program_name,
    )


@router.delete("/{course_id}")
def soft_delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    user: dict = Depends(require_admin),
):
    existing = db.execute(
        text("SELECT id FROM curriculum WHERE id = :cid AND is_active = true"),
        {"cid": course_id},
    ).one_or_none()
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")

    db.execute(
        text("UPDATE curriculum SET is_active = false WHERE id = :cid"),
        {"cid": course_id},
    )
    db.commit()

    return {"message": "Course retired successfully", "course_id": course_id}
