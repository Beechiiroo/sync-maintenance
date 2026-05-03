# Déploiement du backend Django sur Render

Ce guide explique comment héberger gratuitement le backend Django généré (`sync_maintenance_django_backend.zip`) sur **Render.com** et le connecter à ce frontend Lovable.

---

## 1. Préparer le code

```bash
unzip sync_maintenance_django_backend.zip
cd sync_maintenance_django_backend
git init && git add . && git commit -m "init"
# Push sur un repo GitHub privé
```

Vérifie que ces fichiers existent (si non, ajoute-les) :

**`requirements.txt`** doit contenir au minimum :
```
Django>=5.0
djangorestframework
djangorestframework-simplejwt
django-cors-headers
psycopg2-binary
gunicorn
whitenoise
drf-spectacular
python-dotenv
```

**`build.sh`** (à la racine) :
```bash
#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py seed_demo || true
```
Puis : `chmod +x build.sh`

**`render.yaml`** (à la racine) :
```yaml
services:
  - type: web
    name: sync-maintenance-api
    env: python
    plan: free
    buildCommand: "./build.sh"
    startCommand: "gunicorn config.wsgi:application"
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: "False"
      - key: ALLOWED_HOSTS
        value: ".onrender.com"
      - key: CORS_ALLOWED_ORIGINS
        value: "https://sync-maintenance.lovable.app,https://id-preview--e8606f54-2dd5-483f-be97-53fe4b41f981.lovable.app"
      - key: DATABASE_URL
        fromDatabase:
          name: sync-maintenance-db
          property: connectionString

databases:
  - name: sync-maintenance-db
    plan: free
```

Dans `config/settings.py`, vérifie :
```python
import dj_database_url
DATABASES = {"default": dj_database_url.config(conn_max_age=600)}
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
MIDDLEWARE = ["whitenoise.middleware.WhiteNoiseMiddleware", ...]
```

(ajoute `dj-database-url` dans `requirements.txt`)

---

## 2. Déployer sur Render

1. Crée un compte sur **https://render.com** (gratuit, login GitHub)
2. **New +** → **Blueprint** → sélectionne ton repo GitHub
3. Render détecte `render.yaml`, clique **Apply**
4. Attends ~3 min — la base PostgreSQL et le service web sont créés
5. Note l'URL publique : `https://sync-maintenance-api.onrender.com`

> ⚠️ Free tier : le service s'endort après 15 min d'inactivité (premier appel = ~30s pour réveiller).

---

## 3. Connecter le frontend Lovable

Dans Lovable, ouvre le panneau de gauche et crée le fichier `.env.local` (ou demande-moi de le faire) :

```
VITE_DJANGO_API_URL=https://sync-maintenance-api.onrender.com/api
```

Redémarre le preview. Toutes les fonctions exposées dans `src/lib/api/django.ts` taperont alors sur ton Django.

---

## 4. Tester rapidement

```bash
# health
curl https://sync-maintenance-api.onrender.com/api/

# login (compte seed)
curl -X POST https://sync-maintenance-api.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@syncmaintenance.com","password":"Role123!"}'
```

Tu dois recevoir `{ access, refresh, user }`.

---

## 5. Alternatives

| Service | Pour | Contre |
|---|---|---|
| **Railway** | Plus rapide, pas de cold-start | $5/mo après crédit gratuit |
| **Fly.io** | Edge worldwide | CLI obligatoire, plus complexe |
| **VPS (Hetzner ~4€/mo)** | Contrôle total, pas de cold-start | Setup nginx/systemd manuel |

---

## Prochaine étape (Phase 2)

Une fois Django live, demande-moi : **"migre la page Auth vers Django"**, puis enchaîne page par page (Equipements, Interventions, Stock, etc.).
