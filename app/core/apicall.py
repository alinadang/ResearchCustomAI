"""
Simple runner demonstrating how to call the Duke LiteLLM (OpenAI-compatible)
endpoint using the `DukeLLMService` in this repo.

Usage:
	python -m app.core.apicall

It lists available models and sends a short test prompt.
"""
from app.core.config import get_settings
from app.services.duke_llm_service import DukeLLMService


def main():
	settings = get_settings()
	api_key = settings.openai_key
	if not api_key:
		raise RuntimeError("OPENAI key not set in environment (openai_key)")

	client = DukeLLMService(api_key=api_key)

	print("Listing models from LiteLLM endpoint...")
	models = client.list_models()
	print(models)

	print("Sending a test prompt...")
	result = client.handle_message(
		user_prompt="Say hello concisely to Duke LiteLLM from the repo example.",
		system_prompt="You are a concise assistant."
	)
	print(result)


if __name__ == "__main__":
	main()
