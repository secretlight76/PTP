/**
 * contextual-help.js - Système d'aide contextuelle
 * Fournit des tooltips et des guides hover pour les éléments de l'interface
 */

class ContextualHelp {
    constructor() {
        this.tooltips = new Map();
        this.activeTooltip = null;
        this.init();
    }

    init() {
        // Définir les tooltips contextuels
        this.tooltips.set('btn-add-oc', {
            title: 'Ordinary Clock (OC)',
            description: 'Une horloge simple qui peut être Master ou Slave. Idéal pour les équipements finaux (serveurs, caméras, etc.).',
            icon: '🕐'
        });

        this.tooltips.set('btn-add-gm-gps', {
            title: 'Master Clock GPS',
            description: 'Horloge avec source GPS (Class 6). Précision < 100ns. Excellente pour être Grandmaster.',
            icon: '🛰️'
        });

        this.tooltips.set('btn-add-gm-atomic', {
            title: 'Master Clock Atomique',
            description: 'Horloge avec source atomique (Class 6). Précision < 25ns. La meilleure référence temporelle.',
            icon: '⚛️'
        });

        this.tooltips.set('btn-add-bc', {
            title: 'Boundary Clock (BC)',
            description: 'Switch PTP intelligent qui participe au BMCA. Peut devenir Master et transmettre le temps.',
            icon: '◆'
        });

        this.tooltips.set('btn-add-tc-p2p', {
            title: 'Transparent Clock P2P',
            description: 'Switch qui corrige les délais en mode Peer-to-Peer. Ne participe pas au BMCA.',
            icon: '▣'
        });

        this.tooltips.set('btn-add-tc-e2e', {
            title: 'Transparent Clock E2E',
            description: 'Switch qui corrige les délais en mode End-to-End. Ne participe pas au BMCA.',
            icon: '▣'
        });

        this.tooltips.set('btn-run-bmca', {
            title: 'Élection BMCA',
            description: 'Lance l\'algorithme Best Master Clock pour élire le Grandmaster selon les paramètres configurés.',
            icon: '👑'
        });

        this.tooltips.set('btn-run-sync', {
            title: 'Synchronisation',
            description: 'Simule l\'échange de messages Sync/Delay_Req/Delay_Resp entre Master et Slaves.',
            icon: '🔄'
        });

        this.tooltips.set('btn-reset-states', {
            title: 'Réinitialiser États',
            description: 'Remet toutes les horloges à l\'état initial sans supprimer la topologie.',
            icon: '↺'
        });

        this.tooltips.set('btn-reset', {
            title: 'Réinitialiser Topologie',
            description: 'Supprime toutes les horloges et recommence à zéro.',
            icon: '🗑️'
        });

        this.tooltips.set('btn-tutorial', {
            title: 'Mode Tutoriel',
            description: 'Guide interactif pas-à-pas pour apprendre les bases du PTP. Parfait pour les débutants!',
            icon: '🎓'
        });

        this.tooltips.set('btn-scenarios', {
            title: 'Scénarios Prédéfinis',
            description: '7 configurations professionnelles prêtes à l\'emploi : industriel, télécom, redondance, etc.',
            icon: '📋'
        });

        this.tooltips.set('btn-save-load', {
            title: 'Sauvegarder / Charger',
            description: 'Sauvegardez vos configurations ou chargez des configurations existantes. Export/Import JSON disponible.',
            icon: '💾'
        });

        // Attacher les event listeners
        this.attachTooltips();
    }

    attachTooltips() {
        this.tooltips.forEach((tooltip, elementId) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener('mouseenter', (e) => this.showTooltip(e, tooltip));
                element.addEventListener('mouseleave', () => this.hideTooltip());
            }
        });
    }

    showTooltip(event, tooltip) {
        this.hideTooltip(); // Cacher l'ancien tooltip

        const target = event.currentTarget;
        const rect = target.getBoundingClientRect();

        const tooltipEl = document.createElement('div');
        tooltipEl.className = 'contextual-tooltip';
        tooltipEl.style.cssText = `
            position: fixed;
            background: var(--bg-primary);
            border: 2px solid var(--color-primary);
            border-radius: 12px;
            padding: 16px;
            max-width: 300px;
            z-index: 10001;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: fadeInTooltip 0.2s ease-out;
            pointer-events: none;
        `;

        tooltipEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 24px;">${tooltip.icon}</span>
                <strong style="color: var(--color-primary); font-size: 16px;">${tooltip.title}</strong>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px; margin: 0; line-height: 1.5;">
                ${tooltip.description}
            </p>
        `;

        document.body.appendChild(tooltipEl);

        // Positionner le tooltip
        const tooltipRect = tooltipEl.getBoundingClientRect();
        let top = rect.bottom + 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        // Ajustements si le tooltip sort de l'écran
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = rect.top - tooltipRect.height - 10;
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;

        this.activeTooltip = tooltipEl;
    }

    hideTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    /**
     * Ajoute un guide de progression pour le guide rapide
     */
    addProgressGuide() {
        const steps = [
            { id: 'btn-add-gm-gps', text: '1. Ajoutez une horloge', completed: false },
            { id: 'config-panel', text: '2. Configurez les paramètres', completed: false },
            { id: 'btn-run-bmca', text: '3. Lancez l\'élection', completed: false }
        ];

        const guideEl = document.createElement('div');
        guideEl.id = 'progress-guide';
        guideEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-primary);
            border: 2px solid var(--color-success);
            border-radius: 12px;
            padding: 20px;
            max-width: 300px;
            z-index: 1000;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;

        guideEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="color: var(--color-success); font-weight: bold; margin: 0;">Guide Rapide</h3>
                <button onclick="this.closest('#progress-guide').remove()" style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 20px;">×</button>
            </div>
            <div id="progress-steps">
                ${steps.map((step, i) => `
                    <div class="progress-step" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--color-success); display: flex; align-items: center; justify-content: center; color: var(--color-success); font-weight: bold; font-size: 12px;">
                            ${i + 1}
                        </div>
                        <span style="color: var(--text-secondary); font-size: 14px;">${step.text}</span>
                    </div>
                `).join('')}
            </div>
        `;

        return guideEl;
    }
}

// Ajouter le style d'animation au document
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInTooltip {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Export for browser use
if (typeof window !== 'undefined') {
    window.ContextualHelp = ContextualHelp;
}
