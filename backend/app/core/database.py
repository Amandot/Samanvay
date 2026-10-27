from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

@compiles(UUID, "sqlite")
def compile_uuid_sqlite(type_, compiler, **kw):
    return "CHAR(36)"

import urllib.parse


def normalize_db_url(url: str) -> str:
    url = url.strip().strip('"').strip("'")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # Automatically URL-encode special characters in passwords (e.g. '@' in passwords)
    if url.count("@") > 1 and "://" in url:
        prefix, rest = url.split("://", 1)
        last_at_idx = rest.rfind("@")
        user_pass = rest[:last_at_idx]
        host_db = rest[last_at_idx + 1:]
        if ":" in user_pass:
            username, password = user_pass.split(":", 1)
            password = urllib.parse.quote_plus(urllib.parse.unquote_plus(password))
            url = f"{prefix}://{username}:{password}@{host_db}"
    return url


db_url = normalize_db_url(settings.DATABASE_URL)

engine_kwargs = {}
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL (Supabase, Render Postgres, AWS RDS, etc.)
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    if "localhost" not in db_url and "127.0.0.1" not in db_url and "sslmode" not in db_url:
        connect_args["sslmode"] = "require"

engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
