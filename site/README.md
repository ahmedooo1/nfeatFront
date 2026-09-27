# NF-EAT · site de commande en ligne

Nouvelle version du site (Nuxt 4, Vue 3, Tailwind CSS 4), connectée à l'API Symfony
`apinfeat.aaweb.fr`. L'ancienne version (Nuxt 2, racine du dépôt) n'est plus déployée.

## Pour un nouveau restaurant

1. `app/restaurant.config.ts` : nom, accroche, cuisine, adresse, horaires, réseaux,
   mention « site à vendre ».
2. `app/assets/css/main.css`, bloc `@theme` : couleurs.
3. `public/images/` : logo (`logo.png`), photo de la salle (`restaurant.jpg`), coup de pinceau des titres (`brush.png`).
4. Variables au build (facultatives) : `NUXT_PUBLIC_API_BASE`, `NUXT_PUBLIC_STRIPE_KEY`
   (clé publique `pk_live_…`), `NUXT_PUBLIC_GA_ID`.

## Fonctionnalités

- Carte par catégories avec recherche, fiche plat, avis clients.
- Panier (visiteur, puis fusionné au compte à la connexion), paiement Stripe
  (carte, Apple Pay, Google Pay), reçu imprimable, historique et « commander à nouveau ».
- Espace pro : ventes du jour et de la semaine, commandes en direct (Mercure, avec
  son), gestion de la carte avec photos, gestion des administrateurs.
- Référencement : pages publiques pré-rendues, données structurées `Restaurant` et
  `MenuItem`, sitemap, `lang="fr"`.
- RGPD : Google Analytics seulement après accord.

## Développement

```bash
cd site
npm install
NUXT_PUBLIC_API_BASE=http://127.0.0.1:8000 npm run dev
npm run typecheck
npm run generate   # site statique dans .output/public
```

## Déploiement

`.github/workflows/deploy.yml` : à chaque push sur `main` (dossier `site/`) et chaque
nuit, GitHub construit le site et l'envoie dans `/var/www/nfeat/dist`. La version
précédente est gardée dans `dist.previous` pour un retour arrière immédiat.
