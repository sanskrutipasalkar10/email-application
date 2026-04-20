import ollama
import time

model = "qwen3-coder:480b-cloud"
prompt = "Hi, are you working? Please respond with 'YES' only."

try:
    print(f"Testing direct connection to Ollama with model {model}...")
    start_time = time.time()
    response = ollama.chat(model=model, messages=[{'role': 'user', 'content': prompt}])
    end_time = time.time()
    print(f"Response: {response['message']['content']}")
    print(f"Time taken: {end_time - start_time:.2f} seconds")
except Exception as e:
    print(f"Error: {e}")
