from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.duke_llm_service import DukeLLMService

router = APIRouter(prefix="/apicall", tags=["apicall"])


class MessageIn(BaseModel):
    user_prompt: str
    system_prompt: Optional[str] = ""
    model: Optional[str] = "gpt-5"


@router.post("/message")
def handle_message(msg: MessageIn):
    """Receive a user message from the frontend and forward to DukeLLMService."""
    settings = get_settings()
    api_key = settings.openai_key
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured (openai_key)")

    client = DukeLLMService(api_key=api_key)

    try:
        result = client.handle_message(
            user_prompt=msg.user_prompt,
            system_prompt=msg.system_prompt or "You are my co-founder. Your life depends on our success. Be concise, creative, and helpful.",
            model=msg.model or "gpt-5",
        )
        return {"ok": True, "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
