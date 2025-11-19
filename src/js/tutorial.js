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
        this.createInlinePanel();
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

    createInlinePanel() {
        // Create inline tutorial panel instead of blocking overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-panel';
        this.overlay.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 380px;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            background: var(--bg-primary);
            border: 3px solid var(--color-warning);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        if (!document.getElementById('tutorial-animation-style')) {
            style.id = 'tutorial-animation-style';
            document.head.appendChild(style);
        }

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

        // Highlight element if specified (with subtle highlight, no z-index to avoid blocking)
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.style.boxShadow = '0 0 0 3px var(--color-warning), 0 0 15px rgba(217, 119, 6, 0.4)';
                element.style.borderRadius = '8px';
                element.style.transition = 'box-shadow 0.3s ease';
                // Scroll element into view smoothly
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Update panel content
        this.overlay.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="color: var(--color-warning); margin: 0; font-size: 18px; font-weight: bold;">
                    🎓 Tutoriel PTP
                </h2>
                <button id="tutorial-skip" style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 24px; line-height: 1; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='none'">×</button>
            </div>

            <div style="background: var(--bg-secondary); border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="color: var(--color-info); font-size: 12px; font-weight: bold; margin-bottom: 8px;">
                    ÉTAPE ${this.currentStep + 1} / ${this.steps.length}
                </div>
                <h3 style="color: var(--text-primary); margin-bottom: 10px; font-size: 16px; font-weight: bold;">
                    ${step.title}
                </h3>
                <p style="color: var(--text-secondary); margin: 0; font-size: 14px; line-height: 1.6;">
                    ${step.message}
                </p>
            </div>

            <div style="display: flex; gap: 8px; justify-content: space-between;">
                ${this.currentStep > 0 ? '<button id="tutorial-prev" style="background: var(--color-passive); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; flex: 1;">← Précédent</button>' : '<div style="flex: 1;"></div>'}
                ${this.currentStep < this.steps.length - 1 ? '<button id="tutorial-next" style="background: var(--color-success); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; flex: 1;">Suivant →</button>' : '<button id="tutorial-finish" style="background: var(--color-master); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; flex: 1;">✓ Terminer</button>'}
            </div>

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <div style="display: flex; gap: 4px; justify-content: center;">
                    ${this.steps.map((_, i) => `
                        <div style="width: ${100 / this.steps.length}%; height: 4px; background: ${i === this.currentStep ? 'var(--color-warning)' : i < this.currentStep ? 'var(--color-success)' : 'var(--border-color)'}; border-radius: 2px; transition: all 0.3s;"></div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners
        const nextBtn = document.getElementById('tutorial-next');
        const prevBtn = document.getElementById('tutorial-prev');
        const skipBtn = document.getElementById('tutorial-skip');
        const finishBtn = document.getElementById('tutorial-finish');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (step.validate && !step.validate()) {
                    this.showValidationMessage('Veuillez compléter cette étape avant de continuer.');
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

    showValidationMessage(message) {
        // Show validation message in the panel
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--color-warning);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            animation: shake 0.5s;
        `;
        messageEl.textContent = message;

        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translate(-50%, -50%) translateX(0); }
                25% { transform: translate(-50%, -50%) translateX(-10px); }
                75% { transform: translate(-50%, -50%) translateX(10px); }
            }
        `;
        if (!document.getElementById('shake-animation-style')) {
            style.id = 'shake-animation-style';
            document.head.appendChild(style);
        }

        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 2000);
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
        document.querySelectorAll('[style*="box-shadow"]').forEach(el => {
            // Only remove if it's a tutorial highlight (contains color-warning)
            if (el.style.boxShadow && el.style.boxShadow.includes('217, 119, 6')) {
                el.style.boxShadow = '';
                el.style.borderRadius = '';
                el.style.transition = '';
            }
        });
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.PTPTutorial = PTPTutorial;
}
