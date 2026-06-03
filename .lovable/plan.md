## Objectif

Rendre toutes les fonctionnalités du site opérationnelles (backend Django + Supabase Cloud, frontend React) en **10 itérations** courtes et livrables. Chaque itération est un message séparé, testable indépendamment.

Vu l'ampleur (~50 pages, 12 tables, 2 backends), tenter "tout en une fois" garantirait régressions et casse. Je propose un découpage par domaine métier.

---

## Découpage des 10 itérations

| # | Périmètre | Livrable |
|---|-----------|----------|
| **1** | **Équipements** — CRUD complet | Modale create/edit/delete branchée sur Supabase + Django, upload image, filtres, recherche, i18n FR/EN/AR |
| **2** | **Interventions** — CRUD + workflow | Création depuis équipement, assignation technicien, transitions de statut (planned→in_progress→completed), notes/photos, i18n |
| **3** | **Maintenance préventive** — Planning | Génération auto des prochaines échéances, marquage "fait", calendrier, notifications, i18n |
| **4** | **Stock & Pièces détachées** — CRUD + mouvements | Entrées/sorties liées aux interventions, alertes seuil mini, QR codes, i18n |
| **5** | **Tickets** — Système support | Création par client, assignation, résolution, historique, i18n |
| **6** | **Contrats & SLA** — CRUD | Suivi échéances, score conformité, pénalités, alertes expiration, i18n |
| **7** | **Techniciens & Utilisateurs** — Gestion RH | CRUD profils, attribution rôles (admin only), photos, compétences, i18n |
| **8** | **Notifications & Messages** — Temps réel | Realtime Supabase, marquage lu, conversations 1-à-1, i18n |
| **9** | **Audit Logs & Sécurité** — Conformité | Log automatique des actions sensibles (triggers DB), filtres, export CSV, i18n |
| **10** | **Polish final** — QA + bugs | Tour complet par rôle (admin/tech/assistant/client), correction bugs, i18n des 15 pages analytiques restantes (Predictive, Eco, MII, etc.) |

---

## Architecture (détails techniques)

### Backend dual (Django + Supabase)
- **Supabase** = source de vérité runtime (RLS, realtime, auth, edge functions). Toutes les pages lisent/écrivent via `@/integrations/supabase/client`.
- **Django REST** = miroir optionnel pour exports/intégrations tierces. Le code reste dans `backend/` mais n'est PAS appelé par le frontend sauf demande explicite (ex: rapports lourds, ETL).
- `src/lib/api/django.ts` conservé en *fallback* derrière un flag `VITE_USE_DJANGO=false` par défaut.

### Patron CRUD réutilisable
Pour chaque module, créer :
```
src/features/<module>/
  ├── api.ts              // hooks React Query : useList, useCreate, useUpdate, useDelete
  ├── schema.ts           // Zod validation
  ├── components/
  │   ├── <Module>Form.tsx
  │   ├── <Module>Table.tsx
  │   └── <Module>DeleteDialog.tsx
  └── hooks/use<Module>.ts
```

### i18n
- Ajouter clés manquantes dans `fr.json` / `en.json` / `ar.json` au fur et à mesure de chaque itération (pas de big bang).
- Convention : `<module>.<section>.<key>` (ex: `equipment.form.serial_number`).

### Sécurité
- Toutes les mutations passent par RLS Supabase (déjà en place).
- Validation Zod côté client + côté edge function quand applicable.
- Audit log automatique via trigger DB sur les tables sensibles (itération 9).

### Realtime
- Activé sur `interventions`, `notifications`, `messages`, `tickets` (itération 8 — migration `ALTER PUBLICATION supabase_realtime ADD TABLE`).

---

## Cette itération (#1 — Équipements)

1. Créer `src/features/equipment/` (api, schema, form, table, delete dialog)
2. Refactor `src/pages/Equipements.tsx` : remplacer mocks par hooks React Query
3. Modale "Nouvel équipement" : nom, S/N, catégorie, localisation, fabricant, modèle, dates garantie, image (upload Supabase Storage)
4. Édition inline + suppression avec confirmation (admin only)
5. Filtres : statut, catégorie, localisation + recherche full-text
6. Migration : créer bucket `equipment-images` + policies
7. Ajout clés i18n `equipment.*` dans FR/EN/AR
8. Test : créer/modifier/supprimer un équipement, vérifier RLS pour rôle `client` (lecture seule)

---

## Question avant de démarrer

Confirmes-tu que je commence par **l'itération 1 (Équipements)** ? Tu pourras dire "suivant" pour passer à l'itération 2, etc.