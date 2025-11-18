# Configuration Cloudflare Pages - Instructions

## ⚠️ IMPORTANT: Configuration pour éviter les multiples environnements

Pour que Cloudflare déploie **toujours sur le même environnement de production**, suivez ces étapes:

## 1. Configuration dans le Dashboard Cloudflare

### A. Accéder aux paramètres
1. Connectez-vous à [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Allez dans **Pages** → **simulateur-ptp**
3. Cliquez sur **Settings** (Paramètres)

### B. Définir la branche de production
Dans **Builds & deployments**:

```
Production branch: claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb
```

✅ **Résultat:** Tous les push sur cette branche mettront à jour LA MÊME production.

### C. Configuration du Build

**Build configuration:**
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** `/` (racine)

**Framework preset:** None (Static)

### D. Variables d'environnement

Ajoutez ces variables dans **Environment variables**:

| Variable | Valeur | Production | Preview |
|----------|--------|------------|---------|
| `NODE_VERSION` | `22.21.1` | ✓ | ✓ |
| `ENVIRONMENT` | `production` | ✓ | |

## 2. Déploiement depuis votre machine

### Option A: Déploiement automatique (recommandé)

```bash
# Build + Deploy sur la branche de production
npm run deploy:production
```

Cette commande:
1. Build le projet dans `dist/`
2. Déploie sur `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`
3. Met à jour **le même environnement de production**

### Option B: Déploiement manuel

```bash
# 1. Build
npm run build

# 2. Deploy
npx wrangler pages deploy dist --branch=claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb
```

## 3. Vérification

### Après le déploiement:

1. **Dashboard Cloudflare:**
   - Allez dans Pages → simulateur-ptp → **Deployments**
   - Vérifiez que le déploiement est sur `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`
   - Le statut doit être **"Success"**

2. **URL de production:**
   - Testez `https://simulateur-ptp.pages.dev` (ou votre domaine custom)
   - Vérifiez que les changements sont visibles
   - Force refresh: `Ctrl+Shift+R` (ou `Cmd+Shift+R` sur Mac)

3. **Build info:**
   - Accédez à `https://your-domain.pages.dev/build-info.json`
   - Vérifiez la date de build

## 4. Workflow Git recommandé

### Pour des corrections/features:

```bash
# 1. Créer une branche de feature
git checkout -b claude/feature-name

# 2. Faire vos changements
# ... modifications ...

# 3. Commit
git add .
git commit -m "Description du changement"

# 4. Push
git push -u origin claude/feature-name

# 5. Créer une Pull Request vers la branche de production
# Sur GitHub: New Pull Request
# Base: claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb
# Compare: claude/feature-name

# 6. Merge la PR
# → Cloudflare déploie automatiquement sur production!
```

### Pour un déploiement direct:

```bash
# 1. Checkout la branche de production
git checkout claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb

# 2. Faire vos changements
# ... modifications ...

# 3. Commit et push
git add .
git commit -m "Description"
git push origin claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb

# → Cloudflare déploie automatiquement!
```

## 5. Désactiver les deployments automatiques (optionnel)

Si vous voulez contrôler manuellement les déploiements:

**Dans Settings → Builds & deployments:**
- **Automatic deployments:** Désactiver pour la production
- Vous devrez alors lancer `npm run deploy:production` manuellement

## 6. Troubleshooting

### Problème: "Multiple environments created"

**Cause:** Vous déployez sur différentes branches

**Solution:**
- ✅ Utilisez **toujours** `npm run deploy:production`
- ✅ Ou committez sur `claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb`
- ❌ N'utilisez PAS `npm run deploy` (crée un preview)

### Problème: "Build fails on Cloudflare"

**Vérifiez:**
1. Node version = 22.21.1 (dans variables d'environnement)
2. Build command = `npm run build`
3. Build output = `dist`
4. Logs dans Cloudflare Dashboard

**Solution locale:**
```bash
npm run clean
npm run build
# Vérifiez que dist/ contient tous les fichiers
```

### Problème: "Changes not visible"

**Solutions:**
1. Clear browser cache (Ctrl+Shift+R)
2. Vérifier le déploiement dans Cloudflare Dashboard
3. Vérifier build-info.json pour la date
4. Purger le cache Cloudflare (Caching → Purge Everything)

## 7. Structure des branches

```
Repository:
├── claude/ptp-simulator-app-01JQmZUm3g1Jy8tSJiv6DCCb  ← PRODUCTION (main)
├── claude/improve-ptp-educational-tool-...             ← Feature branches
└── ...autres branches...                               ← Autres features
```

## 8. Commandes rapides

```bash
# Dev local
npm run dev

# Build production
npm run build

# Deploy production (build + push)
npm run deploy:production

# Clean
npm run clean

# Test build localement
npm run build && python3 -m http.server 8000 --directory dist
```

## 📚 Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guide complet de déploiement

---

**Questions?** Consultez [DEPLOYMENT.md](./DEPLOYMENT.md) pour plus de détails.
