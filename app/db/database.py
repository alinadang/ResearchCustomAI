from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings

# Creates the SQLAlchemy database engine and session
settings = get_settings()
postgres_url = settings.postgres_url
engine = create_engine(
    postgres_url, 
    pool_pre_ping=True
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