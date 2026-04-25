from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Tythys API Revenue Guard"
    app_version: str = "0.1.0"
    backend_service_mode: str = Field(default="demo")
    ingest_api_key: str = Field(default="dev-ingest-key")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
