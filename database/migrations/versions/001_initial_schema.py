"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-18
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "programs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(20), nullable=False),
        sa.Column("duration", sa.Integer(), nullable=False, server_default="8"),
        sa.Column("total_semesters", sa.Integer(), nullable=False, server_default="8"),
        sa.Column("total_credits_required", sa.Integer(), nullable=False),
        sa.Column("degree_level", sa.String(20), nullable=False, server_default="UG"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("code"),
    )

    op.create_table(
        "curriculum",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("course_code", sa.String(20), nullable=False),
        sa.Column("course_name", sa.String(255), nullable=False),
        sa.Column("credits", sa.Float(), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("lecture_hours", sa.Integer(), server_default="0"),
        sa.Column("tutorial_hours", sa.Integer(), server_default="0"),
        sa.Column("practical_hours", sa.Integer(), server_default="0"),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("department", sa.String(100), server_default=""),
        sa.Column("program_id", sa.Integer(), sa.ForeignKey("programs.id"), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("batch_year", sa.Integer(), nullable=False),
        sa.Column("source_url", sa.String(500), nullable=False, server_default=""),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "course_code", "program_id", "batch_year", "semester",
            name="uq_curriculum_course_program_batch_sem"
        ),
        sa.CheckConstraint(
            "category IN ('Core', 'Elective', 'Lab', 'Audit')",
            name="ck_curriculum_category"
        ),
        sa.CheckConstraint("credits > 0", name="ck_curriculum_credits_positive"),
        sa.CheckConstraint(
            "semester BETWEEN 1 AND 12",
            name="ck_curriculum_semester_range"
        ),
        sa.CheckConstraint(
            "batch_year BETWEEN 2000 AND 2100",
            name="ck_curriculum_batch_year_range"
        ),
    )

    op.create_index("ix_curriculum_program_semester", "curriculum", ["program_id", "semester"])
    op.create_index("ix_curriculum_program_semester_category", "curriculum", ["program_id", "semester", "category"])
    op.create_index("ix_curriculum_batch_program_semester", "curriculum", ["batch_year", "program_id", "semester"])
    op.create_index("ix_curriculum_course_code_program", "curriculum", ["course_code", "program_id"])
    op.create_index("ix_curriculum_category_semester", "curriculum", ["category", "semester"])

    op.execute(
        "CREATE INDEX ix_curriculum_course_name_fts ON curriculum "
        "USING gin (to_tsvector('english', course_name))"
    )

    op.create_table(
        "course_relationships",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("course_code", sa.String(20), nullable=False),
        sa.Column("related_course_code", sa.String(20), nullable=False),
        sa.Column("relationship_type", sa.String(30), nullable=False),
        sa.Column("program_id", sa.Integer(), sa.ForeignKey("programs.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "course_code", "related_course_code", "relationship_type", "program_id",
            name="uq_course_relationship"
        ),
        sa.CheckConstraint(
            "relationship_type IN ('prerequisite_of', 'lab_companion', 'corequisite_of', 'related_to')",
            name="ck_relationship_type"
        ),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("table_name", sa.String(50), nullable=False),
        sa.Column("record_id", sa.Integer(), nullable=False),
        sa.Column("action", sa.String(10), nullable=False),
        sa.Column("old_values", sa.Text(), server_default=""),
        sa.Column("new_values", sa.Text(), server_default=""),
        sa.Column("performed_by", sa.String(100), server_default="system"),
        sa.Column("performed_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index("ix_audit_log_table_record", "audit_log", ["table_name", "record_id"])
    op.create_index("ix_audit_log_performed_at", "audit_log", ["performed_at"])


def downgrade() -> None:
    op.drop_table("audit_log")
    op.drop_table("course_relationships")
    op.drop_table("curriculum")
    op.drop_table("programs")
