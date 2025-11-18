# Configuration Cloudflare Pages

Ce document explique comment déployer le Simulateur PTP sur Cloudflare Pages.

## Configuration du Build

Lors de la création du projet Cloudflare Pages, utilisez ces paramètres :

### Paramètres de Build
- **Framework preset** : None
- **Build command** : `npm run build` (ou laissez vide)
- **Build output directory** : `public`
- **Root directory** : `/` (racine du projet)

### Variables d'Environnement
Aucune variable d'environnement n'est requise pour ce projet.

## Déploiement via Git

1. Connectez votre dépôt GitHub/GitLab à Cloudflare Pages
2. Sélectionnez la branche à déployer (généralement `main` ou `master`)
3. Configurez les paramètres de build ci-dessus
4. Cliquez sur "Save and Deploy"

Cloudflare Pages détectera automatiquement les commits et redéploiera l'application.

## Déploiement via Wrangler CLI

### Installation de Wrangler

```bash
npm install
```

### Connexion à Cloudflare

```bash
npx wrangler login
```

### Déploiement

```bash
npm run deploy
```

ou directement :

```bash
npx wrangler pages deploy public
```

### Mode Développement Local

Pour tester localement avec Cloudflare Pages :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## Domaine Personnalisé

Après le déploiement, vous pouvez configurer un domaine personnalisé dans :
Cloudflare Pages → Votre Projet → Custom Domains

## Optimisations Cloudflare

Le projet inclut :
- **_headers** : Headers HTTP pour sécurité et cache
- **_redirects** : Gestion des redirections (SPA)
- **Cache Control** : Optimisation du cache des assets statiques

## Performance

Cloudflare Pages offre :
- CDN global automatique
- HTTPS automatique
- Compression Brotli/Gzip
- HTTP/2 et HTTP/3
- Cache intelligent des assets

## Surveillance

Surveillez votre site via :
- Cloudflare Analytics (inclus gratuitement)
- Web Analytics (sans tracking côté client)

## Limites du Plan Gratuit

- 500 builds par mois
- 1 build concurrent
- Bande passante illimitée
- Requêtes illimitées

Parfait pour ce projet éducatif !

## Support

En cas de problème :
1. Vérifiez les logs de build dans Cloudflare Pages
2. Consultez la documentation : https://developers.cloudflare.com/pages
3. Vérifiez que tous les fichiers sont bien dans le dossier `public/`

## URLs de Déploiement

Après déploiement, vous aurez :
- **URL de production** : `https://votre-projet.pages.dev`
- **URLs de preview** : Pour chaque branche/PR

Bonne synchronisation ! 🕐
