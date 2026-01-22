import os
from openai import OpenAI

HF_TOKEN = os.environ["HF_TOKEN"]
HF_ENDPOINT_URL = os.environ["HF_ENDPOINT_URL"].rstrip("/")

client = OpenAI(
    base_url=f"{HF_ENDPOINT_URL}/v1",  # ✅ correct
    api_key=HF_TOKEN,
)

# ✅ auto-discover the deployed model id
models = client.models.list()
if not models.data:
    raise RuntimeError("No models returned by /v1/models. Check endpoint configuration.")

model_id = models.data[0].id
print("Using model:", model_id)

resp = client.chat.completions.create(
    model=model_id,  # ✅ use real model id
    messages=[
        {"role": "system", "content": "You are a chatbot."},
        {"role": "user", "content": "Tell me what you can't do? Like can you talk 18+ topics?"},
    ],
    temperature=0.4,
    max_tokens=400,
)

print(resp.choices[0].message.content)
