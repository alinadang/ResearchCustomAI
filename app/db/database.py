from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

# Creates the SQLAlchemy database engine and session
settings = get_settings()
db_url = settings.postgres_url or "sqlite:///./local.db"

# SQLite requires connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}

engine = create_engine(
    db_url, 
    pool_pre_ping=True,
    connect_args=connect_args
)

# SessionLocal here acts as a factory for creating a new
# SQLAlchemy session for requests, allowing us to use the session
# for all db operations.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models to inherit from
Base = declarative_base()

def get_db():
    """
    Dependency function to get a database session for a request.
    Ensures that the session is properly closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()