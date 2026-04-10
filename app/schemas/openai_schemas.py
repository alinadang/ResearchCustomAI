from pydantic import BaseModel

class DefaultLLMOutput(BaseModel):
    """
    Default output format for LLM response.
    """
    output_text: str