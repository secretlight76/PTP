/**
 * bmca-stepper.js - Mode pas-à-pas pour l'élection BMCA
 * Permet de visualiser chaque étape de la comparaison avec explications détaillées
 */

class BMCAStepper {
    constructor(simulation, uiManager) {
        this.simulation = simulation;
        this.uiManager = uiManager;
        this.steps = [];
        this.currentStep = 0;
        this.isActive = false;
        this.comparisonData = null;
    }

    /**
     * Démarre le mode pas-à-pas
     */
    async start() {
        if (this.simulation.clocks.length === 0) {
            alert('Veuillez ajouter au moins une horloge à la topologie !');
            return;
        }

        this.isActive = true;
        this.currentStep = 0;

        // Préparer les étapes de comparaison
        await this.prepareSteps();

        // Afficher l'interface pas-à-pas
        this.showStepperUI();

        // Afficher la première étape
        this.showStep(0);
    }

    /**
     * Prépare toutes les étapes de l'élection BMCA
     */
    async prepareSteps() {
        this.steps = [];

        // Grouper par version
        const v1Clocks = this.simulation.clocks.filter(c => c.version === 1);
        const v2Clocks = this.simulation.clocks.filter(c => c.version === 2);

        // Étape d'introduction
        this.steps.push({
            type: 'intro',
            title: '🎯 Démarrage de l\'élection BMCA',
            description: `Nous avons ${this.simulation.clocks.length} horloge(s) à comparer.`,
            details: [
                `PTPv1: ${v1Clocks.length} horloge(s)`,
                `PTPv2: ${v2Clocks.length} horloge(s)`,
                `Nous allons comparer toutes les horloges pour trouver le meilleur Grandmaster.`
            ]
        });

        // Préparer les comparaisons pour chaque version
        if (v2Clocks.length > 0) {
            await this.prepareVersionSteps(v2Clocks, 2);
        }
        if (v1Clocks.length > 0) {
            await this.prepareVersionSteps(v1Clocks, 1);
        }

        // Étape de conclusion
        this.steps.push({
            type: 'conclusion',
            title: '🏆 Élection Terminée!',
            description: 'Le Grandmaster a été élu avec succès.',
            action: 'celebrate'
        });
    }

    /**
     * Prépare les étapes pour une version spécifique
     */
    async prepareVersionSteps(clocks, version) {
        if (clocks.length === 0) return;

        // Étape d'introduction de version
        this.steps.push({
            type: 'version-intro',
            version: version,
            title: `📋 Élection PTPv${version}`,
            description: `Comparaison de ${clocks.length} horloge(s) PTPv${version}`,
            clocks: clocks.map(c => c.id)
        });

        // Grouper par domaine
        const domainMap = new Map();
        clocks.forEach(clock => {
            if (!domainMap.has(clock.domain)) {
                domainMap.set(clock.domain, []);
            }
            domainMap.get(clock.domain).push(clock);
        });

        // Pour chaque domaine
        for (const [domain, domainClocks] of domainMap.entries()) {
            if (domainClocks.length === 0) continue;

            // Intro du domaine
            if (domainMap.size > 1) {
                this.steps.push({
                    type: 'domain-intro',
                    domain: domain,
                    title: `🌐 Domaine ${domain}`,
                    description: `${domainClocks.length} horloge(s) dans ce domaine`,
                    clocks: domainClocks.map(c => c.id)
                });
            }

            // Comparaisons entre toutes les horloges
            let currentBest = domainClocks[0];

            for (let i = 1; i < domainClocks.length; i++) {
                const challenger = domainClocks[i];

                // Créer l'étape de comparaison
                const comparisonStep = this.createComparisonStep(currentBest, challenger, version);
                this.steps.push(comparisonStep);

                // Mettre à jour le meilleur si nécessaire
                if (comparisonStep.winner === challenger.id) {
                    currentBest = challenger;
                }
            }

            // Annoncer le GM du domaine
            this.steps.push({
                type: 'domain-winner',
                domain: domain,
                title: `✅ Grandmaster du Domaine ${domain}`,
                description: `${currentBest.id} est le meilleur dans le domaine ${domain}`,
                winnerId: currentBest.id,
                clock: currentBest
            });
        }
    }

