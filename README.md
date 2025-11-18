# Simulateur Interactif PTP v1/v2

Application web éducative pour comprendre le fonctionnement du Precision Time Protocol (PTP v1 et v2) et du Best Master Clock Algorithm (BMCA).

## 🎯 Objectif Pédagogique

Cette application permet de :
- Construire une topologie réseau avec différents types d'horloges (OC, BC, TC)
- Configurer en détail les paramètres BMCA de chaque horloge
- Visualiser l'élection du Grandmaster en temps réel
- Comprendre les messages PTP (Announce, Sync, Delay_Req, etc.)

## 🚀 Déploiement sur Cloudflare Pages

### Prérequis
- Node.js >= 20.0.0 (LTS recommandée : 20.18.0)
- npm >= 10.0.0
- Compte Cloudflare

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement local
npm run dev
# L'application sera accessible sur http://localhost:8080

# Prévisualiser avant déploiement
npm run preview
```

### Déploiement

#### Option 1 : Déploiement automatique via Git

1. Connectez votre dépôt GitHub à Cloudflare Pages
2. Configuration du build :
   - **Build command** : `npm run build`
   - **Build output directory** : `public`
   - **Root directory** : `/`

#### Option 2 : Déploiement manuel via Wrangler

```bash
# Se connecter à Cloudflare
npx wrangler login

# Déployer
npm run deploy
```

## 📁 Structure du Projet

```
/PTP
├── public/              # Fichiers statiques à déployer
│   ├── index.html      # Application principale
│   └── src/
│       ├── js/         # Scripts JavaScript modulaires
│       │   ├── clock.js
│       │   ├── bmca.js
│       │   ├── simulation.js
│       │   └── ui.js
│       └── css/        # Styles personnalisés
│           └── styles.css
├── package.json        # Configuration npm
├── wrangler.toml      # Configuration Cloudflare
└── README.md          # Ce fichier
```

## 🎓 Fonctionnalités

### Panneau 1 : Atelier de Topologie
- Ajouter des horloges : OC, BC, TC (P2P/E2E)
- Visualiser l'état de chaque horloge
- Sélectionner une horloge pour la configurer

### Panneau 2 : Configuration
- Paramètres BMCA pour PTPv2 :
  - priority1, clockClass, clockAccuracy
  - offsetScaledLogVariance, priority2, clockIdentity
- Paramètres pour PTPv1 :
  - Stratum, Identifier, Precision
- Paramètres réseau (QoS/DSCP)

### Panneau 3 : Visualisation BMCA
- Log détaillé de l'élection
- Explication pas-à-pas de la sélection du GM
- Visualisation des messages PTP (Sync, Delay_Req, etc.)

## 🛠️ Technologies

- **HTML5** - Structure de l'application
- **Tailwind CSS** - Framework CSS moderne (via CDN)
- **JavaScript ES6+** - Logique applicative moderne
- **Cloudflare Pages** - Hébergement et déploiement

## 📖 Ressources PTP

- IEEE 1588-2008 (PTPv2)
- IEEE 1588-2002 (PTPv1)
- Best Master Clock Algorithm (BMCA)

## 📝 Licence

MIT License
