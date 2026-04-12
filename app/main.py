from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.upload import router as upload_router
from app.api.auth import router as auth_router
from app.api.apicall import router as apicall_router
from app.db.database import Base, engine
import app.db.models  # noqa: F401 – registers ORM models with Base

app = FastAPI(title="Custom AI Research Assistant")

# CORS — allow the Vite dev server to reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-create tables on startup (no-op if they already exist)
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(apicall_router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version="0.1.0",
        routes=app.routes,
    )

    # Fix Swagger UI bug: List[UploadFile] renders as array<string>.
    # Manually patch the schema so Swagger shows real file pickers.
    schema["paths"]["/upload/files"]["post"]["requestBody"] = {
        "content": {
            "multipart/form-data": {
                "schema": {
                    "type": "object",
                    "properties": {
                        "files": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "format": "binary"   # <-- this is the key
                            },
                            "description": "Select up to 15 files (optional)"
                        }
                    }
                }
            }
        }
    }

    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi