from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.connection import engine, Base
from app.database import models  
from app.auth.router import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.student import router as student_router
from app.routers.faculty import router as faculty_router
from app.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
# Alembic manages the schema.
@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


# Initialize the FastAPI app with the lifespan event
app = FastAPI(
    title="College CMS API",
    description="Backend API for the College Management System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS origins come from settings (env-driven), so production can allow the
# Vercel URL without a code change. allow_credentials=True is required for
# the auth cookie to be sent cross-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter

# Register our authentication endpoints to the app
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(faculty_router)
app.include_router(student_router)
# A simple root endpoint to verify the server is running
@app.get("/")
async def root():
    return {"message": "Welcome to the College CMS API! The server is running successfully."}