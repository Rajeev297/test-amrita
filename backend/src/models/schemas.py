from datetime import datetime
from pydantic import BaseModel, Field


class ProgramOut(BaseModel):
    id: int
    name: str
    code: str
    duration: int
    total_semesters: int
    total_credits_required: int
    degree_level: str
    is_active: bool

    class Config:
        from_attributes = True


class CourseOut(BaseModel):
    id: int
    course_code: str
    course_name: str
    credits: float
    category: str
    lecture_hours: int = 0
    tutorial_hours: int = 0
    practical_hours: int = 0
    description: str = ""
    department: str = ""
    program_id: int
    program_name: str = ""
    semester: int
    batch_year: int
    source_url: str = ""
    is_active: bool = True

    class Config:
        from_attributes = True


class CourseRelationshipOut(BaseModel):
    course_code: str
    related_course_code: str
    relationship_type: str

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    course_code: str = Field(..., min_length=1, max_length=20)
    course_name: str = Field(..., min_length=1, max_length=255)
    credits: float = Field(..., gt=0)
    category: str = Field(..., pattern=r"^(Core|Elective|Lab|Audit)$")
    lecture_hours: int = 0
    tutorial_hours: int = 0
    practical_hours: int = 0
    description: str = ""
    department: str = ""
    program_id: int
    semester: int = Field(..., ge=1, le=12)
    batch_year: int = Field(..., ge=2000, le=2100)
    source_url: str = ""


class CourseUpdate(BaseModel):
    course_code: str | None = None
    course_name: str | None = None
    credits: float | None = None
    category: str | None = None
    lecture_hours: int | None = None
    tutorial_hours: int | None = None
    practical_hours: int | None = None
    description: str | None = None
    department: str | None = None
    program_id: int | None = None
    semester: int | None = None
    batch_year: int | None = None
    source_url: str | None = None
    is_active: bool | None = None


class CurriculumDiff(BaseModel):
    batch_year_old: int
    batch_year_new: int
    program_id: int
    added: list[CourseOut] = []
    removed: list[CourseOut] = []
    changed: list[dict] = []


class SearchResult(BaseModel):
    query: str
    results: list[CourseOut]
    total: int
    match_type: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    answer: str
    courses: list[CourseOut] = []
    sql_query: str = ""
    source: dict | None = None


class CategoryBreakdown(BaseModel):
    category: str
    count: int
    total_credits: float


class SemesterBreakdown(BaseModel):
    semester: int
    total_courses: int
    total_credits: float
    categories: list[CategoryBreakdown]


class AggregatedReport(BaseModel):
    program_name: str
    program_code: str
    total_courses: int
    total_credits: float
    semester_breakdown: list[SemesterBreakdown]


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ExportResponse(BaseModel):
    program: ProgramOut
    courses: list[CourseOut]
    generated_at: str
