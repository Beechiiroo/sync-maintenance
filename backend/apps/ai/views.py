import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

SYSTEM_PROMPTS = {
    "fr": "Tu es un assistant expert en maintenance industrielle (GMAO). Réponds en français de manière concise, professionnelle et actionnable.",
    "en": "You are an expert industrial maintenance assistant (CMMS). Reply in English concisely and actionably.",
    "ar": "أنت مساعد خبير في الصيانة الصناعية. أجب بالعربية بشكل موجز ومهني.",
}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    messages = request.data.get("messages", [])
    language = request.data.get("language", "fr")
    if not settings.LOVABLE_API_KEY:
        return Response({"error": "LOVABLE_API_KEY not configured"}, status=500)
    payload = {
        "model": settings.DEFAULT_AI_MODEL,
        "messages": [{"role":"system","content": SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS["fr"])}, *messages],
        "stream": False,
    }
    try:
        r = requests.post(
            settings.LOVABLE_AI_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.LOVABLE_API_KEY}", "Content-Type": "application/json"},
            timeout=60,
        )
        if r.status_code == 429:
            return Response({"error":"Rate limit exceeded"}, status=429)
        if r.status_code == 402:
            return Response({"error":"Payment required"}, status=402)
        if not r.ok:
            return Response({"error":"AI gateway error","detail":r.text}, status=500)
        data = r.json()
        content = data.get("choices",[{}])[0].get("message",{}).get("content","")
        return Response({"content": content})
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=502)
