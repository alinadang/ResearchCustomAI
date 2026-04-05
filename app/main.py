from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from app.api.upload import router as upload_router

app = FastAPI(title="Custom AI Research Assistant")
app.include_router(upload_router)


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