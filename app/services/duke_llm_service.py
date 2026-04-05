from openai import OpenAI
from pydantic import BaseModel
from app.schemas import openai_schemas

"""
Service used primarily to interact with the OpenAI API
and OpenAI's various models via Duke LiteLLM
hosted OpenAI models and API functionality.
"""
class DukeLLMService:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key, base_url="https://litellm.oit.duke.edu/v1")

    def list_models(self):
        """List available models from the LiteLLM/OpenAI-compatible endpoint."""
        try:
            res = self.client.models.list()
            data = getattr(res, "data", None) or res
            models = []
            for m in data:
                # m may be an object with `id` attr or a dict
                if hasattr(m, "id"):
                    models.append(m.id)
                elif isinstance(m, dict) and "id" in m:
                    models.append(m["id"])
                else:
                    models.append(m)
            return models
        except Exception as e:
            return {"error": str(e)}

    #def handle_message(self, user_prompt: str, response_format: type[BaseModel] = openai_schemas.DefaultLLMOutput, system_prompt: str = ""):
    def handle_message(self, user_prompt: str, response_format: type[BaseModel] = openai_schemas.DefaultLLMOutput, system_prompt: str = "", model: str = "gpt-5"):
        response = self.client.responses.parse(
            model=model,
            input=[
                {
                    "role": "system", 
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            text_format=response_format
        )
        return { "input message" : user_prompt, "response" : response.output_parsed }