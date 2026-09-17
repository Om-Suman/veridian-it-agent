import os
from dotenv import load_dotenv
import httpx

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY", "").strip().strip('"').strip("'")

print("=" * 50)
print("VERIDIAN IT AGENT — GEMINI API VERIFICATION")
print("=" * 50)

if not api_key:
    print("[RESULT] ❌ No GEMINI_API_KEY found in .env file.")
    print("The system is currently running on the 100% OFFLINE DETERMINISTIC ENGINE.")
else:
    masked_key = api_key[:6] + "..." + api_key[-4:] if len(api_key) > 10 else "***"
    print(f"Key detected: {masked_key}")
    print("Testing connection to Google Gemini 1.5 Flash...")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Classify intent for IT helpdesk: 'I forgot my password'. Return JSON: {\"intent\": \"PASSWORD_RESET\"}"}]}],
        "generationConfig": {"temperature": 0.0, "responseMimeType": "application/json"}
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.post(url, json=payload)
            if res.status_code == 200:
                print("\n[RESULT] [SUCCESS] LIVE GEMINI LLM IS WORKING!")
                print(f"Status Code: {res.status_code}")
                print(f"Gemini Output: {res.json()['candidates'][0]['content']['parts'][0]['text'].strip()}")
                print("Your project is actively powered by Gemini 1.5 Flash.")
            else:
                print(f"\n[RESULT] [WARNING] Gemini returned status {res.status_code}:")
                print(res.text)
                print("The system will safely fall back to the offline deterministic engine.")
    except Exception as e:
        print(f"\n[RESULT] [WARNING] Connection error: {e}")
        print("The system will safely fall back to the offline deterministic engine.")

print("=" * 50)
