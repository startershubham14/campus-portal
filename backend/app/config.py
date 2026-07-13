from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # AWS S3 - used for presigned upload URLs
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "ap-south-1"
    S3_BUCKET_NAME: str

    # Environment - controls secure cookie flag
    # Set IS_PRODUCTION=True on EC2, leave False locally
    IS_PRODUCTION: bool = False

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()