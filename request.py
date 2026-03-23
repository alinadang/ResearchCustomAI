from openai import OpenAI

client = OpenAI(
    api_key= "DUKE_KEY",
    base_url="https://litellm.oit.duke.edu/v1"
)

response = client.chat.completions.create(
    model="gpt-4o-mini",  # or whatever model Duke enables
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain LiteLLM in one paragraph."}
    ],
)

print(response.choices[0].message.content)