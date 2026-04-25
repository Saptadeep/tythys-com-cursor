from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tythys API Revenue Guard"
    app_version: str = "0.1.0"
    backend_service_mode: str = Field(default="demo")
    ingest_api_key: str = Field(default="dev-ingest-key")
    database_url: str | None = Field(default=None, description="Postgres DSN, e.g. postgresql+psycopg2://user:pass@host:5432/db")
    redis_url: str | None = Field(default=None, description="Optional Redis URL for future queues")
    bootstrap_db_schema: bool = Field(default=False, description="If true, create_all on startup (dev only)")
    revenue_value_per_success_usd: float = Field(default=0.02, description="Rough $ per successful request for impact model v1")
    rollup_interval_seconds: int = Field(default=30)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
