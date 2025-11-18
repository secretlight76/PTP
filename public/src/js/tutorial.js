/**
 * tutorial.js - Interactive Tutorial Mode
 * Provides step-by-step guided learning experience
 */

class PTPTutorial {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.steps = [
            {
                title: "Bienvenue dans le Simulateur PTP !",
                message: "Ce tutoriel vous guidera à travers les fonctionnalités du Precision Time Protocol. Cliquez sur 'Suivant' pour commencer.",
                action: null,
                highlight: null
            },
            {
                title: "Étape 1: Ajouter une Horloge GPS",
                message: "Commençons par ajouter un Grandmaster GPS. Cliquez sur le bouton 'Ajouter Master Clock GPS' dans le panneau de gauche.",
                action: () => {
                    // Wait for user to add GM
                },
                highlight: "#btn-add-gm-gps",
                validate: () => this.uiManager.simulation.clocks.some(c => c.type === ClockType.GRANDMASTER_GPS)
            },
            {
                title: "Étape 2: Ajouter une Horloge Esclave",
                message: "Parfait ! Maintenant ajoutez une horloge ordinaire qui deviendra esclave du GM. Cliquez sur 'Ajouter une Horloge (OC)'.",
                action: null,
                highlight: "#btn-add-oc",
                validate: () => this.uiManager.simulation.clocks.length >= 2
            },
            {
                title: "Étape 3: Observer la Topologie",
                message: "Excellent ! Vous pouvez voir vos horloges dans le panneau de topologie. Remarquez que chaque horloge affiche son type et son état actuel.",
                action: null,
                highlight: "#topology-container"
            },
            {
                title: "Étape 4: Configurer une Horloge",
                message: "Cliquez sur l'horloge GM-GPS pour voir ses paramètres BMCA. Ces paramètres déterminent quelle horloge devient le Grandmaster.",
                action: null,
                highlight: "#topology-container",
                validate: () => this.uiManager.selectedClock !== null
            },
            {
                title: "Étape 5: Comprendre les Paramètres BMCA",
                message: "Vous voyez maintenant les paramètres BMCA dans le panneau de configuration. Le priority1 est le premier critère (plus petit = meilleur). Survolez les ⓘ pour plus d'infos.",
                action: null,
                highlight: "#config-panel"
            },
            {
                title: "Étape 6: Lancer l'Élection BMCA",
                message: "Maintenant, lançons l'élection pour voir quel horloge devient le Grandmaster. Cliquez sur 'Lancer l'Élection BMCA'.",
                action: null,
                highlight: "#btn-run-bmca",
                validate: () => this.uiManager.simulation.grandmaster !== null
            },
            {
                title: "Étape 7: Observer les Résultats",
                message: "Regardez le panneau de droite ! Vous pouvez voir tous les logs de l'élection. Le GM-GPS a été élu car il a les meilleurs paramètres BMCA.",
                action: null,
                highlight: "#log-panel"
            },
            {
                title: "Étape 8: Explication Détaillée",
                message: "Cliquez sur l'onglet 'Explication BMCA' pour voir une comparaison détaillée des paramètres entre les horloges.",
                action: null,
                highlight: "#tab-explanation"
            },
            {
                title: "Étape 9: Simuler la Synchronisation",
                message: "Maintenant que nous avons un Grandmaster, simulons les échanges de messages Sync. Cliquez sur 'Simuler la Synchronisation'.",
                action: null,
                highlight: "#btn-run-sync"
            },
            {
                title: "Tutoriel Terminé !",
                message: "Félicitations ! Vous connaissez maintenant les bases du PTP. Explorez les scénarios prédéfinis ou créez votre propre topologie. Bonne exploration !",
                action: () => {
                    this.stop();
                },
                highlight: null
            }
        ];
    }

    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep();
    }

    stop() {
        this.isActive = false;
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        this.removeHighlights();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        document.body.appendChild(this.overlay);
    }

    showStep() {
        if (this.currentStep >= this.steps.length) {
            this.stop();
            return;
        }

        const step = this.steps[this.currentStep];

        // Remove old highlights
        this.removeHighlights();

        // Highlight element if specified
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.style.position = 'relative';
                element.style.zIndex = '9999';
                element.style.boxShadow = '0 0 0 4px var(--color-warning), 0 0 20px rgba(217, 119, 6, 0.5)';
                element.style.borderRadius = '8px';
            }
        }

        // Create tutorial box
        const tutorialBox = document.createElement('div');
        tutorialBox.id = 'tutorial-box';
        tutorialBox.style.cssText = `
            background: var(--bg-primary);
            border: 3px solid var(--color-warning);
            border-radius: 12px;
            padding: 30px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            text-align: center;
            z-index: 10000;
        `;

        tutorialBox.innerHTML = `
            <h2 style="color: var(--color-warning); margin-bottom: 20px; font-size: 24px;">
                ${step.title}
            </h2>
            <p style="color: var(--text-primary); margin-bottom: 30px; font-size: 16px; line-height: 1.6;">
                ${step.message}
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                ${this.currentStep > 0 ? '<button id="tutorial-prev" style="background: var(--color-passive); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Précédent</button>' : ''}
                ${this.currentStep < this.steps.length - 1 ? '<button id="tutorial-next" style="background: var(--color-success); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Suivant</button>' : '<button id="tutorial-finish" style="background: var(--color-master); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Terminer</button>'}
                <button id="tutorial-skip" style="background: var(--color-error); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: bold;">Quitter</button>
            </div>
            <div style="margin-top: 20px; color: var(--text-tertiary); font-size: 12px;">
                Étape ${this.currentStep + 1} / ${this.steps.length}
            </div>
        `;

        // Remove old box
        const oldBox = document.getElementById('tutorial-box');
        if (oldBox) oldBox.remove();

        this.overlay.appendChild(tutorialBox);

        // Add event listeners
        const nextBtn = document.getElementById('tutorial-next');
        const prevBtn = document.getElementById('tutorial-prev');
        const skipBtn = document.getElementById('tutorial-skip');
        const finishBtn = document.getElementById('tutorial-finish');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (step.validate && !step.validate()) {
                    alert('Veuillez compléter cette étape avant de continuer.');
                    return;
                }
                this.nextStep();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.stop());
        }

        if (finishBtn) {
            finishBtn.addEventListener('click', () => this.stop());
        }

        // Execute step action if present
        if (step.action) {
            step.action();
        }
    }

    nextStep() {
        this.currentStep++;
        this.showStep();
    }

    prevStep() {
        this.currentStep--;
        this.showStep();
    }

    removeHighlights() {
        document.querySelectorAll('[style*="z-index: 9999"]').forEach(el => {
            el.style.position = '';
            el.style.zIndex = '';
            el.style.boxShadow = '';
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PTPTutorial };
}
