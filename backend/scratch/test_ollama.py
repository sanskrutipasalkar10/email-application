import ollama
import json

try:
    response = ollama.list()
    print("Raw Response:")
    print(response)
    # The response is likely a ListResponse object which has a 'models' attribute
    # or it might be a dictionary depending on the version.
    if hasattr(response, 'models'):
        print("\nAvailable Models (via attribute):")
        for model in response.models:
            print(f"- {model.model}")
    elif isinstance(response, dict) and 'models' in response:
        print("\nAvailable Models (via dict):")
        for model in response['models']:
            print(f"- {model.get('name') or model.get('model')}")
except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
