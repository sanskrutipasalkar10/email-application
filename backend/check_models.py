import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env file")
else:
    genai.configure(api_key=api_key)
    print(f"API Key found: {api_key[:5]}...{api_key[-5:]}")
    print("\nListing available models for this key...\n")
    
    try:
        models = genai.list_models()
        found_any = False
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
                found_any = True
        
        if not found_any:
            print("⚠️ No models found that support 'generateContent'. Check if your API key has the correct permissions.")
            
    except Exception as e:
        print(f"❌ Error listing models: {e}")