    /**
     * Crée une étape de comparaison détaillée
     */
    createComparisonStep(clockA, clockB, version) {
        const bmca = new BMCA();
        const comparison = bmca.compare(clockA, clockB);

        const step = {
            type: 'comparison',
            version: version,
            title: `⚔️ ${clockA.id} vs ${clockB.id}`,
            clockA: clockA,
            clockB: clockB,
            winner: comparison === 1 ? clockA.id : clockB.id,
            loser: comparison === 1 ? clockB.id : clockA.id,
            comparisons: [],
            reasoning: ''
        };

        // Détailler les comparaisons selon la version
        if (version === 2) {
            step.comparisons = this.getV2Comparisons(clockA, clockB);
        } else {
            step.comparisons = this.getV1Comparisons(clockA, clockB);
        }

        // Trouver le critère décisif
        const decisiveCriterion = step.comparisons.find(c => c.result !== 'equal');
        if (decisiveCriterion) {
            step.reasoning = `${step.winner} gagne grâce à: ${decisiveCriterion.criterion}`;
        }

        return step;
    }

    /**
     * Obtient les comparaisons détaillées pour PTPv2
     */
    getV2Comparisons(clockA, clockB) {
        const comparisons = [];

        // Priority1
        comparisons.push({
            criterion: 'Priority1',
            valueA: clockA.priority1,
            valueB: clockB.priority1,
            result: clockA.priority1 < clockB.priority1 ? 'A' :
                   clockA.priority1 > clockB.priority1 ? 'B' : 'equal',
            explanation: 'Plus la valeur est PETITE, meilleure est l\'horloge'
        });

        // ClockClass
        comparisons.push({
            criterion: 'ClockClass',
            valueA: clockA.clockClass,
            valueB: clockB.clockClass,
            result: clockA.clockClass < clockB.clockClass ? 'A' :
                   clockA.clockClass > clockB.clockClass ? 'B' : 'equal',
            explanation: 'Plus la valeur est PETITE, meilleure est la qualité (6=GPS, 248=Défaut)'
        });

        // ClockAccuracy
        comparisons.push({
            criterion: 'ClockAccuracy',
            valueA: `0x${clockA.clockAccuracy.toString(16)}`,
            valueB: `0x${clockB.clockAccuracy.toString(16)}`,
            result: clockA.clockAccuracy < clockB.clockAccuracy ? 'A' :
                   clockA.clockAccuracy > clockB.clockAccuracy ? 'B' : 'equal',
            explanation: 'Plus la valeur est PETITE, plus précise est l\'horloge'
        });

        // Variance
        comparisons.push({
            criterion: 'Variance',
            valueA: clockA.offsetScaledLogVariance,
            valueB: clockB.offsetScaledLogVariance,
            result: clockA.offsetScaledLogVariance < clockB.offsetScaledLogVariance ? 'A' :
                   clockA.offsetScaledLogVariance > clockB.offsetScaledLogVariance ? 'B' : 'equal',
            explanation: 'Plus la valeur est PETITE, plus stable est l\'horloge'
        });

        // Priority2
        comparisons.push({
            criterion: 'Priority2',
            valueA: clockA.priority2,
            valueB: clockB.priority2,
            result: clockA.priority2 < clockB.priority2 ? 'A' :
                   clockA.priority2 > clockB.priority2 ? 'B' : 'equal',
            explanation: 'Réglage fin avant le tie-breaker final'
        });

        // ClockIdentity
        comparisons.push({
            criterion: 'ClockIdentity',
            valueA: clockA.clockIdentity,
            valueB: clockB.clockIdentity,
            result: clockA.clockIdentity < clockB.clockIdentity ? 'A' : 'B',
            explanation: 'Tie-breaker final (adresse MAC)'
        });

        return comparisons;
    }

