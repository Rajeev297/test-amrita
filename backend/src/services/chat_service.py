import json
import httpx
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.config import settings
from src.models.schemas import CourseOut


SYSTEM_PROMPT = """You are a curriculum assistant for Amrita Vishwa Vidyapeetham.
Given the user's natural language question, generate a SQL query to answer it.

The database has these tables:
- programs (id, name, code, duration, total_semesters, total_credits_required, degree_level, is_active)
- curriculum (id, course_code, course_name, credits, category, lecture_hours, tutorial_hours, practical_hours, description, department, program_id, semester, batch_year, source_url, is_active)
- course_relationships (id, course_code, related_course_code, relationship_type, program_id)

Categories: Core, Elective, Lab, Audit
Relationship types: prerequisite_of, lab_companion, corequisite_of, related_to

Return ONLY a JSON object with:
1. "sql_query": the SQL query (use PostgreSQL dialect)
2. "explanation": short explanation of what the query does
3. "requires_courses": boolean - true if the answer should include course listings

Only query active records (is_active = true). Do not use EXPLAIN or modify data."""


def natural_language_query(db: Session, question: str) -> dict:
    if not settings.anthropic_api_key:
        return _fallback_rule_based(db, question)

    try:
        response = _call_claude_api(question)
        parsed = json.loads(response)
        sql_query = parsed.get("sql_query", "")

        if sql_query:
            rows = db.execute(text(sql_query)).all()
            courses = _rows_to_course_list(rows)
            return {
                "answer": parsed.get("explanation", "Query executed successfully."),
                "courses": courses,
                "sql_query": sql_query,
                "source": _extract_source(courses),
            }
    except Exception:
        return _fallback_rule_based(db, question)

    return _fallback_rule_based(db, question)


def _call_claude_api(question: str) -> str:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": question}],
    )
    return message.content[0].text


def _fallback_rule_based(db: Session, question: str) -> dict:
    q = question.lower().strip()

    if "semester" in q and ("course" in q or "subject" in q):
        import re
        sem_match = re.search(r"sem(?:ester)?\s+(\d+)", q)
        sem = int(sem_match.group(1)) if sem_match else 1

        prog_match = re.search(r"\b(cse|ece|me|ce|mca)\b", q)
        prog_code = prog_match.group(1).upper() if prog_match else "CSE"

        prog = db.execute(
            text("SELECT id, name FROM programs WHERE code = :code AND is_active = true"),
            {"code": prog_code},
        ).one_or_none()

        if prog:
            rows = db.execute(
                text("""
                    SELECT c.*, p.name as program_name
                    FROM curriculum c
                    JOIN programs p ON p.id = c.program_id
                    WHERE c.program_id = :pid AND c.semester = :sem AND c.is_active = true
                    ORDER BY c.category, c.course_code
                """),
                {"pid": prog.id, "sem": sem},
            ).all()

            courses = _rows_to_course_list(rows)
            return {
                "answer": f"Here are the Semester {sem} courses for {prog.name}:",
                "courses": courses,
                "sql_query": "",
                "source": _extract_source(courses),
            }

    if "credit" in q:
        import re
        prog_match = re.search(r"\b(cse|ece|me|ce|mca)\b", q)
        prog_code = prog_match.group(1).upper() if prog_match else "CSE"

        prog = db.execute(
            text("SELECT id, name, total_credits_required FROM programs WHERE code = :code AND is_active = true"),
            {"code": prog_code},
        ).one_or_none()

        if prog:
            total = db.execute(
                text("SELECT SUM(credits) FROM curriculum WHERE program_id = :pid AND is_active = true"),
                {"pid": prog.id},
            ).scalar() or 0

            return {
                "answer": f"The {prog.name} program requires {prog.total_credits_required} total credits to graduate. The curriculum currently lists {float(total):.0f} credits across all semesters.",
                "courses": [],
                "sql_query": "",
                "source": None,
            }

    if "prerequisite" in q or "prerequisites" in q:
        import re
        code_match = re.search(r"\b([A-Za-z]{1,4}\d{3,4})\b", q.upper())
        if code_match:
            course_code = code_match.group(1)
            rels = db.execute(
                text("""
                    SELECT cr.related_course_code as code, c2.course_name as name
                    FROM course_relationships cr
                    LEFT JOIN curriculum c2 ON c2.course_code = cr.related_course_code
                    WHERE cr.course_code = :cc AND cr.relationship_type = 'prerequisite_of'
                """),
                {"cc": course_code},
            ).all()

            if rels:
                prereqs = ", ".join(f"{r[0]} ({r[1]})" for r in rels)
                return {
                    "answer": f"Prerequisites for {course_code}: {prereqs}",
                    "courses": [],
                    "sql_query": "",
                    "source": None,
                }

    return {
        "answer": f"I searched for information related to '{question}' but could not find a specific match. Try asking about courses in a semester, credit requirements, or prerequisites.",
        "courses": [],
        "sql_query": "",
        "source": None,
    }


def validate_response(db: Session, courses: list[CourseOut]) -> dict:
    if not courses:
        return {"valid": True, "message": "No course data to validate"}

    codes = [c.course_code for c in courses]
    existing = db.execute(
        text("""
            SELECT course_code, course_name, credits, category
            FROM curriculum
            WHERE course_code = ANY(:codes) AND is_active = true
        """),
        {"codes": codes},
    ).all()

    existing_set = {(r[0], r[1], float(r[2]), r[3]) for r in existing}
    for c in courses:
        key = (c.course_code, c.course_name, c.credits, c.category)
        if key not in existing_set:
            return {
                "valid": False,
                "message": f"Course {c.course_code} ({c.course_name}) not found in database or data mismatch",
            }

    return {"valid": True, "message": "All courses validated against database"}


def _rows_to_course_list(rows) -> list[CourseOut]:
    results = []
    for r in rows:
        results.append(CourseOut(
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
        ))
    return results


def _extract_source(courses: list[CourseOut]) -> dict | None:
    if not courses:
        return None
    c = courses[0]
    return {
        "batch_year": c.batch_year,
        "program_id": c.program_id,
        "program_name": c.program_name,
        "source_url": c.source_url,
    }
