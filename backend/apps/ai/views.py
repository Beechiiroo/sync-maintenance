import re
import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

SYSTEM_PROMPTS = {
    "fr": "Tu es un assistant expert en maintenance industrielle (GMAO). Réponds en français de manière concise, professionnelle et actionnable.",
    "en": "You are an expert industrial maintenance assistant (CMMS). Reply in English concisely and actionably.",
    "ar": "أنت مساعد خبير في الصيانة الصناعية. أجب بالعربية بشكل موجز ومهني.",
}

MAX_MESSAGES = 30
MAX_CONTENT_LEN = 4000
ALLOWED_ROLES = {"system", "user", "assistant"}
_HTML_RE = re.compile(r"<\s*/?\s*(script|iframe|object|embed|style)[^>]*>", re.IGNORECASE)


class AIThrottle(ScopedRateThrottle):
    scope = "ai"


def _sanitize(messages):
    if not isinstance(messages, list) or not messages:
        return None, "messages required"
    if len(messages) > MAX_MESSAGES:
        return None, f"too many messages (max {MAX_MESSAGES})"
    out = []
    for m in messages:
        if not isinstance(m, dict):
            return None, "invalid message"
        role = m.get("role")
        content = m.get("content", "")
        if role not in ALLOWED_ROLES or not isinstance(content, str):
            return None, "invalid message format"
        if len(content) > MAX_CONTENT_LEN:
            return None, f"content too long (max {MAX_CONTENT_LEN})"
        # Strip dangerous HTML tags from user-supplied content
        if role != "system":
            content = _HTML_RE.sub("", content)
        out.append({"role": role, "content": content})
    return out, None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AIThrottle])
def chat(request):
    messages, err = _sanitize(request.data.get("messages"))
    if err:
        return Response({"error": err}, status=400)
    language = request.data.get("language", "fr")
    if language not in SYSTEM_PROMPTS:
        language = "fr"
    if not settings.LOVABLE_API_KEY:
        return Response({"error": "AI service not configured"}, status=503)
    payload = {
        "model": settings.DEFAULT_AI_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPTS[language]}, *messages],
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
            return Response({"error": "Rate limit exceeded"}, status=429)
        if r.status_code == 402:
            return Response({"error": "Payment required"}, status=402)
        if not r.ok:
            return Response({"error": "AI gateway error"}, status=502)
        data = r.json()
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return Response({"content": content})
    except requests.RequestException:
        return Response({"error": "AI gateway unreachable"}, status=502)
