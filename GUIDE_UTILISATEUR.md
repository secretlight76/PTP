# 📘 Guide d'Utilisation - Simulateur Interactif PTP v1/v2

Bienvenue dans le Simulateur Interactif PTP ! Ce guide vous aidera à comprendre et utiliser toutes les fonctionnalités de l'application.

## 🎯 Objectif de l'Application

Cette application web éducative vous permet de :
- **Comprendre** le fonctionnement du Precision Time Protocol (PTP)
- **Visualiser** l'algorithme BMCA (Best Master Clock Algorithm)
- **Expérimenter** avec différentes configurations d'horloges
- **Apprendre** les différences entre PTPv1 et PTPv2

## 🖥️ Interface de l'Application

L'interface est divisée en **3 panneaux principaux** :

### 📍 Panneau 1 : Atelier de Topologie (Gauche)

C'est votre espace de construction du réseau PTP.

#### Boutons d'Ajout d'Horloges

- **🕐 Ajouter une Horloge (OC)**
  - OC = Ordinary Clock
  - Horloge standard qui peut être Master ou Slave
  - Utilisez ceci pour créer des horloges simples

- **🔀 Ajouter un Switch (BC)**
  - BC = Boundary Clock
  - Switch qui participe à l'élection BMCA
  - Peut être Master sur certains ports et Slave sur d'autres
  - Utilisé dans les topologies complexes multi-domaines

- **⚡ Ajouter un Switch (TC P2P)**
  - TC = Transparent Clock Peer-to-Peer
  - Switch qui corrige les délais de propagation
  - Ne participe PAS à l'élection BMCA
  - Mesure le délai entre switches voisins

- **⚡ Ajouter un Switch (TC E2E)**
  - TC = Transparent Clock End-to-End
  - Similaire au TC P2P mais avec mesure bout-en-bout
  - Ajoute le temps de résidence aux messages Sync

#### Zone des Horloges

Chaque horloge apparaît sous forme de **carte** avec :
- Son nom (ex: "Horloge-1")
- Son type (OC, BC, TC)
- Sa version PTP (v1 ou v2)
- Son état actuel (Initializing, Master, Slave)
- Une icône (👑 pour le Grandmaster)

**💡 Astuce** : Cliquez sur une carte pour la sélectionner et la configurer dans le Panneau 2.

#### Contrôles de Simulation

- **▶️ Lancer l'Élection BMCA**
  - Lance la simulation de l'élection du Grandmaster
  - Affiche les logs détaillés dans le Panneau 3
  - Met à jour les états des horloges

- **🔁 Simuler la Synchronisation**
  - À lancer APRÈS l'élection BMCA
  - Simule l'échange de messages Sync/Delay_Req/Delay_Resp
  - Montre comment les Slaves se synchronisent avec le GM

- **🔄 Réinitialiser la Topologie**
  - Supprime TOUTES les horloges
  - Efface les logs
  - Remet l'application à zéro

---

### ⚙️ Panneau 2 : Configuration (Centre)

Ce panneau affiche les paramètres de l'horloge **sélectionnée**.

#### Informations de Base

- **ID de l'horloge**
  - Nom personnalisable de l'horloge
  - Doit être unique dans la topologie

- **Version PTP**
  - Boutons radio pour choisir entre **PTPv1** ou **PTPv2**
  - ⚠️ Changer la version réinitialise les paramètres BMCA

- **Type d'horloge**
  - Affichage du type (non modifiable après création)

- **Domaine PTP** (0-127)
  - Permet de séparer différents réseaux PTP
  - Seules les horloges du même domaine communiquent

#### Paramètres BMCA - PTPv2 (IEEE 1588-2008)

Le BMCA compare les horloges **dans cet ordre précis** :

1. **Priority1** (0-255, plus petit = meilleur)
   - Premier critère de sélection
   - Configurable par l'administrateur
   - Défaut : 128
   - **Usage** : Forcer une horloge à être GM (mettre à 0)

2. **Clock Class** (6-255)
   - Indique la qualité de la source de temps
   - **6** : Référence primaire (GPS, Atomique)
   - **248** : Horloge par défaut
   - **255** : Slave-only (ne peut jamais être GM)

3. **Clock Accuracy** (0x20-0xFE)
   - Précision de l'horloge par rapport à UTC
   - **0x20** : < 25 nanosecondes
   - **0xFE** : Précision inconnue

