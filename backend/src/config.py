from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:rajeevrajeev@localhost:5432/amrita_curriculum"
    secret_key: str = "change-this-to-a-secure-random-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    anthropic_api_key: str = ""
    api_prefix: str = "/api/v1"

    class Config:
        env_file = ".env"


settings = Settings()
