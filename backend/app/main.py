from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database dependencies to create tables on startup
from app.database.connection import engine, Base
from app.database import models  # Importing models registers them with Base

# Import the authentication router we just created
from app.auth.router import router as auth_router
from app.limiter import limiter

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# This context manager handles startup (creating tables) and shutdown (closing connections)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: Dispose of the database engine safely
    await engine.dispose()

# Initialize the FastAPI app with the lifespan event
app = FastAPI(
    title="College CMS API",
    description="Backend API for the College Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"], # Allows all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["Authorization", "Content-Type"], 
)
app.add_middleware(SlowAPIMiddleware)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter

# Register our authentication endpoints to the app
app.include_router(auth_router)

# A simple root endpoint to verify the server is running
@app.get("/")
async def root():
    return {"message": "Welcome to the College CMS API! The server is running successfully."}