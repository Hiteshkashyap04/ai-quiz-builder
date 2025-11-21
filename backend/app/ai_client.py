import os
import json
import requests
import traceback

USE_OFFLINE_FALLBACK = os.getenv("USE_OFFLINE_FALLBACK", "false").lower() in ("1", "true", "yes")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "mistral-small-latest")

def _mock_quiz(prompt: str, max_questions: int = 5):
    samples = [
        {"question": "Which city is the capital of France?", "options": ["Berlin","Paris","Rome","Madrid"], "answer": 1},
        {"question": "Which planet is known as the Red Planet?", "options": ["Earth","Mars","Jupiter","Venus"], "answer": 1},
        {"question": "What is the largest ocean on Earth?", "options": ["Atlantic","Indian","Pacific","Arctic"], "answer": 2},
        {"question": "Which language is primarily spoken in Brazil?", "options": ["Spanish","Portuguese","English","French"], "answer": 1},
        {"question": "Which country has the largest population?", "options": ["India","United States","China","Russia"], "answer": 2},
    ]
    return samples[:max_questions]

def generate_quiz_from_prompt(prompt: str, max_questions: int = 5):
    # offline fallback
    if USE_OFFLINE_FALLBACK or not MISTRAL_API_KEY:
        if not MISTRAL_API_KEY:
            print("⚠️ MISTRAL_API_KEY not set; using mock quiz.")
        return _mock_quiz(prompt, max_questions)

    try:
        url = "https://api.mistral.ai/v1/chat/completions"  # Mistral-like endpoint
        headers = {
            "Authorization": f"Bearer {MISTRAL_API_KEY}",
            "Content-Type": "application/json",
        }
        system_prompt = (
            "You are a quiz generator. Reply ONLY with a JSON array of objects. "
            "Each object must contain: 'question' (string), 'options' (array of 4 strings), 'answer' (0-3 index)."
        )
        user_prompt = f"Create {max_questions} multiple-choice questions about: {prompt}"

        payload = {
            "model": MISTRAL_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 700,
        }

        r = requests.post(url, headers=headers, json=payload, timeout=20)
        r.raise_for_status()
        data = r.json()

        # extract text (various providers format differently)
        text = None
        try:
            text = data["choices"][0]["message"]["content"]
        except Exception:
            # try older fields:
            try:
                text = data["choices"][0]["text"]
            except Exception:
                text = json.dumps(data)

        # Try parse JSON directly
        try:
            parsed = json.loads(text)
            if isinstance(parsed, list):
                return parsed
        except Exception:
            # extract first [...] block
            start = text.find("[")
            end = text.rfind("]")
            if start != -1 and end != -1 and end > start:
                maybe = text[start:end+1]
                try:
                    parsed = json.loads(maybe)
                    return parsed
                except Exception:
                    pass

        # fallback: return raw text wrapped
        return [
            {
                "question": "AI returned unexpected format. See raw output first option",
                "options": [text[:250], "", "", ""],
                "answer": 0
            }
        ]

    except Exception as e:
        print("⚠️ AI call failed — falling back to mock. Error:", e)
        traceback.print_exc()
        return _mock_quiz(prompt, max_questions)
