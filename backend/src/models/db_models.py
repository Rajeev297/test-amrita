from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, UniqueConstraint, CheckConstraint, Index, func
)
from sqlalchemy.orm import relationship

from src.database import Base


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

    curricula = relationship("Curriculum", back_populates="program")


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
    )


class CourseRelationship(Base):
    __tablename__ = "course_relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    course_code = Column(String(20), nullable=False)
    related_course_code = Column(String(20), nullable=False)
    relationship_type = Column(String(30), nullable=False)
    program_id = Column(Integer, ForeignKey("programs.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


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
