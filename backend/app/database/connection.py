
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# 1. Create the async engine
# echo=True prints out all the generated SQL in your terminal (for debugging!) later turn to false
engine = create_async_engine(settings.DATABASE_URL, echo=False)

# 2. Create the async session factory
# This will be used to spawn database sessions for every API request
AsyncSessionLocal = async_sessionmaker(
    bind=engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

# 3. Create the Base class for our models
# All our database tables (User, StudentProfile, etc.) will inherit from this
Base = declarative_base()

# 4. Dependency to get the DB session
# We will inject this into our FastAPI routes
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()