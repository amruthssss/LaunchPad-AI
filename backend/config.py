from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI Startup Factory"
    openai_api_key: str = ""
    tavily_api_key: str = ""
    database_url: str = "postgresql+psycopg2://postgres:postgres@postgres:5432/aistartup"
    redis_url: str = "redis://redis:6379/0"
    chromadb_host: str = "chromadb"
    github_token: str = ""
    notion_token: str = ""
    slack_webhook_url: str = ""
    smtp_host: str = ""
    smtp_user: str = ""
    smtp_password: str = ""
    mlflow_tracking_uri: str = "http://mlflow:5000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
