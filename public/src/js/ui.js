/**
 * ui.js - Gestion de l'interface utilisateur
 * Gère l'affichage et les interactions avec les trois panneaux
 */

/**
 * Classe principale de gestion de l'UI
 */
class UIManager {
    constructor() {
        this.simulation = new PTPSimulation();
        this.selectedClock = null;
        this.clockCounter = { OC: 0, BC: 0, TC: 0 };
        this.initializeEventListeners();
    }

    /**
     * Initialise les écouteurs d'événements
     */
    initializeEventListeners() {
        // Boutons d'ajout d'horloges
        document.getElementById('btn-add-oc').addEventListener('click', () => this.addClock(ClockType.ORDINARY_CLOCK));
        document.getElementById('btn-add-bc').addEventListener('click', () => this.addClock(ClockType.BOUNDARY_CLOCK));
        document.getElementById('btn-add-tc-p2p').addEventListener('click', () => this.addClock(ClockType.TRANSPARENT_CLOCK_P2P));
        document.getElementById('btn-add-tc-e2e').addEventListener('click', () => this.addClock(ClockType.TRANSPARENT_CLOCK_E2E));

        // Boutons de simulation
        document.getElementById('btn-run-bmca').addEventListener('click', () => this.runBMCASimulation());
        document.getElementById('btn-run-sync').addEventListener('click', () => this.runSynchronization());
        document.getElementById('btn-reset').addEventListener('click', () => this.resetSimulation());

        // Bouton de sauvegarde de configuration
        document.getElementById('btn-save-config').addEventListener('click', () => this.saveClockConfiguration());

        // Écouteurs pour les changements de version PTP
        document.querySelectorAll('input[name="ptp-version"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.onPTPVersionChange(e.target.value));
        });
    }

    /**
     * Ajoute une nouvelle horloge à la topologie
     */
    addClock(type) {
        let prefix = 'Horloge';
        let counter = 'OC';

        switch (type) {
            case ClockType.ORDINARY_CLOCK:
                prefix = 'Horloge';
                counter = 'OC';
                break;
            case ClockType.BOUNDARY_CLOCK:
                prefix = 'Switch BC';
                counter = 'BC';
                break;
            case ClockType.TRANSPARENT_CLOCK_P2P:
                prefix = 'Switch TC-P2P';
                counter = 'TC';
                break;
            case ClockType.TRANSPARENT_CLOCK_E2E:
                prefix = 'Switch TC-E2E';
                counter = 'TC';
                break;
        }

        this.clockCounter[counter]++;
        const clockId = `${prefix}-${this.clockCounter[counter]}`;

        // Créer la nouvelle horloge (version par défaut: 2)
        const newClock = new PTPClock(clockId, type, 2);

        // Ajouter à la simulation
        this.simulation.addClock(newClock);

        // Ajouter à l'interface
        this.renderClockCard(newClock);

        // Sélectionner automatiquement la nouvelle horloge
        this.selectClock(newClock);
    }

    /**
     * Rend une carte d'horloge dans le panneau 1
     */
    renderClockCard(clock) {
        const container = document.getElementById('topology-container');

        const card = document.createElement('div');
        card.id = `clock-card-${clock.id}`;
        card.className = 'clock-card bg-white rounded-lg shadow-md p-4 cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all';
        card.onclick = () => this.selectClock(clock);

        card.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-bold text-lg">${this.getClockIcon(clock)} ${clock.id}</h3>
                <button onclick="event.stopPropagation(); uiManager.removeClock('${clock.id}')"
                        class="text-red-500 hover:text-red-700 text-xl font-bold">
                    ×
                </button>
            </div>
            <div class="text-sm text-gray-600">
                <div>Type: <span class="font-semibold">${this.formatClockType(clock.type)}</span></div>
                <div>Version: <span class="font-semibold">PTPv${clock.version}</span></div>
                <div>État: <span id="clock-state-${clock.id}" class="font-semibold ${this.getStateColor(clock.state)}">${clock.state}</span></div>
            </div>
        `;

        container.appendChild(card);
    }

    /**
     * Sélectionne une horloge et affiche sa configuration
     */
    selectClock(clock) {
        this.selectedClock = clock;

        // Mettre en surbrillance la carte sélectionnée
        document.querySelectorAll('.clock-card').forEach(card => {
            card.classList.remove('border-blue-600', 'bg-blue-50');
            card.classList.add('border-transparent');
        });

        const selectedCard = document.getElementById(`clock-card-${clock.id}`);
        if (selectedCard) {
            selectedCard.classList.remove('border-transparent');
            selectedCard.classList.add('border-blue-600', 'bg-blue-50');
        }

        // Afficher le panneau de configuration
        this.renderConfigPanel(clock);
    }

    /**
     * Affiche le panneau de configuration pour l'horloge sélectionnée
     */
    renderConfigPanel(clock) {
        const panel = document.getElementById('config-panel');
        panel.innerHTML = ''; // Vider le panneau

        // Titre
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 text-gray-800';
        title.textContent = `Configuration: ${clock.id}`;
        panel.appendChild(title);

        // ID de l'horloge (modifiable)
        panel.appendChild(this.createInputField('ID de l\'horloge', 'clock-id', clock.id, 'text',
            'Identifiant unique de cette horloge dans la topologie'));

        // Version PTP
        const versionDiv = document.createElement('div');
        versionDiv.className = 'mb-4';
        versionDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Version PTP ${this.createTooltip('Choisir entre PTPv1 (IEEE 1588-2002) et PTPv2 (IEEE 1588-2008)')}
            </label>
            <div class="flex gap-4">
                <label class="inline-flex items-center">
                    <input type="radio" name="ptp-version" value="1" ${clock.version === 1 ? 'checked' : ''} class="mr-2">
                    PTPv1
                </label>
                <label class="inline-flex items-center">
                    <input type="radio" name="ptp-version" value="2" ${clock.version === 2 ? 'checked' : ''} class="mr-2">
                    PTPv2
                </label>
            </div>
        `;
        panel.appendChild(versionDiv);

        // Type d'horloge (non modifiable)
        panel.appendChild(this.createInfoField('Type d\'horloge', this.formatClockType(clock.type),
            'Le type d\'horloge détermine son rôle dans le réseau PTP'));

        // Domaine PTP
        panel.appendChild(this.createSliderField('Domaine PTP', 'clock-domain', clock.domain, 0, 127,
            'Le domaine PTP permet de séparer différents réseaux de synchronisation (0-127)'));

        // Paramètres BMCA selon la version
        if (clock.version === 2) {
            this.renderPTPv2Parameters(panel, clock);
        } else {
            this.renderPTPv1Parameters(panel, clock);
        }

        // Paramètres réseau
        panel.appendChild(this.createSliderField('Priorité QoS (DSCP)', 'clock-dscp', clock.dscp, 0, 63,
            'Valeur DSCP pour prioriser les paquets PTP dans les switches (46 = Expedited Forwarding)'));

        // Bouton de sauvegarde
        const saveBtn = document.createElement('button');
        saveBtn.id = 'btn-save-config';
        saveBtn.className = 'w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-colors';
        saveBtn.textContent = '💾 Enregistrer la Configuration';
        panel.appendChild(saveBtn);

        // Ré-attacher l'écouteur
        saveBtn.addEventListener('click', () => this.saveClockConfiguration());

        // Ré-attacher les écouteurs pour les radios
        document.querySelectorAll('input[name="ptp-version"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.onPTPVersionChange(e.target.value));
        });
    }

    /**
     * Affiche les paramètres BMCA pour PTPv2
     */
    renderPTPv2Parameters(panel, clock) {
        const section = document.createElement('div');
        section.id = 'bmca-v2-params';
        section.className = 'mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200';

        section.innerHTML = '<h3 class="text-lg font-bold mb-3 text-blue-800">⚙️ Paramètres BMCA (PTPv2)</h3>';

        // priority1
        section.appendChild(this.createSliderField('Priority1', 'clock-priority1', clock.priority1, 0, 255,
            'Premier critère de sélection du GM. Plus la valeur est PETITE, meilleure est l\'horloge (0 = meilleur, 255 = pire)'));

        // clockClass
        const clockClassDiv = document.createElement('div');
        clockClassDiv.className = 'mb-4';
        clockClassDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Clock Class ${this.createTooltip('Indique la qualité et la source de l\'horloge (6 = GPS/Atomique, 248 = Par défaut, 255 = Slave-only)')}
            </label>
            <select id="clock-class" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="6" ${clock.clockClass === 6 ? 'selected' : ''}>6 - GM primaire (GPS/Atomique)</option>
                <option value="7" ${clock.clockClass === 7 ? 'selected' : ''}>7 - GM primaire (Holdover)</option>
                <option value="52" ${clock.clockClass === 52 ? 'selected' : ''}>52 - GM dégradé A</option>
                <option value="58" ${clock.clockClass === 58 ? 'selected' : ''}>58 - GM dégradé B</option>
                <option value="248" ${clock.clockClass === 248 ? 'selected' : ''}>248 - Par défaut</option>
                <option value="255" ${clock.clockClass === 255 ? 'selected' : ''}>255 - Slave-only (ne peut pas être GM)</option>
            </select>
        `;
        section.appendChild(clockClassDiv);

        // clockAccuracy
        const accuracyDiv = document.createElement('div');
        accuracyDiv.className = 'mb-4';
        accuracyDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Clock Accuracy ${this.createTooltip('Précision de l\'horloge par rapport à une référence UTC')}
            </label>
            <select id="clock-accuracy" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                <option value="0x20" ${clock.clockAccuracy === 0x20 ? 'selected' : ''}>0x20 - &lt; 25ns</option>
                <option value="0x21" ${clock.clockAccuracy === 0x21 ? 'selected' : ''}>0x21 - &lt; 100ns</option>
                <option value="0x22" ${clock.clockAccuracy === 0x22 ? 'selected' : ''}>0x22 - &lt; 250ns</option>
                <option value="0x23" ${clock.clockAccuracy === 0x23 ? 'selected' : ''}>0x23 - &lt; 1μs</option>
                <option value="0x24" ${clock.clockAccuracy === 0x24 ? 'selected' : ''}>0x24 - &lt; 2.5μs</option>
                <option value="0x25" ${clock.clockAccuracy === 0x25 ? 'selected' : ''}>0x25 - &lt; 10μs</option>
                <option value="0xFE" ${clock.clockAccuracy === 0xFE ? 'selected' : ''}>0xFE - Inconnue</option>
            </select>
        `;
        section.appendChild(accuracyDiv);

        // offsetScaledLogVariance
        section.appendChild(this.createSliderField('Offset Scaled Log Variance', 'clock-variance',
            clock.offsetScaledLogVariance, 1000, 30000,
            'Mesure de la stabilité de l\'horloge (jitter). Plus la valeur est PETITE, plus l\'horloge est stable'));

        // priority2
        section.appendChild(this.createSliderField('Priority2', 'clock-priority2', clock.priority2, 0, 255,
            'Dernier critère configurable avant le tie-breaker (clockIdentity). Permet un réglage fin'));

        // clockIdentity (lecture seule)
        section.appendChild(this.createInfoField('Clock Identity', clock.clockIdentity,
            'Identifiant unique IEEE (basé sur l\'adresse MAC). Utilisé comme tie-breaker final'));

        panel.appendChild(section);
    }

    /**
     * Affiche les paramètres BMCA pour PTPv1
     */
    renderPTPv1Parameters(panel, clock) {
        const section = document.createElement('div');
        section.id = 'bmca-v1-params';
        section.className = 'mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200';

        section.innerHTML = '<h3 class="text-lg font-bold mb-3 text-purple-800">⚙️ Paramètres BMCA (PTPv1)</h3>';

        // Stratum
        const stratumDiv = document.createElement('div');
        stratumDiv.className = 'mb-4';
        stratumDiv.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                Stratum ${this.createTooltip('Niveau de qualité de l\'horloge (1 = référence primaire, 4 = qualité faible)')}
            </label>
            <select id="clock-stratum" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500">
                <option value="1" ${clock.stratum === 1 ? 'selected' : ''}>1 - Référence primaire (GPS, Atomique)</option>
                <option value="2" ${clock.stratum === 2 ? 'selected' : ''}>2 - Référence secondaire</option>
                <option value="3" ${clock.stratum === 3 ? 'selected' : ''}>3 - Synchronisé</option>
                <option value="4" ${clock.stratum === 4 ? 'selected' : ''}>4 - Non synchronisé</option>
            </select>
        `;
        section.appendChild(stratumDiv);

        // Identifier (lecture seule)
        section.appendChild(this.createInfoField('Identifier', clock.identifier,
            'Identifiant unique de l\'horloge (équivalent au clockIdentity en PTPv2)'));

        // Precision
        section.appendChild(this.createSliderField('Precision', 'clock-precision', clock.precision, -30, -10,
            'Précision de l\'horloge en log2(secondes). -20 = ~1μs, -30 = ~1ns'));

        // Variance
        section.appendChild(this.createSliderField('Variance', 'clock-v1-variance', clock.variance, 1000, 10000,
            'Estimation de la variance de l\'horloge (stabilité)'));

        panel.appendChild(section);
    }

    /**
     * Gère le changement de version PTP
     */
    onPTPVersionChange(version) {
        if (!this.selectedClock) return;

        const newVersion = parseInt(version);
        this.selectedClock.version = newVersion;

        // Réinitialiser les paramètres selon la version
        if (newVersion === 2) {
            this.selectedClock.priority1 = 128;
            this.selectedClock.clockClass = 248;
            this.selectedClock.clockAccuracy = 0xFE;
            this.selectedClock.offsetScaledLogVariance = 20000;
            this.selectedClock.priority2 = 128;
        } else {
            this.selectedClock.stratum = 3;
            this.selectedClock.precision = -20;
            this.selectedClock.variance = 5000;
        }

        // Re-render le panneau
        this.renderConfigPanel(this.selectedClock);

        // Mettre à jour la carte
        this.updateClockCard(this.selectedClock);
    }

    /**
     * Sauvegarde la configuration de l'horloge sélectionnée
     */
    saveClockConfiguration() {
        if (!this.selectedClock) return;

        const clock = this.selectedClock;

        // Récupérer les valeurs des champs
        const newId = document.getElementById('clock-id')?.value;
        if (newId && newId !== clock.id) {
            // Vérifier que l'ID n'existe pas déjà
            if (this.simulation.getClock(newId)) {
                alert('Cet ID existe déjà ! Choisissez un ID unique.');
                return;
            }
            const oldId = clock.id;
            clock.id = newId;
            // Mettre à jour l'ID de la carte
            const card = document.getElementById(`clock-card-${oldId}`);
            if (card) {
                card.id = `clock-card-${newId}`;
            }
        }

        clock.domain = parseInt(document.getElementById('clock-domain')?.value || 0);
        clock.dscp = parseInt(document.getElementById('clock-dscp')?.value || 0);

        if (clock.version === 2) {
            clock.priority1 = parseInt(document.getElementById('clock-priority1')?.value || 128);
            clock.clockClass = parseInt(document.getElementById('clock-class')?.value || 248);
            clock.clockAccuracy = parseInt(document.getElementById('clock-accuracy')?.value || 0xFE);
            clock.offsetScaledLogVariance = parseInt(document.getElementById('clock-variance')?.value || 20000);
            clock.priority2 = parseInt(document.getElementById('clock-priority2')?.value || 128);
        } else {
            clock.stratum = parseInt(document.getElementById('clock-stratum')?.value || 3);
            clock.precision = parseInt(document.getElementById('clock-precision')?.value || -20);
            clock.variance = parseInt(document.getElementById('clock-v1-variance')?.value || 5000);
        }

        // Mettre à jour l'affichage
        this.updateClockCard(clock);

        // Notification
        this.showNotification('✅ Configuration enregistrée !', 'success');
    }

    /**
     * Met à jour l'affichage d'une carte d'horloge
     */
    updateClockCard(clock) {
        const card = document.getElementById(`clock-card-${clock.id}`);
        if (!card) return;

        card.querySelector('h3').innerHTML = `${this.getClockIcon(clock)} ${clock.id}`;
        card.querySelector(`#clock-state-${clock.id.replace(/[^a-zA-Z0-9-]/g, '_')}`).textContent = clock.state;
    }

    /**
     * Supprime une horloge
     */
    removeClock(clockId) {
        if (confirm(`Voulez-vous vraiment supprimer "${clockId}" ?`)) {
            this.simulation.removeClock(clockId);
            const card = document.getElementById(`clock-card-${clockId}`);
            if (card) card.remove();

            if (this.selectedClock && this.selectedClock.id === clockId) {
                this.selectedClock = null;
                document.getElementById('config-panel').innerHTML = '<p class="text-gray-500 text-center mt-8">Sélectionnez une horloge pour la configurer</p>';
            }
        }
    }

    /**
     * Lance la simulation BMCA
     */
    async runBMCASimulation() {
        if (this.simulation.clocks.length === 0) {
            alert('Veuillez ajouter au moins une horloge à la topologie !');
            return;
        }

        // Désactiver les boutons pendant la simulation
        this.setButtonsEnabled(false);

        // Effacer les logs précédents
        const logPanel = document.getElementById('log-panel');
        logPanel.innerHTML = '';

        // Lancer l'élection
        const gm = await this.simulation.runBMCAElection();

        // Afficher les logs
        this.renderLogs();

        // Mettre à jour les états des cartes
        this.simulation.clocks.forEach(clock => this.updateClockCard(clock));

        // Afficher l'explication
        if (gm) {
            this.renderElectionExplanation();
        }

        // Réactiver les boutons
        this.setButtonsEnabled(true);
    }

    /**
     * Lance la simulation de synchronisation
     */
    async runSynchronization() {
        if (!this.simulation.grandmaster) {
            alert('Veuillez d\'abord lancer l\'élection BMCA !');
            return;
        }

        this.setButtonsEnabled(false);
        await this.simulation.runSynchronization(2);
        this.renderLogs();
        this.setButtonsEnabled(true);
    }

    /**
     * Réinitialise la simulation
     */
    resetSimulation() {
        if (this.simulation.clocks.length > 0) {
            if (!confirm('Voulez-vous vraiment réinitialiser toute la topologie ?')) {
                return;
            }
        }

        // Supprimer toutes les cartes
        document.getElementById('topology-container').innerHTML = '';
        document.getElementById('config-panel').innerHTML = '<p class="text-gray-500 text-center mt-8">Sélectionnez une horloge pour la configurer</p>';
        document.getElementById('log-panel').innerHTML = '';
        document.getElementById('explanation-panel').innerHTML = '';

        // Réinitialiser la simulation
        this.simulation.reset();
        this.selectedClock = null;
        this.clockCounter = { OC: 0, BC: 0, TC: 0 };

        this.showNotification('🔄 Topologie réinitialisée', 'info');
    }

    /**
     * Affiche les logs dans le panneau 3
     */
    renderLogs() {
        const logPanel = document.getElementById('log-panel');
        const logs = this.simulation.getLogs();

        logPanel.innerHTML = '<div class="font-mono text-sm space-y-1">';
        logs.forEach(log => {
            const logLine = document.createElement('div');
            logLine.className = 'log-line';

            // Colorer selon le type de message
            if (log.includes('[ERREUR]')) {
                logLine.className += ' text-red-600 font-bold';
            } else if (log.includes('👑') || log.includes('GRANDMASTER')) {
                logLine.className += ' text-yellow-600 font-bold';
            } else if (log.includes('✅') || log.includes('✓')) {
                logLine.className += ' text-green-600';
            } else if (log.includes('═══')) {
                logLine.className += ' text-blue-700 font-bold';
            } else if (log.includes('───')) {
                logLine.className += ' text-gray-400';
            }

            logLine.textContent = log;
            logPanel.querySelector('div').appendChild(logLine);
        });
        logPanel.innerHTML += '</div>';

        // Scroller vers le bas
        logPanel.scrollTop = logPanel.scrollHeight;
    }

    /**
     * Affiche l'explication de l'élection dans le panneau 3
     */
    renderElectionExplanation() {
        const explanation = this.simulation.generateElectionExplanation();
        if (!explanation) return;

        const explanationPanel = document.getElementById('explanation-panel');
        explanationPanel.innerHTML = '';

        // Titre
        const title = document.createElement('h2');
        title.className = 'text-2xl font-bold mb-4 text-yellow-600';
        title.innerHTML = `👑 ${explanation.winner.id} est le Grandmaster !`;
        explanationPanel.appendChild(title);

        // Résumé
        const summary = document.createElement('p');
        summary.className = 'mb-6 text-gray-700 leading-relaxed';
        summary.textContent = explanation.summary;
        explanationPanel.appendChild(summary);

        // Comparaisons détaillées
        explanation.steps.forEach(step => {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.className = 'mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200';

            const compTitle = document.createElement('h3');
            compTitle.className = 'font-bold text-lg mb-3';
            compTitle.textContent = `${explanation.winner.id} vs ${step.loser.id}`;
            comparisonDiv.appendChild(compTitle);

            const table = document.createElement('table');
            table.className = 'w-full text-sm';
            table.innerHTML = `
                <thead>
                    <tr class="border-b border-gray-300">
                        <th class="text-left py-2">Paramètre</th>
                        <th class="text-center py-2">${explanation.winner.id}</th>
                        <th class="text-center py-2">${step.loser.id}</th>
                        <th class="text-left py-2">Résultat</th>
                    </tr>
                </thead>
                <tbody>
            `;

            step.comparisonSteps.forEach(compStep => {
                const row = document.createElement('tr');
                row.className = 'border-b border-gray-200';

                let resultClass = '';
                if (compStep.result === ComparisonResult.A_BETTER) {
                    resultClass = 'text-green-600 font-bold';
                } else if (compStep.result === ComparisonResult.B_BETTER) {
                    resultClass = 'text-red-600 font-bold';
                } else {
                    resultClass = 'text-gray-500';
                }

                row.innerHTML = `
                    <td class="py-2 font-medium">${compStep.parameter}</td>
                    <td class="py-2 text-center">${compStep.valueA}</td>
                    <td class="py-2 text-center">${compStep.valueB}</td>
                    <td class="py-2 ${resultClass}">${compStep.explanation}</td>
                `;
                table.querySelector('tbody').appendChild(row);
            });

            comparisonDiv.appendChild(table);
            explanationPanel.appendChild(comparisonDiv);
        });
    }

    /**
     * Active/désactive les boutons pendant la simulation
     */
    setButtonsEnabled(enabled) {
        const buttons = [
            'btn-add-oc', 'btn-add-bc', 'btn-add-tc-p2p', 'btn-add-tc-e2e',
            'btn-run-bmca', 'btn-run-sync', 'btn-reset'
        ];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = !enabled;
                if (!enabled) {
                    btn.classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            }
        });
    }

    /**
     * Affiche une notification temporaire
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== Fonctions utilitaires pour créer des éléments UI =====

    createInputField(label, id, value, type = 'text', tooltip = '') {
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <input type="${type}" id="${id}" value="${value}"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
        `;
        return div;
    }

    createSliderField(label, id, value, min, max, tooltip = '') {
        const div = document.createElement('div');
        div.className = 'mb-4';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-2">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <div class="flex items-center gap-3">
                <input type="range" id="${id}" value="${value}" min="${min}" max="${max}"
                       class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                       oninput="document.getElementById('${id}-value').textContent = this.value">
                <span id="${id}-value" class="text-sm font-bold text-gray-700 min-w-[4rem] text-right">${value}</span>
            </div>
        `;
        return div;
    }

    createInfoField(label, value, tooltip = '') {
        const div = document.createElement('div');
        div.className = 'mb-4 p-3 bg-gray-100 rounded-md';
        div.innerHTML = `
            <label class="block text-sm font-medium text-gray-700 mb-1">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <div class="text-sm font-mono text-gray-800">${value}</div>
        `;
        return div;
    }

    createTooltip(text) {
        return `<span class="tooltip inline-block ml-1 text-blue-500 cursor-help" title="${text}">ⓘ</span>`;
    }

    getClockIcon(clock) {
        if (clock.state === ClockState.MASTER) return '👑';
        switch (clock.type) {
            case ClockType.ORDINARY_CLOCK: return '🕐';
            case ClockType.BOUNDARY_CLOCK: return '🔀';
            case ClockType.TRANSPARENT_CLOCK_P2P:
            case ClockType.TRANSPARENT_CLOCK_E2E: return '⚡';
            default: return '⏱️';
        }
    }

    formatClockType(type) {
        const types = {
            [ClockType.ORDINARY_CLOCK]: 'Ordinary Clock (OC)',
            [ClockType.BOUNDARY_CLOCK]: 'Boundary Clock (BC)',
            [ClockType.TRANSPARENT_CLOCK_P2P]: 'Transparent Clock P2P',
            [ClockType.TRANSPARENT_CLOCK_E2E]: 'Transparent Clock E2E'
        };
        return types[type] || type;
    }

    getStateColor(state) {
        const colors = {
            [ClockState.INITIALIZING]: 'text-gray-500',
            [ClockState.MASTER]: 'text-yellow-600',
            [ClockState.SLAVE]: 'text-blue-600',
            [ClockState.PASSIVE]: 'text-purple-600',
            [ClockState.LISTENING]: 'text-green-600'
        };
        return colors[state] || 'text-gray-600';
    }
}

// Instance globale
let uiManager;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    console.log('🚀 Simulateur PTP initialisé');
});
