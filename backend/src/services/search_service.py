from sqlalchemy import text
from sqlalchemy.orm import Session
from src.models.schemas import CourseOut


def search_courses_3layer(db: Session, query: str, limit: int = 20) -> tuple[list[CourseOut], str]:
    q = query.strip().lower()

    layer1 = _exact_match(db, q)
    if layer1:
        return _to_course_out_list(layer1), "exact"

    layer2 = _alias_match(db, q)
    if layer2:
        return _to_course_out_list(layer2), "alias"

    layer3 = _fts_search(db, q, limit)
    if layer3:
        return _to_course_out_list(layer3), "fulltext"

    return [], "none"


def _exact_match(db: Session, q: str):
    return db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.is_active = true
              AND (LOWER(c.course_code) = :q OR LOWER(c.course_name) = :q)
            ORDER BY c.semester, c.course_code
        """),
        {"q": q},
    ).all()


def _alias_match(db: Session, q: str):
    return db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.is_active = true
              AND (
                LOWER(c.course_code) LIKE :prefix
                OR LOWER(c.course_name) LIKE :prefix
                OR EXISTS (
                    SELECT 1 FROM curriculum c2
                    WHERE c2.program_id = c.program_id
                    AND c2.batch_year = c.batch_year
                    AND c2.semester = c.semester
                    AND LOWER(c2.course_code) = :q
                    AND LOWER(c.course_name) LIKE '%' || :partial || '%'
                )
              )
            ORDER BY
                CASE WHEN LOWER(c.course_code) = :q THEN 0
                     WHEN LOWER(c.course_code) LIKE :prefix THEN 1
                     WHEN LOWER(c.course_name) LIKE :prefix THEN 2
                     ELSE 3
                END,
                c.semester, c.course_code
            LIMIT 20
        """),
        {"q": q, "prefix": f"{q}%", "partial": q},
    ).all()


def _fts_search(db: Session, q: str, limit: int = 20):
    tsquery = " & ".join(q.split())
    return db.execute(
        text("""
            SELECT c.*, p.name as program_name
            FROM curriculum c
            JOIN programs p ON p.id = c.program_id
            WHERE c.is_active = true
              AND to_tsvector('english', c.course_name) @@ to_tsquery('english', :tsquery)
            ORDER BY ts_rank(to_tsvector('english', c.course_name), to_tsquery('english', :tsquery)) DESC
            LIMIT :lim
        """),
        {"tsquery": tsquery, "lim": limit},
    ).all()


def _to_course_out_list(rows) -> list[CourseOut]:
    results = []
    for row in rows:
        c = row._mapping if hasattr(row, '_mapping') else row
        results.append(CourseOut(
            id=c["id"],
            course_code=c["course_code"],
            course_name=c["course_name"],
            credits=float(c["credits"]),
            category=c["category"],
            lecture_hours=c.get("lecture_hours", 0),
            tutorial_hours=c.get("tutorial_hours", 0),
            practical_hours=c.get("practical_hours", 0),
            description=c.get("description", ""),
            department=c.get("department", ""),
            program_id=c["program_id"],
            program_name=c.get("program_name", ""),
            semester=c["semester"],
            batch_year=c["batch_year"],
            source_url=c.get("source_url", ""),
            is_active=c.get("is_active", True),
        ))
    return results
