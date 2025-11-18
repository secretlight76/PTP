# Simulateur Interactif PTP v1/v2

🎓 **Outil éducatif pour comprendre le Precision Time Protocol (IEEE 1588) et le BMCA**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-22.21.1-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 22.21.1 (LTS)
- npm 10+

### Développement Local
```bash
npm run dev
# Ouvre http://localhost:8080
```

### Build & Deploy
```bash
npm run build              # Build production
npm run deploy:production  # Deploy to Cloudflare
```

📖 **Guide complet:** Voir [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🏗️ Structure du Projet

```
PTP/
├── src/          🔒 Code source protégé
├── public/       🛠️ Dev environment  
├── dist/         📦 Production build (auto-généré)
├── scripts/      🔧 Build scripts
└── DEPLOYMENT.md 📚 Guide de déploiement détaillé
```

## ✨ Fonctionnalités

- Simulation interactive PTP v1 et v2
- Visualisation BMCA (Best Master Clock Algorithm)
- Topologie réseau visuelle avec drag & drop
- 7 scénarios prédéfinis + tutoriel interactif
- Mode sombre / clair
- Export de configurations

## 📚 En savoir plus

- [Guide de déploiement](./DEPLOYMENT.md) - Configuration Cloudflare, structure, etc.
- [IEEE 1588](https://en.wikipedia.org/wiki/Precision_Time_Protocol) - Documentation PTP

---

**Créé pour l'apprentissage du Precision Time Protocol** 🕐
