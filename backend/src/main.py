from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.routes.auth_routes import router as auth_router
from src.routes.program_routes import router as program_router
from src.routes.course_routes import router as course_router
from src.routes.chat_routes import router as chat_router

app = FastAPI(
    title="Amrita Curriculum Chatbot API",
    description="AI-powered curriculum information system for Amrita Vishwa Vidyapeetham",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(program_router, prefix=settings.api_prefix)
app.include_router(course_router, prefix=settings.api_prefix)
app.include_router(chat_router, prefix=settings.api_prefix)


@app.get("/")
def root():
    return {
        "service": "Amrita Curriculum Chatbot API",
        "version": "1.0.0",
        "docs": f"{settings.api_prefix}/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
