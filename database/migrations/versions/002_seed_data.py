"""seed initial program and curriculum data

Revision ID: 002
Revises: 001
Create Date: 2026-06-18
"""
from datetime import datetime, timezone
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: str = "001"
branch_labels = None
depends_on = None

programs_table = sa.table(
    "programs",
    sa.column("id", sa.Integer),
    sa.column("name", sa.String),
    sa.column("code", sa.String),
    sa.column("duration", sa.Integer),
    sa.column("total_semesters", sa.Integer),
    sa.column("total_credits_required", sa.Integer),
    sa.column("degree_level", sa.String),
    sa.column("is_active", sa.Boolean),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

curriculum_table = sa.table(
    "curriculum",
    sa.column("id", sa.Integer),
    sa.column("course_code", sa.String),
    sa.column("course_name", sa.String),
    sa.column("credits", sa.Float),
    sa.column("category", sa.String),
    sa.column("lecture_hours", sa.Integer),
    sa.column("tutorial_hours", sa.Integer),
    sa.column("practical_hours", sa.Integer),
    sa.column("description", sa.String),
    sa.column("department", sa.String),
    sa.column("program_id", sa.Integer),
    sa.column("semester", sa.Integer),
    sa.column("batch_year", sa.Integer),
    sa.column("source_url", sa.String),
    sa.column("is_active", sa.Boolean),
    sa.column("created_at", sa.DateTime),
    sa.column("updated_at", sa.DateTime),
)

relationships_table = sa.table(
    "course_relationships",
    sa.column("id", sa.Integer),
    sa.column("course_code", sa.String),
    sa.column("related_course_code", sa.String),
    sa.column("relationship_type", sa.String),
    sa.column("program_id", sa.Integer),
    sa.column("created_at", sa.DateTime),
)

now = datetime.now(timezone.utc)


def upgrade() -> None:
    now_dt = now
    op.bulk_insert(
        programs_table,
        [
            {"id": 1, "name": "B.Tech Computer Science and Engineering", "code": "CSE", "duration": 8, "total_semesters": 8, "total_credits_required": 160, "degree_level": "UG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 2, "name": "B.Tech Electronics and Communication Engineering", "code": "ECE", "duration": 8, "total_semesters": 8, "total_credits_required": 160, "degree_level": "UG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 3, "name": "B.Tech Mechanical Engineering", "code": "ME", "duration": 8, "total_semesters": 8, "total_credits_required": 160, "degree_level": "UG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 4, "name": "B.Tech Civil Engineering", "code": "CE", "duration": 8, "total_semesters": 8, "total_credits_required": 160, "degree_level": "UG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 5, "name": "M.Tech Computer Science and Engineering", "code": "M.Tech-CSE", "duration": 4, "total_semesters": 4, "total_credits_required": 80, "degree_level": "PG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 6, "name": "MCA", "code": "MCA", "duration": 4, "total_semesters": 4, "total_credits_required": 80, "degree_level": "PG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
            {"id": 7, "name": "B.Sc Computer Science", "code": "B.Sc-CS", "duration": 6, "total_semesters": 6, "total_credits_required": 120, "degree_level": "UG", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        ],
    )

    cse_courses = [
        # Semester 1
        {"course_code": "CS101", "course_name": "Introduction to Computer Science", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Fundamentals of computer science and programming.", "department": "CSE", "program_id": 1, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MA101", "course_name": "Calculus I", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Single-variable calculus.", "department": "Mathematics", "program_id": 1, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "PH101", "course_name": "Engineering Physics", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Mechanics, waves, and thermodynamics.", "department": "Physics", "program_id": 1, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EN101", "course_name": "English Communication", "credits": 2, "category": "Audit", "lecture_hours": 2, "tutorial_hours": 0, "practical_hours": 0, "description": "Technical writing and communication skills.", "department": "Humanities", "program_id": 1, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS1L1", "course_name": "Computer Programming Lab", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Hands-on programming lab.", "department": "CSE", "program_id": 1, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        # Semester 2
        {"course_code": "CS102", "course_name": "Data Structures", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Linear and non-linear data structures.", "department": "CSE", "program_id": 1, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MA102", "course_name": "Calculus II", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Multi-variable calculus and series.", "department": "Mathematics", "program_id": 1, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "PH102", "course_name": "Engineering Physics II", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Electromagnetism and optics.", "department": "Physics", "program_id": 1, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS2L1", "course_name": "Data Structures Lab", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Implementation of data structures.", "department": "CSE", "program_id": 1, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EE101", "course_name": "Fundamentals of Electrical Engineering", "credits": 3, "category": "Elective", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Basic electrical circuits and systems.", "department": "EEE", "program_id": 1, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        # Semester 3
        {"course_code": "CS201", "course_name": "Object-Oriented Programming", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "OOP concepts using Java and C++.", "department": "CSE", "program_id": 1, "semester": 3, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS202", "course_name": "Discrete Mathematics", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Logic, sets, graphs, and combinatorics.", "department": "CSE", "program_id": 1, "semester": 3, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS203", "course_name": "Digital Logic Design", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Boolean algebra and digital circuits.", "department": "CSE", "program_id": 1, "semester": 3, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS3L1", "course_name": "OOP Lab", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Object-oriented programming lab.", "department": "CSE", "program_id": 1, "semester": 3, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MG201", "course_name": "Principles of Management", "credits": 3, "category": "Elective", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Management theories and practices.", "department": "Management", "program_id": 1, "semester": 3, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        # Semester 4
        {"course_code": "CS204", "course_name": "Algorithms", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Design and analysis of algorithms.", "department": "CSE", "program_id": 1, "semester": 4, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS205", "course_name": "Computer Organization", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "CPU architecture, memory, and I/O.", "department": "CSE", "program_id": 1, "semester": 4, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS206", "course_name": "Operating Systems", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Process management, memory, and file systems.", "department": "CSE", "program_id": 1, "semester": 4, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS4L1", "course_name": "Algorithms Lab", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Algorithm implementation and benchmarking.", "department": "CSE", "program_id": 1, "semester": 4, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "AI201", "course_name": "Introduction to Artificial Intelligence", "credits": 3, "category": "Elective", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "AI fundamentals, search, and knowledge representation.", "department": "CSE", "program_id": 1, "semester": 4, "batch_year": 2024, "source_url": "https://amrita.edu/cse-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
    ]

    ece_courses = [
        {"course_code": "EC101", "course_name": "Electronic Devices", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Semiconductor physics and devices.", "department": "ECE", "program_id": 2, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MA101", "course_name": "Calculus I", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Single-variable calculus.", "department": "Mathematics", "program_id": 2, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "PH101", "course_name": "Engineering Physics", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Mechanics, waves, and thermodynamics.", "department": "Physics", "program_id": 2, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EN101", "course_name": "English Communication", "credits": 2, "category": "Audit", "lecture_hours": 2, "tutorial_hours": 0, "practical_hours": 0, "description": "Technical writing and communication skills.", "department": "Humanities", "program_id": 2, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EC1L1", "course_name": "Electronics Lab I", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Basic electronics lab experiments.", "department": "ECE", "program_id": 2, "semester": 1, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EC102", "course_name": "Digital Electronics", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Logic gates, flip-flops, and counters.", "department": "ECE", "program_id": 2, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MA102", "course_name": "Calculus II", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Multi-variable calculus and series.", "department": "Mathematics", "program_id": 2, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "PH102", "course_name": "Engineering Physics II", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Electromagnetism and optics.", "department": "Physics", "program_id": 2, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EC2L1", "course_name": "Digital Electronics Lab", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Digital circuit implementation lab.", "department": "ECE", "program_id": 2, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "CS101", "course_name": "Introduction to Programming", "credits": 3, "category": "Elective", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Fundamentals of programming using C.", "department": "CSE", "program_id": 2, "semester": 2, "batch_year": 2024, "source_url": "https://amrita.edu/ece-curriculum-2024", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
    ]

    ece_courses_2023 = [
        {"course_code": "EC101", "course_name": "Electronic Devices", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Semiconductor physics and devices.", "department": "ECE", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "MA101", "course_name": "Calculus I", "credits": 4, "category": "Core", "lecture_hours": 3, "tutorial_hours": 1, "practical_hours": 0, "description": "Single-variable calculus.", "department": "Mathematics", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "PH101", "course_name": "Engineering Physics", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Mechanics, waves, and thermodynamics.", "department": "Physics", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EN101", "course_name": "English Communication", "credits": 2, "category": "Audit", "lecture_hours": 2, "tutorial_hours": 0, "practical_hours": 0, "description": "Technical writing and communication skills.", "department": "Humanities", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EC1L1", "course_name": "Electronics Lab I", "credits": 1, "category": "Lab", "lecture_hours": 0, "tutorial_hours": 0, "practical_hours": 2, "description": "Basic electronics lab experiments.", "department": "ECE", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
        {"course_code": "EE100", "course_name": "Basic Electrical Engineering", "credits": 3, "category": "Core", "lecture_hours": 3, "tutorial_hours": 0, "practical_hours": 0, "description": "Fundamentals of electrical engineering.", "department": "EEE", "program_id": 2, "semester": 1, "batch_year": 2023, "source_url": "https://amrita.edu/ece-curriculum-2023", "is_active": True, "created_at": now_dt, "updated_at": now_dt},
    ]

    all_courses = cse_courses + ece_courses + ece_courses_2023

    for c in all_courses:
        c["created_at"] = now_dt
        c["updated_at"] = now_dt

    op.bulk_insert(curriculum_table, all_courses)

    op.bulk_insert(
        relationships_table,
        [
            {"course_code": "CS102", "related_course_code": "CS101", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS201", "related_course_code": "CS102", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS204", "related_course_code": "CS102", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS204", "related_course_code": "CS202", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS204", "related_course_code": "CS4L1", "relationship_type": "lab_companion", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS203", "related_course_code": "CS205", "relationship_type": "related_to", "program_id": 1, "created_at": now_dt},
            {"course_code": "CS206", "related_course_code": "CS205", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "AI201", "related_course_code": "CS204", "relationship_type": "prerequisite_of", "program_id": 1, "created_at": now_dt},
            {"course_code": "EC102", "related_course_code": "EC101", "relationship_type": "prerequisite_of", "program_id": 2, "created_at": now_dt},
        ],
    )


def downgrade() -> None:
    op.execute("DELETE FROM course_relationships")
    op.execute("DELETE FROM curriculum")
    op.execute("DELETE FROM programs")
