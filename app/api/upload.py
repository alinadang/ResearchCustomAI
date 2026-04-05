import os
import uuid
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = "uploads"
MAX_FILES = 20  # Limit to 20 files per upload
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/files")
async def upload_files(
    files: List[UploadFile] = File(default=[], description="Select up to 20 files (optional)")
):
    # No files sent
    if not files or files[0].filename == "":
        return {"message": "No files uploaded.", "uploaded": []}

    if len(files) > MAX_FILES:
        raise HTTPException(
            status_code=422,
            detail=f"Too many files — max is {MAX_FILES}."
        )

    uploaded = []
    for file in files:
        data = await file.read()

        if len(data) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"'{file.filename}' exceeds the 20 MB limit."
            )

        ext = os.path.splitext(file.filename)[1]
        saved_name = f"{uuid.uuid4().hex}{ext}"
        with open(os.path.join(UPLOAD_DIR, saved_name), "wb") as f:
            f.write(data)

        uploaded.append({
            "original_name": file.filename,
            "saved_as": saved_name,
            "size_bytes": len(data),
        })

    return {
        "message": f"{len(uploaded)} file(s) uploaded successfully.",
        "uploaded": uploaded,
    }