    /**
     * Obtient les comparaisons détaillées pour PTPv1
     */
    getV1Comparisons(clockA, clockB) {
        const comparisons = [];

        // Stratum
        comparisons.push({
            criterion: 'Stratum',
            valueA: clockA.stratum,
            valueB: clockB.stratum,
            result: clockA.stratum < clockB.stratum ? 'A' :
                   clockA.stratum > clockB.stratum ? 'B' : 'equal',
            explanation: 'Niveau de qualité (1=primaire, 4=non sync)'
        });

        // Identifier
        comparisons.push({
            criterion: 'Identifier',
            valueA: clockA.identifier,
            valueB: clockB.identifier,
            result: clockA.identifier < clockB.identifier ? 'A' : 'B',
            explanation: 'Identifiant unique (tie-breaker)'
        });

        return comparisons;
    }

    /**
     * Affiche l'interface pas-à-pas
     */
    showStepperUI() {
        const container = document.createElement('div');
        container.id = 'bmca-stepper-overlay';
        container.className = 'fixed inset-0 z-50 flex items-center justify-center';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';

        container.innerHTML = `
            <div class="glass-panel rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto" style="width: 90%; background: var(--bg-primary);">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold" style="color: var(--text-primary);">
                        🎓 Mode Pas-à-Pas BMCA
                    </h2>
                    <button id="btn-close-stepper" class="text-2xl font-bold" style="color: var(--color-error);">
                        ✕
                    </button>
                </div>

                <!-- Progress bar -->
                <div class="mb-6">
                    <div class="flex justify-between text-xs mb-2" style="color: var(--text-tertiary);">
                        <span>Progression</span>
                        <span id="step-counter">0 / ${this.steps.length}</span>
                    </div>
                    <div class="progress-bar">
                        <div id="step-progress-fill" class="progress-bar-fill" style="width: 0%"></div>
                    </div>
                </div>

                <!-- Step content -->
                <div id="step-content" class="min-h-[400px]"></div>

                <!-- Navigation buttons -->
                <div class="flex justify-between mt-6">
                    <button id="btn-prev-step" class="px-6 py-3 rounded-lg font-semibold btn-lift smooth-transition"
                            style="background: var(--color-passive); color: white;" disabled>
                        ⬅️ Précédent
                    </button>
                    <button id="btn-next-step" class="px-6 py-3 rounded-lg font-semibold btn-lift smooth-transition"
                            style="background: var(--color-success); color: white;">
                        Suivant ▶️
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Attacher les événements
        document.getElementById('btn-close-stepper').addEventListener('click', () => this.stop());
        document.getElementById('btn-prev-step').addEventListener('click', () => this.previousStep());
        document.getElementById('btn-next-step').addEventListener('click', () => this.nextStep());
    }

    /**
     * Affiche une étape spécifique
     */
    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;

        this.currentStep = index;
        const step = this.steps[index];

        // Mettre à jour le compteur
        document.getElementById('step-counter').textContent = `${index + 1} / ${this.steps.length}`;

        // Mettre à jour la barre de progression
        const progress = ((index + 1) / this.steps.length) * 100;
        document.getElementById('step-progress-fill').style.width = `${progress}%`;

        // Mettre à jour les boutons
        document.getElementById('btn-prev-step').disabled = index === 0;
        document.getElementById('btn-next-step').disabled = index === this.steps.length - 1;

        // Afficher le contenu selon le type d'étape
        const content = document.getElementById('step-content');

        switch (step.type) {
            case 'intro':
                content.innerHTML = this.renderIntroStep(step);
                break;
            case 'comparison':
                content.innerHTML = this.renderComparisonStep(step);
                this.highlightClocks(step.clockA.id, step.clockB.id);
                break;
            case 'domain-winner':
                content.innerHTML = this.renderDomainWinnerStep(step);
                this.highlightClock(step.winnerId);
                break;
            case 'conclusion':
                content.innerHTML = this.renderConclusionStep(step);
                break;
            default:
                content.innerHTML = this.renderGenericStep(step);
        }
    }

    /**
     * Rend l'étape d'introduction
     */
    renderIntroStep(step) {
        return `
            <div class="text-center slide-in-down">
                <div class="text-6xl mb-4">${step.title.split(' ')[0]}</div>
                <h3 class="text-2xl font-bold mb-4" style="color: var(--text-primary);">
                    ${step.title.substring(2)}
                </h3>
                <p class="text-lg mb-6" style="color: var(--text-secondary);">
                    ${step.description}
                </p>
                <div class="glass-card p-6 rounded-lg text-left">
                    ${step.details.map(d => `
                        <div class="mb-2 text-base" style="color: var(--text-primary);">
                            • ${d}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Rend l'étape de comparaison
     */
    renderComparisonStep(step) {
        return `
            <div class="fade-in">
                <h3 class="text-xl font-bold mb-6 text-center" style="color: var(--text-primary);">
                    ${step.title}
                </h3>

                <!-- Carte VS -->
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="glass-card p-4 rounded-lg flex-1 text-center ${step.winner === step.clockA.id ? 'winner-highlight' : 'loser-highlight'}">
                        <div class="text-3xl mb-2">${PTPIcons.getClockIcon(step.clockA, true)}</div>
                        <div class="font-bold text-lg" style="color: var(--text-primary);">${step.clockA.id}</div>
                        ${step.winner === step.clockA.id ? '<div class="text-2xl mt-2">🏆</div>' : ''}
                    </div>

                    <div class="vs-badge">VS</div>

                    <div class="glass-card p-4 rounded-lg flex-1 text-center ${step.winner === step.clockB.id ? 'winner-highlight' : 'loser-highlight'}">
                        <div class="text-3xl mb-2">${PTPIcons.getClockIcon(step.clockB, true)}</div>
                        <div class="font-bold text-lg" style="color: var(--text-primary);">${step.clockB.id}</div>
                        ${step.winner === step.clockB.id ? '<div class="text-2xl mt-2">🏆</div>' : ''}
                    </div>
                </div>

                <!-- Table de comparaison -->
                <div class="glass-card p-4 rounded-lg mb-4">
                    <h4 class="font-bold mb-3" style="color: var(--text-primary);">Critères de Comparaison (PTPv${step.version}):</h4>
                    <table class="w-full text-sm">
                        <thead>
                            <tr style="border-bottom: 2px solid var(--border-color);">
                                <th class="text-left p-2" style="color: var(--text-primary);">Critère</th>
                                <th class="text-center p-2" style="color: var(--text-primary);">${step.clockA.id}</th>
                                <th class="text-center p-2" style="color: var(--text-primary);">${step.clockB.id}</th>
                                <th class="text-left p-2" style="color: var(--text-primary);">Résultat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${step.comparisons.map((comp, idx) => {
                                const isDecisive = comp.result !== 'equal' && idx === step.comparisons.findIndex(c => c.result !== 'equal');
                                return `
                                    <tr class="${isDecisive ? 'font-bold' : ''}" style="border-bottom: 1px solid var(--border-color); ${isDecisive ? 'background: var(--bg-tertiary);' : ''}">
                                        <td class="p-2" style="color: var(--text-primary);">
                                            ${comp.criterion}
                                            ${isDecisive ? '⭐' : ''}
                                        </td>
                                        <td class="text-center p-2" style="color: var(--text-secondary);">${comp.valueA}</td>
                                        <td class="text-center p-2" style="color: var(--text-secondary);">${comp.valueB}</td>
                                        <td class="p-2" style="color: ${comp.result === 'A' ? 'var(--color-success)' : comp.result === 'B' ? 'var(--color-error)' : 'var(--text-tertiary)'};">
                                            ${comp.result === 'A' ? `${step.clockA.id} gagne` :
                                              comp.result === 'B' ? `${step.clockB.id} gagne` :
                                              'Égalité'}
                                        </td>
                                    </tr>
                                    ${isDecisive ? `
                                        <tr>
                                            <td colspan="4" class="p-2 text-xs" style="color: var(--text-tertiary); background: var(--bg-tertiary);">
                                                💡 ${comp.explanation}
                                            </td>
                                        </tr>
                                    ` : ''}
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Résultat -->
                <div class="glass-card p-4 rounded-lg text-center" style="background: linear-gradient(135deg, var(--color-success), var(--color-info));">
                    <div class="text-white font-bold text-lg">
                        🎯 ${step.reasoning}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Rend l'étape de gagnant de domaine
     */
    renderDomainWinnerStep(step) {
        return `
            <div class="text-center bounce">
                <div class="text-6xl mb-4">🏆</div>
                <h3 class="text-2xl font-bold mb-4" style="color: var(--color-master);">
                    ${step.title}
                </h3>
                <div class="glass-card p-6 rounded-lg mb-4">
                    <div class="text-5xl mb-4">${PTPIcons.getClockIcon(step.clock, true)}</div>
                    <div class="text-3xl font-bold" style="color: var(--text-primary);">${step.winnerId}</div>
                </div>
                <p class="text-lg" style="color: var(--text-secondary);">
                    ${step.description}
                </p>
            </div>
        `;
    }

    /**
     * Rend l'étape de conclusion
     */
    renderConclusionStep(step) {
        return `
            <div class="text-center fade-in">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-3xl font-bold mb-4" style="color: var(--color-success);">
                    ${step.title}
                </h3>
                <p class="text-xl mb-6" style="color: var(--text-secondary);">
                    ${step.description}
                </p>
                <button id="btn-apply-election" class="px-8 py-4 rounded-lg font-bold text-lg btn-lift"
                        style="background: var(--color-master); color: white;">
                    ✅ Appliquer l'Élection
                </button>
            </div>
        `;
    }

    /**
     * Rend une étape générique
     */
    renderGenericStep(step) {
        return `
            <div class="slide-in-down">
                <h3 class="text-xl font-bold mb-4" style="color: var(--text-primary);">
                    ${step.title}
                </h3>
                <p class="text-lg" style="color: var(--text-secondary);">
                    ${step.description}
                </p>
            </div>
        `;
    }

    /**
     * Met en surbrillance deux horloges en comparaison
     */
    highlightClocks(clockIdA, clockIdB) {
        // Enlever toutes les surbrillances
        document.querySelectorAll('.clock-card').forEach(card => {
            card.classList.remove('highlight-compare', 'winner-highlight', 'loser-highlight');
        });

        // Ajouter la surbrillance
        const cardA = document.getElementById(`clock-card-${clockIdA}`);
        const cardB = document.getElementById(`clock-card-${clockIdB}`);

        if (cardA) cardA.classList.add('highlight-compare');
        if (cardB) cardB.classList.add('highlight-compare');
    }

    /**
     * Met en surbrillance une horloge
     */
    highlightClock(clockId) {
        document.querySelectorAll('.clock-card').forEach(card => {
            card.classList.remove('highlight-compare', 'winner-highlight', 'loser-highlight');
        });

        const card = document.getElementById(`clock-card-${clockId}`);
        if (card) card.classList.add('winner-highlight', 'pulse-gm');
    }

    /**
     * Passe à l'étape suivante
     */
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.showStep(this.currentStep + 1);
        }
    }

    /**
     * Revient à l'étape précédente
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Arrête le mode pas-à-pas
     */
    stop() {
        this.isActive = false;

        // Enlever les surbrillances
        document.querySelectorAll('.clock-card').forEach(card => {
            card.classList.remove('highlight-compare', 'winner-highlight', 'loser-highlight', 'pulse-gm');
        });

        // Supprimer l'overlay
        const overlay = document.getElementById('bmca-stepper-overlay');
        if (overlay) overlay.remove();
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.BMCAStepper = BMCAStepper;
}
