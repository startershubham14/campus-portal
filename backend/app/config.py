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

    # Comma-separated list of allowed frontend origins for CORS.
    # Local default covers Vite; in production set this to your Vercel URL, e.g.
    #   FRONTEND_ORIGINS=https://campus-portal.vercel.app
    FRONTEND_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins(self) -> list[str]:
        """Parse the comma-separated origins into a clean list."""
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]

    @property
    def cookie_samesite(self) -> str:
        """
        In production the frontend (Vercel) and backend (EC2/DuckDNS) are on
        different sites, so the auth cookie must be SameSite=None to be sent
        cross-site. None REQUIRES Secure=True, which we have over HTTPS.
        Locally we stay on Lax (same-site, more CSRF-resistant).
        """
        return "none" if self.IS_PRODUCTION else "lax"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()