4. **Offset Scaled Log Variance** (1000-30000)
   - Mesure de la stabilité de l'horloge (jitter)
   - Plus petit = plus stable

5. **Priority2** (0-255)
   - Dernier critère configurable
   - Permet un réglage fin
   - Défaut : 128

6. **Clock Identity**
   - Identifiant unique (basé sur MAC)
   - Non configurable
   - Utilisé comme **tie-breaker** final

#### Paramètres BMCA - PTPv1 (IEEE 1588-2002)

1. **Stratum** (1-4)
   - Niveau de qualité de l'horloge
   - **1** : Référence primaire (GPS, Atomique)
   - **4** : Non synchronisé

2. **Identifier**
   - Identifiant unique de l'horloge

3. **Precision** (-30 à -10)
   - Précision en log2(secondes)
   - -20 = ~1μs, -30 = ~1ns

4. **Variance** (1000-10000)
   - Estimation de la variance de l'horloge

#### Paramètres Réseau

- **Priorité QoS (DSCP)** (0-63)
  - Valeur DSCP pour prioriser les paquets PTP
  - **46** = Expedited Forwarding (recommandé pour PTPv2)
  - Permet aux switches de traiter les paquets PTP en priorité

#### Sauvegarder

- **💾 Enregistrer la Configuration**
  - Sauvegarde tous les changements de l'horloge sélectionnée
  - Met à jour l'affichage de la carte dans le Panneau 1

---

### 📊 Panneau 3 : Visualisation & Résultats (Droite)

Ce panneau a **deux onglets** :

#### Onglet 1 : 📜 Logs de Simulation

Affiche un log détaillé en temps réel de la simulation :

**Phase 1 : Envoi des Announces**
```
[Horloge-1] ➤ Envoie Announce (Domain: 0)
[Horloge-2] ➤ Envoie Announce (Domain: 0)
```

**Phase 2 : Réception et Analyse**
```
[Horloge-1] Reçoit 1 message(s) Announce
[Horloge-1] ✓ Announce de "Horloge-2" est MEILLEUR
```

**Phase 3 : Élection**
```
[RÉSULTAT] Le Grandmaster élu est: 👑 Horloge-2
```

**Phase 4 : Mise à jour des États**
```
[Horloge-2] → État: MASTER 👑
[Horloge-1] → État: SLAVE (Maître: Horloge-2)
```

**Messages de Synchronisation** (si vous lancez la synchro)
```
[Horloge-2] 📤 Envoie SYNC (Seq: 1, T1: ...)
[Horloge-1] 📥 Reçoit SYNC (T2: ...)
[Horloge-1] 📤 Envoie DELAY_REQ (Seq: 2, T3: ...)
[Horloge-2] 📥 Reçoit DELAY_REQ de Horloge-1 (T4: ...)
[Horloge-2] 📤 Envoie DELAY_RESP à Horloge-1 (T4: ...)
[Horloge-1] 🧮 Calcule l'offset et le délai
[Horloge-1] ✅ Synchronisé avec Horloge-2
```

#### Onglet 2 : 💡 Explication BMCA

Affiche une explication **pédagogique détaillée** de pourquoi le Grandmaster a été élu.

**Exemple** :
```
👑 Horloge-2 est le Grandmaster !

Le Grandmaster Horloge-2 a été élu grâce à ses paramètres BMCA supérieurs.
Il possède une combinaison optimale de priority1 (100), clockClass (6),
et autres paramètres qui le rendent plus fiable que les autres horloges.

Comparaison : Horloge-2 vs Horloge-1
┌─────────────┬────────────┬────────────┬─────────────────────┐
│ Paramètre   │ Horloge-2  │ Horloge-1  │ Résultat            │
├─────────────┼────────────┼────────────┼─────────────────────┤
│ priority1   │ 100        │ 128        │ Horloge-2 gagne     │
│ (pas besoin de comparer les autres car priority1 suffit)   │
└─────────────┴────────────┴────────────┴─────────────────────┘
```

---

## 🎓 Scénarios d'Utilisation Pédagogiques

### Scénario 1 : Élection Simple (2 horloges)

**Objectif** : Comprendre le critère priority1

1. Ajoutez **2 Horloges (OC)**
2. Sélectionnez Horloge-1 :
   - Laissez priority1 à **128**
3. Sélectionnez Horloge-2 :
   - Réglez priority1 à **100** (meilleur)
4. **Enregistrez** les configurations
5. Cliquez sur **Lancer l'Élection BMCA**
6. **Résultat** : Horloge-2 devient Grandmaster car 100 < 128

