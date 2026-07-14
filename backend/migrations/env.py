import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.config import settings
from app.database.connection import Base
from app.database import models  # noqa: F401 - registers all tables with Base.metadata

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what enables `alembic revision --autogenerate` to detect
# what changed between your SQLAlchemy models and the actual DB schema.
target_metadata = Base.metadata


def get_url() -> str:
    # Read from .env via pydantic settings - never hardcode credentials.
    # asyncpg is the right async driver; Alembic handles it via run_sync below.
    return settings.DATABASE_URL


def run_migrations_offline() -> None:
    """
    Generate SQL without connecting to the DB.
    Useful for reviewing migrations or deploying manually.

    Usage: alembic upgrade head --sql > migration.sql
    """
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        # Detect column type changes (e.g. Integer → UUID)
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Connect to PostgreSQL via asyncpg and run migrations."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        # run_sync bridges async connection → sync Alembic migration runner
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()