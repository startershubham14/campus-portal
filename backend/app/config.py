"""this file is for fetching the .env """
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """ class fetching config vars from .env """
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # This tells Pydantic to read variables from the .env file
    model_config = SettingsConfigDict(env_file=".env")

# Create a global settings object to import across the app
settings = Settings()
