from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database import get_db
from src.models.schemas import ChatRequest, ChatResponse
from src.services.chat_service import natural_language_query, validate_response

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def chat_query(
    request: ChatRequest,
    db: Session = Depends(get_db),
):
    result = natural_language_query(db, request.query)

    validation = validate_response(db, result.get("courses", []))

    return ChatResponse(
        answer=result.get("answer", ""),
        courses=result.get("courses", []),
        sql_query=result.get("sql_query", ""),
        source=result.get("source"),
    )
