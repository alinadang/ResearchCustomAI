from fastapi import Depends, Request, HTTPException
from app.core.config import get_settings
from app.db.database import get_db
import logging

# LOGGER FOR TESTING
logger = logging.getLogger(__name__)

# Database dependency
db_dependency = Depends(get_db)

# Settings dependency (this is used in endpoints)
settings_dependency = Depends(get_settings)