### Scénario 2 : Comparaison avec Clock Class

**Objectif** : Comprendre la hiérarchie du BMCA

1. Ajoutez **2 Horloges (OC)**
2. Horloge-1 :
   - priority1 = **128**
   - clockClass = **248** (défaut)
3. Horloge-2 :
   - priority1 = **128** (même valeur)
   - clockClass = **6** (GPS)
4. Lancez l'élection
5. **Résultat** : Horloge-2 gagne grâce à clockClass (6 < 248)

### Scénario 3 : Horloge Slave-Only

**Objectif** : Comprendre clockClass 255

1. Ajoutez **2 Horloges (OC)**
2. Horloge-1 :
   - priority1 = **50** (très bon)
   - clockClass = **255** (Slave-only)
3. Horloge-2 :
   - priority1 = **200** (mauvais)
   - clockClass = **248** (défaut)
4. Lancez l'élection
5. **Résultat** : Horloge-2 devient GM car Horloge-1 ne peut pas être GM

### Scénario 4 : Comparaison PTPv1 vs PTPv2

**Objectif** : Voir les différences entre les versions

1. Créez une topologie avec 3 horloges en PTPv2
2. Lancez l'élection, observez les critères
3. Réinitialisez la topologie
4. Créez 3 horloges en PTPv1
5. Lancez l'élection
6. **Observation** : PTPv1 utilise Stratum au lieu de priority1/clockClass

### Scénario 5 : Topologie avec Boundary Clock

**Objectif** : Comprendre le rôle des BC

1. Ajoutez 2 Horloges OC
2. Ajoutez 1 Switch BC
3. Le BC participe à l'élection BMCA
4. Configurez-le avec des paramètres intermédiaires
5. Lancez l'élection
6. **Observation** : Le BC peut devenir GM ou Slave selon sa config

---

## 🔍 Infobulles et Aide Contextuelle

Passez la souris sur les icônes **ⓘ** pour obtenir :
- Des explications détaillées de chaque paramètre
- Des conseils d'utilisation
- Des exemples de valeurs

---

## ⚠️ Erreurs Courantes

### "Aucune horloge dans la topologie !"
- **Solution** : Ajoutez au moins une horloge avant de lancer la simulation

### "Cet ID existe déjà !"
- **Solution** : Choisissez un nom unique pour chaque horloge

### "Impossible d'élire un Grandmaster !"
- **Solution** : Vérifiez qu'au moins une horloge n'est pas en Slave-Only (clockClass 255)

---

## 💡 Astuces Avancées

1. **Forcer une horloge à être GM**
   - Mettez priority1 à **0**
   - Mettez clockClass à **6**

2. **Créer un tie-breaker**
   - Mettez tous les paramètres identiques
   - L'horloge avec le clockIdentity le plus petit gagne

3. **Simuler une horloge GPS**
   - clockClass = **6**
   - clockAccuracy = **0x20** (< 25ns)
   - offsetScaledLogVariance = **1000** (très stable)

4. **Tester la stabilité**
   - Créez 5 horloges avec des variances différentes
   - Observez l'impact sur l'élection

---

## 📚 Pour Aller Plus Loin

### Standards IEEE
- **IEEE 1588-2002** : PTPv1
- **IEEE 1588-2008** : PTPv2
- **IEEE 1588-2019** : PTPv2.1 (dernière version)

### Ressources
- [IEEE 1588 Standard](https://standards.ieee.org/standard/1588-2019.html)
- Livre : "IEEE 1588 Precise Time Protocol" par John Eidson
- RFC 8173 : PTP over IPv4/IPv6

### Cas d'Usage Réels
- **Télécommunications** : Synchronisation des stations de base 5G
- **Finance** : Horodatage des transactions
- **Industrie** : Automation et contrôle temps réel
- **Broadcast** : Synchronisation audio/vidéo

---

## 🐛 Signaler un Bug

Si vous trouvez un bug ou avez une suggestion :
1. Vérifiez la console du navigateur (F12)
2. Notez les étapes pour reproduire le problème
3. Contactez le mainteneur du projet

---

## 🎉 Amusez-vous bien !

L'apprentissage du PTP peut sembler complexe, mais avec cet outil, vous allez **voir** et **comprendre** le BMCA en action.

**Bonne synchronisation !** 🕐⚡

---

*Version 1.0 - Simulateur PTP - 2024*
