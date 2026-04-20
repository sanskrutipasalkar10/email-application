import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"API Key: {GEMINI_API_KEY}")

try:
    client = genai.Client(api_key=GEMINI_API_KEY)
    response = client.models.generate_content(
        model="gemini-2.0-flash", 
        contents="Hello, how are you?"
    )
    print("Response:")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
