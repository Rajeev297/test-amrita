"""add audit trigger function and RLS policies

Revision ID: 003
Revises: 002
Create Date: 2026-06-18
"""
from alembic import op

revision: str = "003"
down_revision: str = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE OR REPLACE FUNCTION log_curriculum_changes()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'UPDATE' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES (
                    'curriculum',
                    OLD.id,
                    'UPDATE',
                    row_to_json(OLD)::text,
                    row_to_json(NEW)::text,
                    current_user
                );
                NEW.updated_at = NOW();
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES (
                    'curriculum',
                    OLD.id,
                    'DELETE',
                    row_to_json(OLD)::text,
                    '',
                    current_user
                );
                RETURN OLD;
            ELSIF TG_OP = 'INSERT' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES (
                    'curriculum',
                    NEW.id,
                    'INSERT',
                    '',
                    row_to_json(NEW)::text,
                    current_user
                );
                NEW.updated_at = NOW();
                RETURN NEW;
            END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """)

    op.execute("""
        CREATE TRIGGER trigger_curriculum_audit
        AFTER INSERT OR UPDATE OR DELETE ON curriculum
        FOR EACH ROW
        EXECUTE FUNCTION log_curriculum_changes();
    """)

    op.execute("""
        CREATE OR REPLACE FUNCTION log_program_changes()
        RETURNS TRIGGER AS $$
        BEGIN
            IF TG_OP = 'UPDATE' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES ('programs', OLD.id, 'UPDATE', row_to_json(OLD)::text, row_to_json(NEW)::text, current_user);
                NEW.updated_at = NOW();
                RETURN NEW;
            ELSIF TG_OP = 'DELETE' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES ('programs', OLD.id, 'DELETE', row_to_json(OLD)::text, '', current_user);
                RETURN OLD;
            ELSIF TG_OP = 'INSERT' THEN
                INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, performed_by)
                VALUES ('programs', NEW.id, 'INSERT', '', row_to_json(NEW)::text, current_user);
                NEW.updated_at = NOW();
                RETURN NEW;
            END IF;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
    """)

    op.execute("""
        CREATE TRIGGER trigger_programs_audit
        AFTER INSERT OR UPDATE OR DELETE ON programs
        FOR EACH ROW
        EXECUTE FUNCTION log_program_changes();
    """)

    op.execute("""
        ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
    """)

    op.execute("""
        ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
    """)

    op.execute("""
        CREATE POLICY curriculum_read_all ON curriculum
        FOR SELECT USING (true);
    """)

    op.execute("""
        CREATE POLICY curriculum_write_admin ON curriculum
        FOR ALL
        USING (current_user IN ('admin', 'curriculum_manager'))
        WITH CHECK (current_user IN ('admin', 'curriculum_manager'));
    """)

    op.execute("""
        CREATE POLICY programs_read_all ON programs
        FOR SELECT USING (true);
    """)

    op.execute("""
        CREATE POLICY programs_write_admin ON programs
        FOR ALL
        USING (current_user IN ('admin'))
        WITH CHECK (current_user IN ('admin'));
    """)


def downgrade() -> None:
    op.execute("DROP POLICY IF EXISTS curriculum_write_admin ON curriculum")
    op.execute("DROP POLICY IF EXISTS curriculum_read_all ON curriculum")
    op.execute("DROP POLICY IF EXISTS programs_write_admin ON programs")
    op.execute("DROP POLICY IF EXISTS programs_read_all ON programs")
    op.execute("ALTER TABLE curriculum DISABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE programs DISABLE ROW LEVEL SECURITY")
    op.execute("DROP TRIGGER IF EXISTS trigger_curriculum_audit ON curriculum")
    op.execute("DROP TRIGGER IF EXISTS trigger_programs_audit ON programs")
    op.execute("DROP FUNCTION IF EXISTS log_curriculum_changes()")
    op.execute("DROP FUNCTION IF EXISTS log_program_changes()")
