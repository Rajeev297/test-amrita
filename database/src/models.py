from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey,
    Text, Enum, CheckConstraint, UniqueConstraint, Index, func
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import DeclarativeBase, relationship


class Base(DeclarativeBase):
    pass


class Program(Base):
    __tablename__ = "programs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)
    duration = Column(Integer, nullable=False, default=8)
    total_semesters = Column(Integer, nullable=False, default=8)
    total_credits_required = Column(Integer, nullable=False)
    degree_level = Column(String(20), nullable=False, default="UG")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    curricula = relationship("Curriculum", back_populates="program", cascade="all, delete-orphan")


class Curriculum(Base):
    __tablename__ = "curriculum"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_code = Column(String(20), nullable=False)
    course_name = Column(String(255), nullable=False)
    credits = Column(Float, nullable=False)
    category = Column(String(20), nullable=False)
    lecture_hours = Column(Integer, default=0)
    tutorial_hours = Column(Integer, default=0)
    practical_hours = Column(Integer, default=0)
    description = Column(Text, default="")
    department = Column(String(100), default="")
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    batch_year = Column(Integer, nullable=False)
    source_url = Column(String(500), nullable=False, default="")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    program = relationship("Program", back_populates="curricula")

    __table_args__ = (
        UniqueConstraint(
            "course_code", "program_id", "batch_year", "semester",
            name="uq_curriculum_course_program_batch_sem"
        ),
        CheckConstraint(
            "category IN ('Core', 'Elective', 'Lab', 'Audit')",
            name="ck_curriculum_category"
        ),
        CheckConstraint(
            "credits > 0",
            name="ck_curriculum_credits_positive"
        ),
        CheckConstraint(
            "semester BETWEEN 1 AND 12",
            name="ck_curriculum_semester_range"
        ),
        CheckConstraint(
            "batch_year BETWEEN 2000 AND 2100",
            name="ck_curriculum_batch_year_range"
        ),
        Index(
            "ix_curriculum_course_name_fts",
            func.to_tsvector("english", course_name),
            postgresql_using="gin"
        ),
        Index(
            "ix_curriculum_program_semester",
            "program_id", "semester"
        ),
        Index(
            "ix_curriculum_program_semester_category",
            "program_id", "semester", "category"
        ),
        Index(
            "ix_curriculum_batch_program_semester",
            "batch_year", "program_id", "semester"
        ),
        Index(
            "ix_curriculum_course_code_program",
            "course_code", "program_id"
        ),
        Index(
            "ix_curriculum_category_semester",
            "category", "semester"
        ),
    )


class CourseRelationship(Base):
    __tablename__ = "course_relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_code = Column(String(20), nullable=False)
    related_course_code = Column(String(20), nullable=False)
    relationship_type = Column(String(30), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "course_code", "related_course_code", "relationship_type", "program_id",
            name="uq_course_relationship"
        ),
        CheckConstraint(
            "relationship_type IN ('prerequisite_of', 'lab_companion', 'corequisite_of', 'related_to')",
            name="ck_relationship_type"
        ),
    )


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, autoincrement=True)
    table_name = Column(String(50), nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String(10), nullable=False)
    old_values = Column(Text, default="")
    new_values = Column(Text, default="")
    performed_by = Column(String(100), default="system")
    performed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        Index("ix_audit_log_table_record", "table_name", "record_id"),
        Index("ix_audit_log_performed_at", "performed_at"),
    )
