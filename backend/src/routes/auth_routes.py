from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from src.auth.jwt import create_access_token, verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

USERS_DB = {
    "admin": {
        "username": "admin",
        "password": get_password_hash("admin123"),
        "role": "admin",
        "name": "Administrator",
    },
    "curriculum_manager": {
        "username": "curriculum_manager",
        "password": get_password_hash("cm123"),
        "role": "curriculum_manager",
        "name": "Curriculum Manager",
    },
}


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    user = USERS_DB.get(request.username)
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token({
        "sub": user["username"],
        "role": user["role"],
        "name": user["name"],
    })

    return LoginResponse(
        access_token=token,
        role=user["role"],
        name=user["name"],
    )
