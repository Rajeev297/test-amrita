from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.schemas import ProgramOut

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.get("", response_model=list[ProgramOut])
def list_programs(db: Session = Depends(get_db)):
    from sqlalchemy import text
    rows = db.execute(
        text("SELECT * FROM programs WHERE is_active = true ORDER BY code")
    ).all()
    return [
        ProgramOut(
            id=r.id, name=r.name, code=r.code, duration=r.duration,
            total_semesters=r.total_semesters,
            total_credits_required=r.total_credits_required,
            degree_level=r.degree_level, is_active=r.is_active,
        )
        for r in rows
    ]


@router.get("/{program_id}", response_model=ProgramOut)
def get_program(program_id: int, db: Session = Depends(get_db)):
    from sqlalchemy import text
    row = db.execute(
        text("SELECT * FROM programs WHERE id = :pid AND is_active = true"),
        {"pid": program_id},
    ).one_or_none()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Program not found")
    return ProgramOut(
        id=row.id, name=row.name, code=row.code, duration=row.duration,
        total_semesters=row.total_semesters,
        total_credits_required=row.total_credits_required,
        degree_level=row.degree_level, is_active=row.is_active,
    )
