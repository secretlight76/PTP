# Changelog - Simulateur PTP

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2024-11-18

### 🔄 Changements Majeurs

#### Mises à jour des Dépendances
- **Node.js** : Mise à jour de 18.18.0 vers **20.18.0** (LTS actuelle)
  - Fin de vie de Node.js 18.x évitée
  - Meilleure performance et sécurité
  - Support des dernières fonctionnalités ES

- **Wrangler** : Mise à jour de 3.78.0 vers **4.47.0**
  - Migration vers la version majeure 4.x
  - Correction de 2 vulnérabilités de sécurité modérées (esbuild)
  - Amélioration des performances de déploiement
  - Suppression des warnings de paquets dépréciés

- **npm** : Exigence minimale passée de 9.x à **10.x**

### 🐛 Corrections de Bugs

- **Redirections Cloudflare** : Correction de la boucle infinie dans `_redirects`
  - Suppression de la règle `/* /index.html 200` qui causait des erreurs
  - Cloudflare Pages gère maintenant automatiquement le routing
  - Plus d'avertissements lors du déploiement

### 🔒 Sécurité

- ✅ **0 vulnérabilités** npm (précédemment 2 modérées)
  - Correction de la vulnérabilité esbuild (GHSA-67mh-4wv8-2f99)
  - Mise à jour de toutes les dépendances transitives

### 📦 Dépendances

#### Supprimées
- Warnings de paquets dépréciés éliminés :
  - `sourcemap-codec@1.4.8` → remplacé automatiquement par wrangler 4.x
  - `rollup-plugin-inject@3.0.2` → remplacé automatiquement par wrangler 4.x

#### Mises à jour
| Paquet | Ancienne Version | Nouvelle Version |
|--------|------------------|------------------|
| wrangler | ^3.78.0 | ^4.47.0 |
| Node.js | 18.18.0 | 20.18.0 |
| npm | >=9.0.0 | >=10.0.0 |

### 📚 Documentation

- Ajout de `CHANGELOG.md` pour suivre les versions
- Mise à jour de `README.md` avec les nouvelles versions
- Mise à jour de `cloudflare-pages.md` avec les configurations Wrangler 4.x

### ⚡ Performance

- Réduction du nombre de paquets npm : 60 → 48 (-20%)
- Déploiement plus rapide avec Wrangler 4.x
- Meilleure gestion du cache avec les nouveaux headers

---

## [1.0.0] - 2024-11-18

### 🎉 Version Initiale

#### Fonctionnalités Principales

- **Interface à 3 panneaux** :
  - Panneau 1 : Atelier de Topologie
  - Panneau 2 : Configuration des horloges
  - Panneau 3 : Visualisation BMCA & Logs

- **Support PTP** :
  - PTPv1 (IEEE 1588-2002)
  - PTPv2 (IEEE 1588-2008)

- **Types d'horloges** :
  - Ordinary Clock (OC)
  - Boundary Clock (BC)
  - Transparent Clock P2P (TC-P2P)
  - Transparent Clock E2E (TC-E2E)

- **Simulation BMCA** :
  - Algorithme complet et conforme IEEE 1588
  - Logs détaillés en temps réel
  - Explications pédagogiques pas-à-pas

- **Paramètres BMCA configurables** :
  - PTPv2 : priority1, clockClass, clockAccuracy, offsetScaledLogVariance, priority2
  - PTPv1 : Stratum, Identifier, Precision, Variance

- **Visualisation des messages PTP** :
  - Announce (élection)
  - Sync, Follow_Up, Delay_Req, Delay_Resp (synchronisation)

#### Stack Technique

- HTML5 + Tailwind CSS (CDN)
- JavaScript ES6+ modulaire
- Cloudflare Pages
- Wrangler 3.x
- Node.js 18.x

#### Documentation

- README.md complet
- GUIDE_UTILISATEUR.md (guide détaillé en français)
- cloudflare-pages.md (guide de déploiement)
- 5 scénarios pédagogiques

---

## Notes de Migration

### Migrer de 1.0.0 vers 1.1.0

Si vous avez déjà cloné le projet en version 1.0.0 :

```bash
# 1. Mettre à jour le dépôt
git pull origin main

# 2. Supprimer les anciennes dépendances
rm -rf node_modules package-lock.json

# 3. Réinstaller avec les nouvelles versions
npm install

# 4. Vérifier l'absence de vulnérabilités
npm audit
# Devrait afficher : "found 0 vulnerabilities"

# 5. Tester localement
npm run dev
```

### Changements dans Wrangler 4.x

Wrangler 4.x introduit quelques changements :
- Commandes légèrement différentes (mais compatibles)
- Meilleure gestion des environnements
- Support amélioré de TypeScript (même si on ne l'utilise pas)
- Corrections de sécurité importantes

Aucun changement de configuration n'est nécessaire pour notre projet.

---

## Liens Utiles

- [Wrangler 4 Release Notes](https://github.com/cloudflare/workers-sdk/releases)
- [Node.js 20 Release Notes](https://nodejs.org/en/blog/release/v20.0.0)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)

---

*Maintenu par l'équipe du Simulateur PTP*
