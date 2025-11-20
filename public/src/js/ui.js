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
        this.topology = null;
        this.tutorial = null;
        this.performanceCharts = null;
        this.initializeEventListeners();
        this.initializeNewFeatures();
    }

    initializeNewFeatures() {
        console.log('[PTP] Initializing new features...');

        try {
            // Initialize network topology visualizer
            console.log('[PTP] Creating NetworkTopology...');
            if (typeof NetworkTopology !== 'undefined') {
                this.topology = new NetworkTopology('network-topology-container', this.simulation);
                console.log('[PTP] ✓ NetworkTopology initialized');
            } else {
                console.error('[PTP] ✗ NetworkTopology class not found!');
            }

            // Initialize tutorial
            console.log('[PTP] Creating PTPTutorial...');
            if (typeof PTPTutorial !== 'undefined') {
                this.tutorial = new PTPTutorial(this);
                console.log('[PTP] ✓ PTPTutorial initialized');
            } else {
                console.error('[PTP] ✗ PTPTutorial class not found!');
            }

            // Performance charts désactivés (section supprimée)
            // console.log('[PTP] Creating PerformanceCharts...');
            // if (typeof PerformanceCharts !== 'undefined') {
            //     this.performanceCharts = new PerformanceCharts('performance-charts-container');
            //     console.log('[PTP] ✓ PerformanceCharts initialized');
            // } else {
            //     console.error('[PTP] ✗ PerformanceCharts class not found!');
            // }

            // Initialize contextual help system
            console.log('[PTP] Creating ContextualHelp...');
            if (typeof ContextualHelp !== 'undefined') {
                this.contextualHelp = new ContextualHelp();
                console.log('[PTP] ✓ ContextualHelp initialized');

                // Progress guide removed - was annoying on page load
            } else {
                console.error('[PTP] ✗ ContextualHelp class not found!');
            }

            console.log('[PTP] All features initialized successfully!');
        } catch (error) {
            console.error('[PTP] Error during initialization:', error);
        }
    }

    /**
     * Initialise les écouteurs d'événements
     */
    initializeEventListeners() {
        // Boutons d'ajout d'horloges - avec vérification défensive
        const btnAddOC = document.getElementById('btn-add-oc');
        const btnAddGmGps = document.getElementById('btn-add-gm-gps');
        const btnAddGmAtomic = document.getElementById('btn-add-gm-atomic');
        const btnAddBC = document.getElementById('btn-add-bc');
        const btnAddTcP2P = document.getElementById('btn-add-tc-p2p');
        const btnAddTcE2E = document.getElementById('btn-add-tc-e2e');

        if (btnAddOC) btnAddOC.addEventListener('click', () => this.addClock(ClockType.ORDINARY_CLOCK));
        if (btnAddGmGps) btnAddGmGps.addEventListener('click', () => this.addClock(ClockType.GRANDMASTER_GPS));
        if (btnAddGmAtomic) btnAddGmAtomic.addEventListener('click', () => this.addClock(ClockType.GRANDMASTER_ATOMIC));
        if (btnAddBC) btnAddBC.addEventListener('click', () => this.addClock(ClockType.BOUNDARY_CLOCK));
        if (btnAddTcP2P) btnAddTcP2P.addEventListener('click', () => this.addClock(ClockType.TRANSPARENT_CLOCK_P2P));
        if (btnAddTcE2E) btnAddTcE2E.addEventListener('click', () => this.addClock(ClockType.TRANSPARENT_CLOCK_E2E));

        console.log('[PTP] Device buttons initialized:', {
            OC: !!btnAddOC,
            GM_GPS: !!btnAddGmGps,
            GM_Atomic: !!btnAddGmAtomic,
            BC: !!btnAddBC,
            TC_P2P: !!btnAddTcP2P,
            TC_E2E: !!btnAddTcE2E
        });

        // Boutons de simulation
        const btnRunBMCA = document.getElementById('btn-run-bmca');
        const btnRunSync = document.getElementById('btn-run-sync');
        const btnResetStates = document.getElementById('btn-reset-states');
        const btnReset = document.getElementById('btn-reset');

        if (btnRunBMCA) btnRunBMCA.addEventListener('click', () => this.runBMCASimulation());
        if (btnRunSync) btnRunSync.addEventListener('click', () => this.runSynchronization());
        if (btnResetStates) btnResetStates.addEventListener('click', () => this.resetStates());
        if (btnReset) btnReset.addEventListener('click', () => this.resetSimulation());

        // Bouton de sauvegarde de configuration
        const btnSaveConfig = document.getElementById('btn-save-config');
        if (btnSaveConfig) btnSaveConfig.addEventListener('click', () => this.saveClockConfiguration());

        // Nouveaux boutons
        const btnTutorial = document.getElementById('btn-tutorial');
        const btnScenarios = document.getElementById('btn-scenarios');
        const btnSaveLoad = document.getElementById('btn-save-load');

        if (btnTutorial) {
            btnTutorial.addEventListener('click', () => {
                console.log('[PTP] Tutorial button clicked!');
                this.startTutorial();
            });
            console.log('[PTP] ✓ Tutorial button listener attached');
        } else {
            console.error('[PTP] ✗ Tutorial button not found!');
        }

        if (btnScenarios) {
            btnScenarios.addEventListener('click', () => {
                console.log('[PTP] Scenarios button clicked!');
                this.showScenariosDialog();
            });
            console.log('[PTP] ✓ Scenarios button listener attached');
        } else {
            console.error('[PTP] ✗ Scenarios button not found!');
        }

        if (btnSaveLoad) {
            btnSaveLoad.addEventListener('click', () => {
                console.log('[PTP] Save/Load button clicked!');
                this.showSaveLoadDialog();
            });
            console.log('[PTP] ✓ Save/Load button listener attached');
        } else {
            console.error('[PTP] ✗ Save/Load button not found!');
        }

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
            case ClockType.GRANDMASTER_GPS:
                prefix = 'GM-GPS';
                counter = 'OC';
                break;
            case ClockType.GRANDMASTER_ATOMIC:
                prefix = 'GM-ATOMIC';
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

        // Ajouter à la topologie visuelle
        if (this.topology) {
            this.topology.addClock(newClock);
        }

        // Mettre à jour le compteur de devices
        this.updateDeviceCount();

        // Auto-expand la section topologie pour montrer le nouveau device
        const topologySection = document.getElementById('network-topology-section');
        if (topologySection && topologySection.classList.contains('collapsed')) {
            toggleSection('network-topology-section');
        }

        // Sélectionner automatiquement la nouvelle horloge
        this.selectClock(newClock);
    }

    /**
     * Met à jour le compteur de devices
     */
    updateDeviceCount() {
        const deviceCountSpans = document.querySelectorAll('#device-count');
        deviceCountSpans.forEach(span => {
            span.textContent = this.simulation.clocks.length;
        });
    }

    /**
     * renderClockCard n'est plus utilisé - les devices sont affichés dans la topologie visuelle
     * Cette fonction est conservée pour compatibilité mais ne fait rien
     */
    renderClockCard(clock) {
        // No-op: Les devices sont maintenant affichés uniquement dans la topologie visuelle
    }

    /**
     * Sélectionne une horloge et affiche sa configuration
     */
    selectClock(clock) {
        this.selectedClock = clock;

        // Afficher le panneau de configuration
        this.renderConfigPanel(clock);
    }

    /**
     * Affiche le panneau de configuration pour l'horloge sélectionnée
     */
    renderConfigPanel(clock) {
        const panel = document.getElementById('config-panel');
        panel.innerHTML = ''; // Vider le panneau

        // Titre compact
        const title = document.createElement('h2');
        title.style.cssText = 'font-size: 11px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary); font-family: "Roboto Mono", monospace; padding-bottom: 4px; border-bottom: 2px solid var(--color-info);';
        title.textContent = clock.id;
        panel.appendChild(title);

        // ID de l'horloge (modifiable)
        panel.appendChild(this.createInputField('ID de l\'horloge', 'clock-id', clock.id, 'text',
            'Identifiant unique de cette horloge dans la topologie'));

        // Version PTP
        const versionDiv = document.createElement('div');
        versionDiv.style.cssText = 'margin-bottom: 6px;';
        versionDiv.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace;">
                Version ${this.createTooltip('v1/v2')}
            </label>
            <div style="display: flex; gap: 6px; font-size: 9px;">
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="radio" name="ptp-version" value="1" ${clock.version === 1 ? 'checked' : ''} style="margin-right: 3px;">
                    v1
                </label>
                <label style="display: flex; align-items: center; cursor: pointer;">
                    <input type="radio" name="ptp-version" value="2" ${clock.version === 2 ? 'checked' : ''} style="margin-right: 3px;">
                    v2
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

        // Intervalles de messages PTP
        const intervalsSection = document.createElement('div');
        intervalsSection.style.cssText = 'margin-bottom: 6px; padding: 4px; background: var(--bg-tertiary); border-radius: 3px; border: 1px solid var(--border-color);';
        intervalsSection.innerHTML = '<h3 style="font-size: 9px; font-weight: 700; margin-bottom: 4px; color: var(--text-primary); font-family: \'Roboto Mono\', monospace;">Intervalles</h3>';

        intervalsSection.appendChild(this.createSliderField('Announce Interval (log2)', 'clock-announce-interval',
            clock.announceInterval, -1, 4,
            'Intervalle entre messages Announce. Valeur en log2 secondes (0 = 1s, 1 = 2s, 2 = 4s)'));

        intervalsSection.appendChild(this.createSliderField('Sync Interval (log2)', 'clock-sync-interval',
            clock.syncInterval, -7, 4,
            'Intervalle entre messages Sync. Valeur en log2 secondes (-1 = 0.5s, 0 = 1s, 1 = 2s)'));

        intervalsSection.appendChild(this.createSliderField('Announce Receipt Timeout', 'clock-announce-timeout',
            clock.announceReceiptTimeout, 2, 10,
            'Nombre de périodes Announce manquées avant timeout'));

        panel.appendChild(intervalsSection);

        // Bouton de sauvegarde ultra-compact
        const saveBtn = document.createElement('button');
        saveBtn.id = 'btn-save-config';
        saveBtn.style.cssText = 'width: 100%; box-sizing: border-box; background: var(--color-success); color: white; font-weight: 700; padding: 5px 6px; border-radius: 3px; margin-top: 6px; border: none; cursor: pointer; font-size: 9px; font-family: "Roboto Mono", monospace; transition: opacity 0.2s;';
        saveBtn.textContent = '💾 Save';
        saveBtn.onmouseenter = () => saveBtn.style.opacity = '0.8';
        saveBtn.onmouseleave = () => saveBtn.style.opacity = '1';
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
        section.style.cssText = 'margin-bottom: 6px; padding: 4px; background: var(--bg-tertiary); border-radius: 3px; border: 1px solid var(--color-primary);';

        section.innerHTML = '<h3 style="font-size: 9px; font-weight: 700; margin-bottom: 4px; color: var(--color-primary); font-family: \'Roboto Mono\', monospace;">BMCA v2</h3>';

        // priority1
        section.appendChild(this.createSliderField('Priority1', 'clock-priority1', clock.priority1, 0, 255,
            'Premier critère de sélection du GM. Plus la valeur est PETITE, meilleure est l\'horloge (0 = meilleur, 255 = pire)'));

        // clockClass
        const clockClassDiv = document.createElement('div');
        clockClassDiv.style.cssText = 'margin-bottom: 6px;';
        clockClassDiv.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace;">
                Class ${this.createTooltip('6=GPS, 248=Défaut, 255=Slave')}
            </label>
            <select id="clock-class" style="width: 100%; box-sizing: border-box; padding: 3px 4px; font-size: 8px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary); font-family: 'Roboto Mono', monospace;">
                <option value="6" ${clock.clockClass === 6 ? 'selected' : ''}>6-GPS</option>
                <option value="7" ${clock.clockClass === 7 ? 'selected' : ''}>7-Holdover</option>
                <option value="52" ${clock.clockClass === 52 ? 'selected' : ''}>52-Dégr.A</option>
                <option value="58" ${clock.clockClass === 58 ? 'selected' : ''}>58-Dégr.B</option>
                <option value="248" ${clock.clockClass === 248 ? 'selected' : ''}>248-Déf</option>
                <option value="255" ${clock.clockClass === 255 ? 'selected' : ''}>255-Slave</option>
            </select>
        `;
        section.appendChild(clockClassDiv);

        // clockAccuracy
        const accuracyDiv = document.createElement('div');
        accuracyDiv.style.cssText = 'margin-bottom: 6px;';
        accuracyDiv.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace;">
                Accuracy ${this.createTooltip('Précision UTC')}
            </label>
            <select id="clock-accuracy" style="width: 100%; box-sizing: border-box; padding: 3px 4px; font-size: 8px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary); font-family: 'Roboto Mono', monospace;">
                <option value="0x20" ${clock.clockAccuracy === 0x20 ? 'selected' : ''}>&lt;25ns</option>
                <option value="0x21" ${clock.clockAccuracy === 0x21 ? 'selected' : ''}>&lt;100ns</option>
                <option value="0x22" ${clock.clockAccuracy === 0x22 ? 'selected' : ''}>&lt;250ns</option>
                <option value="0x23" ${clock.clockAccuracy === 0x23 ? 'selected' : ''}>&lt;1μs</option>
                <option value="0x24" ${clock.clockAccuracy === 0x24 ? 'selected' : ''}>&lt;2.5μs</option>
                <option value="0x25" ${clock.clockAccuracy === 0x25 ? 'selected' : ''}>&lt;10μs</option>
                <option value="0xFE" ${clock.clockAccuracy === 0xFE ? 'selected' : ''}>Inconnu</option>
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

        // timeSource (lecture seule)
        if (clock.timeSource !== undefined) {
            section.appendChild(this.createInfoField('Time Source', this.formatTimeSource(clock.timeSource),
                'Source de référence temporelle utilisée par cette horloge'));
        }

        panel.appendChild(section);
    }

    /**
     * Formate la source de temps pour affichage
     */
    formatTimeSource(source) {
        const sources = {
            [TimeSource.ATOMIC_CLOCK]: 'Horloge Atomique',
            [TimeSource.GPS]: 'GPS',
            [TimeSource.TERRESTRIAL_RADIO]: 'Radio Terrestre',
            [TimeSource.PTP]: 'PTP',
            [TimeSource.NTP]: 'NTP',
            [TimeSource.HAND_SET]: 'Manuel',
            [TimeSource.OTHER]: 'Autre',
            [TimeSource.INTERNAL_OSCILLATOR]: 'Oscillateur Interne'
        };
        return sources[source] || `0x${source.toString(16)}`;
    }

    /**
     * Affiche les paramètres BMCA pour PTPv1
     */
    renderPTPv1Parameters(panel, clock) {
        const section = document.createElement('div');
        section.id = 'bmca-v1-params';
        section.style.cssText = 'margin-bottom: 6px; padding: 4px; background: var(--bg-tertiary); border-radius: 3px; border: 1px solid var(--color-passive);';

        section.innerHTML = '<h3 style="font-size: 9px; font-weight: 700; margin-bottom: 4px; color: var(--color-passive); font-family: \'Roboto Mono\', monospace;">BMCA v1</h3>';

        // Stratum
        const stratumDiv = document.createElement('div');
        stratumDiv.style.cssText = 'margin-bottom: 6px;';
        stratumDiv.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace;">
                Stratum ${this.createTooltip('1=prim, 4=faible')}
            </label>
            <select id="clock-stratum" style="width: 100%; box-sizing: border-box; padding: 3px 4px; font-size: 8px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary); font-family: 'Roboto Mono', monospace;">
                <option value="1" ${clock.stratum === 1 ? 'selected' : ''}>1-Prim</option>
                <option value="2" ${clock.stratum === 2 ? 'selected' : ''}>2-Sec</option>
                <option value="3" ${clock.stratum === 3 ? 'selected' : ''}>3-Sync</option>
                <option value="4" ${clock.stratum === 4 ? 'selected' : ''}>4-No</option>
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

        // Sauvegarder les intervalles de messages
        clock.announceInterval = parseInt(document.getElementById('clock-announce-interval')?.value || 1);
        clock.syncInterval = parseInt(document.getElementById('clock-sync-interval')?.value || 0);
        clock.announceReceiptTimeout = parseInt(document.getElementById('clock-announce-timeout')?.value || 3);

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
        this.showNotification('Configuration enregistrée !', 'success');
    }

    /**
     * Met à jour l'affichage d'une carte d'horloge COMPACTE
     */
    updateClockCard(clock) {
        // Mettre à jour uniquement la topologie visuelle (les cartes n'existent plus)
        if (this.topology) {
            this.topology.updateNode(clock);
        }
    }

    /**
     * Supprime une horloge
     */
    removeClock(clockId) {
        if (confirm(`Voulez-vous vraiment supprimer "${clockId}" ?`)) {
            this.simulation.removeClock(clockId);
            const card = document.getElementById(`clock-card-${clockId}`);
            if (card) card.remove();

            // Supprimer de la topologie visuelle
            if (this.topology) {
                this.topology.removeNode(clockId);
            }

            // Mettre à jour le compteur de devices
            this.updateDeviceCount();

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

        try {
            // Lancer l'élection
            const gm = await this.simulation.runBMCAElection();

            // Afficher les logs
            this.renderLogs();

            // Mettre à jour les états des cartes
            this.simulation.clocks.forEach(clock => this.updateClockCard(clock));

            // Mettre à jour la topologie visuelle (liens master-slave)
            if (this.topology) {
                this.topology.updateLinks();
            }

            // Afficher l'explication
            if (gm) {
                this.renderElectionExplanation();

                // Ajouter l'animation pulse sur la carte du GM
                const gmCard = document.getElementById(`clock-card-${gm.id}`);
                if (gmCard) {
                    gmCard.classList.add('pulse-gm', 'winner-highlight');
                }

                // Lancer les confettis pour célébrer !
                if (typeof ConfettiSystem !== 'undefined') {
                    const confetti = new ConfettiSystem();
                    confetti.celebrate(3000, 50);
                    setTimeout(() => confetti.starRain(2000), 500);
                }

                // Notification removed - was hidden and useless
            }
        } catch (error) {
            console.error('Erreur lors de la simulation BMCA:', error);
            this.showNotification('Erreur lors de la simulation', 'error');
        } finally {
            // Toujours réactiver les boutons, même en cas d'erreur
            this.setButtonsEnabled(true);
        }
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

        // Animer les messages sur la topologie
        const gm = this.simulation.grandmaster;
        const slaves = this.simulation.clocks.filter(c => c.state === ClockState.SLAVE);

        for (const slave of slaves) {
            // Animer Sync
            if (this.topology) {
                this.topology.animateMessage(gm.id, slave.id, 'SYNC', 800);
            }
            await this.simulation.sleep(400);

            // Animer Delay_Req
            if (this.topology) {
                this.topology.animateMessage(slave.id, gm.id, 'DELAY_REQ', 800);
            }
            await this.simulation.sleep(400);

            // Animer Delay_Resp
            if (this.topology) {
                this.topology.animateMessage(gm.id, slave.id, 'DELAY_RESP', 800);
            }
            await this.simulation.sleep(400);
        }

        // Exécuter la simulation normale
        await this.simulation.runSynchronization(2);
        this.renderLogs();

        // Afficher les formules mathématiques avec des valeurs simulées
        const t1 = Date.now();
        const t2 = t1 + 1000 + Math.random() * 100;
        const t3 = t2 + 500;
        const t4 = t3 + 1000 + Math.random() * 100;

        const formulasContainer = document.getElementById('math-formulas-container');
        formulasContainer.innerHTML = MathFormulas.displaySyncFormulas(t1, t2, t3, t4);
        formulasContainer.innerHTML += MathFormulas.displayTimingDiagram(t1, t2, t3, t4);

        // Ajouter des données de performance
        const offset = ((t2 - t1) - (t4 - t3)) / 2;
        const delay = ((t2 - t1) + (t4 - t3)) / 2;
        // Performance charts désactivés
        // if (this.performanceCharts) {
        //     this.performanceCharts.addDataPoint(offset, delay);
        //     const performanceSection = document.getElementById('performance-section');
        //     if (performanceSection && performanceSection.classList.contains('collapsed')) {
        //         toggleSection('performance-section');
        //     }
        // }

        this.setButtonsEnabled(true);
    }

    /**
     * Réinitialise uniquement les états des horloges (pas la topologie)
     */
    resetStates() {
        if (this.simulation.clocks.length === 0) {
            this.showNotification('Aucune horloge dans la topologie', 'info');
            return;
        }

        // Réinitialiser les états de toutes les horloges
        this.simulation.clocks.forEach(clock => {
            clock.setState(ClockState.INITIALIZING);
            clock.masterClock = null;
            clock.syncsSent = 0;
            clock.syncsReceived = 0;
            this.updateClockCard(clock);
        });

        // Réinitialiser le grandmaster
        this.simulation.grandmaster = null;
        this.simulation.clearLogs();

        // Effacer les logs et l'explication
        document.getElementById('log-panel').innerHTML = '<p class="text-gray-400 text-center">Les logs de simulation apparaîtront ici...</p>';
        document.getElementById('explanation-panel').innerHTML = '<p class="text-gray-400 text-center">L\'explication de l\'élection apparaîtra après la simulation BMCA...</p>';

        this.showNotification('États réinitialisés - Prêt pour une nouvelle élection', 'info');
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

        // Réinitialiser les panneaux
        document.getElementById('config-panel').innerHTML = '<p class="text-center mt-8" style="color: var(--text-tertiary);">Cliquez sur un node dans la topologie pour configurer</p>';
        document.getElementById('log-panel').innerHTML = '';
        document.getElementById('explanation-panel').innerHTML = '';

        // Réinitialiser la topologie visuelle
        if (this.topology) {
            this.topology.clear();
        }

        // Réinitialiser les graphiques de performance
        if (this.performanceCharts) {
            this.performanceCharts.clear();
        }

        // Réinitialiser la simulation
        this.simulation.reset();
        this.selectedClock = null;
        this.clockCounter = { OC: 0, BC: 0, TC: 0 };

        // Mettre à jour le compteur de devices
        this.updateDeviceCount();

        this.showNotification('Topologie réinitialisée', 'info');
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
            } else if (log.includes('[RÉSULTAT]')) {
                logLine.className += ' text-green-700 font-bold text-lg bg-green-50 p-2 rounded';
            } else if (log.includes('GRANDMASTER')) {
                logLine.className += ' text-yellow-600 font-bold';
            } else if (log.includes('ÉLECTION TERMINÉE')) {
                logLine.className += ' text-green-700 font-bold';
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

        // Bannière de résultat avec icône et bouton mode pas-à-pas
        const banner = document.createElement('div');
        banner.className = 'glass-card p-6 rounded-lg mb-6 shadow-lg breathe';
        banner.style.background = 'linear-gradient(135deg, var(--color-master), var(--color-warning))';
        banner.innerHTML = `
            <div class="text-center text-white">
                <div class="text-6xl mb-3">${typeof PTPIcons !== 'undefined' ? PTPIcons.grandmaster(true) : '👑'}</div>
                <div class="text-3xl font-bold mb-2">${explanation.winner.id}</div>
                <div class="text-xl mb-4">est le Grandmaster</div>
                <div class="flex gap-3 justify-center mt-4">
                    <button id="btn-step-by-step" class="px-4 py-2 rounded-lg font-semibold btn-lift smooth-transition"
                            style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white;">
                        📚 Voir Pas-à-Pas
                    </button>
                    <button onclick="window.richTooltips?.show('bmca', this)" class="px-4 py-2 rounded-lg font-semibold btn-lift smooth-transition"
                            style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white;">
                        ❓ C'est quoi le BMCA?
                    </button>
                </div>
            </div>
        `;
        explanationPanel.appendChild(banner);

        // Attacher l'événement pour le bouton pas-à-pas
        setTimeout(() => {
            const btnStepByStep = document.getElementById('btn-step-by-step');
            if (btnStepByStep) {
                btnStepByStep.addEventListener('click', () => {
                    if (typeof BMCAStepper !== 'undefined') {
                        const stepper = new BMCAStepper(this.simulation, this);
                        stepper.start();
                    } else {
                        alert('Le mode pas-à-pas n\'est pas disponible. Veuillez recharger la page.');
                    }
                });
            }
        }, 100);

        // Résumé avec style amélioré
        const summary = document.createElement('div');
        summary.className = 'mb-6 glass-card p-4 rounded-lg';
        summary.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="text-3xl">📋</div>
                <div>
                    <h4 class="font-bold mb-2" style="color: var(--text-primary);">Résumé de l'Élection</h4>
                    <p class="text-sm" style="color: var(--text-secondary);">${explanation.summary}</p>
                </div>
            </div>
        `;
        explanationPanel.appendChild(summary);

        // Comparaisons détaillées avec icônes et boutons "Pourquoi?"
        explanation.steps.forEach((step, stepIndex) => {
            const comparisonDiv = document.createElement('div');
            comparisonDiv.className = 'mb-6 glass-card p-4 rounded-lg smooth-transition hover-shadow';

            // Titre avec icônes VS
            const compTitle = document.createElement('div');
            compTitle.className = 'flex items-center justify-between mb-4';
            compTitle.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-2xl">⚔️</span>
                    <h3 class="font-bold text-lg" style="color: var(--text-primary);">
                        ${explanation.winner.id} vs ${step.loser.id}
                    </h3>
                </div>
                <button class="px-3 py-1 rounded text-xs font-semibold hover-scale smooth-transition"
                        style="background: var(--color-info); color: white;"
                        onclick="window.richTooltips?.show('bmca', this)">
                    ❓ Pourquoi?
                </button>
            `;
            comparisonDiv.appendChild(compTitle);

            const table = document.createElement('table');
            table.className = 'w-full text-sm';
            table.innerHTML = `
                <thead>
                    <tr style="border-bottom: 2px solid var(--border-color);">
                        <th class="text-left py-2" style="color: var(--text-primary);">Critère</th>
                        <th class="text-center py-2" style="color: var(--text-primary);">${explanation.winner.id}</th>
                        <th class="text-center py-2" style="color: var(--text-primary);">${step.loser.id}</th>
                        <th class="text-left py-2" style="color: var(--text-primary);">Résultat</th>
                    </tr>
                </thead>
                <tbody>
            `;

            step.comparisonSteps.forEach(compStep => {
                const row = document.createElement('tr');
                row.className = 'border-b';
                row.style.borderColor = 'var(--border-color)';

                let resultIcon = '';
                let resultClass = '';
                if (compStep.result === ComparisonResult.A_BETTER) {
                    resultIcon = typeof PTPIcons !== 'undefined' ? PTPIcons.check() : '✓';
                    resultClass = 'font-bold';
                    row.style.color = 'var(--color-success)';
                } else if (compStep.result === ComparisonResult.B_BETTER) {
                    resultIcon = typeof PTPIcons !== 'undefined' ? PTPIcons.cross() : '✗';
                    resultClass = 'font-bold';
                    row.style.color = 'var(--color-error)';
                } else {
                    resultIcon = '=';
                    row.style.color = 'var(--text-tertiary)';
                }

                row.innerHTML = `
                    <td class="py-2 font-medium" style="color: var(--text-primary);">
                        ${compStep.parameter}
                    </td>
                    <td class="py-2 text-center" style="color: var(--text-secondary);">${compStep.valueA}</td>
                    <td class="py-2 text-center" style="color: var(--text-secondary);">${compStep.valueB}</td>
                    <td class="py-2 ${resultClass}">
                        ${resultIcon} ${compStep.explanation}
                    </td>
                `;
                table.querySelector('tbody').appendChild(row);
            });

            comparisonDiv.appendChild(table);
            explanationPanel.appendChild(comparisonDiv);
        });

        // Bouton pour revoir en mode pas-à-pas
        const reviewButton = document.createElement('div');
        reviewButton.className = 'mt-6 text-center';
        reviewButton.innerHTML = `
            <button id="btn-review-step-by-step" class="px-6 py-3 rounded-lg font-bold btn-lift smooth-transition"
                    style="background: var(--color-primary); color: white;">
                🎓 Revoir l'Élection Pas-à-Pas
            </button>
        `;
        explanationPanel.appendChild(reviewButton);

        // Attacher l'événement
        setTimeout(() => {
            const btnReview = document.getElementById('btn-review-step-by-step');
            if (btnReview) {
                btnReview.addEventListener('click', () => {
                    if (typeof BMCAStepper !== 'undefined') {
                        const stepper = new BMCAStepper(this.simulation, this);
                        stepper.start();
                    }
                });
            }
        }, 100);
    }

    /**
     * Active/désactive les boutons pendant la simulation
     */
    setButtonsEnabled(enabled) {
        const buttons = [
            'btn-add-oc', 'btn-add-gm-gps', 'btn-add-gm-atomic', 'btn-add-bc',
            'btn-add-tc-p2p', 'btn-add-tc-e2e',
            'btn-run-bmca', 'btn-run-sync', 'btn-reset-states', 'btn-reset'
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
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 16px;
            right: 16px;
            padding: 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            z-index: 10001;
            transition: opacity 0.3s;
            font-weight: bold;
            ${type === 'success' ? 'background-color: #059669; color: white; font-size: 1.125rem;' :
              type === 'error' ? 'background-color: #dc2626; color: white;' :
              'background-color: #0891b2; color: white;'}
        `;
        notification.style.opacity = '0';
        notification.textContent = message;
        document.body.appendChild(notification);

        // Fade in
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);

        // Fade out
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // ===== Fonctions utilitaires pour créer des éléments UI =====

    createInputField(label, id, value, type = 'text', tooltip = '') {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom: 6px;';
        div.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <input type="${type}" id="${id}" value="${value}"
                   style="width: 100%; box-sizing: border-box; padding: 3px 4px; font-size: 9px; border: 1px solid var(--border-color); border-radius: 3px; background: var(--bg-primary); color: var(--text-primary); font-family: 'Roboto Mono', monospace;">
        `;
        return div;
    }

    createSliderField(label, id, value, min, max, tooltip = '') {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom: 6px;';
        div.innerHTML = `
            <label style="display: block; font-size: 9px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <div style="display: flex; align-items: center; gap: 4px;">
                <input type="range" id="${id}" value="${value}" min="${min}" max="${max}"
                       style="flex: 1; height: 4px; background: var(--bg-tertiary); border-radius: 2px; cursor: pointer;"
                       oninput="document.getElementById('${id}-value').textContent = this.value">
                <span id="${id}-value" style="font-size: 9px; font-weight: 700; color: var(--text-primary); min-width: 28px; text-align: right; font-family: 'Roboto Mono', monospace;">${value}</span>
            </div>
        `;
        return div;
    }

    createInfoField(label, value, tooltip = '') {
        const div = document.createElement('div');
        div.style.cssText = 'margin-bottom: 6px; padding: 4px; background: var(--bg-tertiary); border-radius: 3px; border: 1px solid var(--border-color); box-sizing: border-box;';
        div.innerHTML = `
            <label style="display: block; font-size: 8px; font-weight: 600; color: var(--text-tertiary); margin-bottom: 2px; font-family: 'Roboto Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${label} ${tooltip ? this.createTooltip(tooltip) : ''}
            </label>
            <div style="font-size: 9px; font-family: 'Roboto Mono', monospace; color: var(--text-primary); font-weight: 500; word-break: break-all;">${value}</div>
        `;
        return div;
    }

    createTooltip(text) {
        return `<span class="tooltip inline-block ml-1 text-blue-500 cursor-help" title="${text}">ⓘ</span>`;
    }

    getClockIcon(clock) {
        // Utiliser les icônes SVG animées si disponibles
        if (typeof PTPIcons !== 'undefined') {
            return PTPIcons.getClockIcon(clock, true);
        }

        // Fallback sur les icônes textuelles
        if (clock.state === ClockState.MASTER) return '[GM]';
        switch (clock.type) {
            case ClockType.ORDINARY_CLOCK: return '[OC]';
            case ClockType.GRANDMASTER_GPS: return '[GPS]';
            case ClockType.GRANDMASTER_ATOMIC: return '[ATOMIC]';
            case ClockType.BOUNDARY_CLOCK: return '[BC]';
            case ClockType.TRANSPARENT_CLOCK_P2P: return '[TC-P2P]';
            case ClockType.TRANSPARENT_CLOCK_E2E: return '[TC-E2E]';
            default: return '[CLK]';
        }
    }

    formatClockType(type) {
        const types = {
            [ClockType.ORDINARY_CLOCK]: 'Ordinary Clock (OC)',
            [ClockType.GRANDMASTER_GPS]: 'Grandmaster GPS',
            [ClockType.GRANDMASTER_ATOMIC]: 'Grandmaster Atomique',
            [ClockType.BOUNDARY_CLOCK]: 'Boundary Clock (BC)',
            [ClockType.TRANSPARENT_CLOCK_P2P]: 'Transparent Clock P2P',
            [ClockType.TRANSPARENT_CLOCK_E2E]: 'Transparent Clock E2E'
        };
        return types[type] || type;
    }

    getStateColor(state) {
        const colors = {
            [ClockState.INITIALIZING]: 'color: var(--text-tertiary);',
            [ClockState.DISABLED]: 'color: var(--color-disabled);',
            [ClockState.MASTER]: 'color: var(--color-master);',
            [ClockState.SLAVE]: 'color: var(--color-slave);',
            [ClockState.PASSIVE]: 'color: var(--color-passive);',
            [ClockState.LISTENING]: 'color: var(--color-success);',
            [ClockState.FAULTY]: 'color: var(--color-error);'
        };
        return colors[state] || 'color: var(--text-secondary);';
    }

    // ===== Nouvelles Fonctionnalités =====

    /**
     * Démarrer le mode tutoriel
     */
    startTutorial() {
        console.log('[PTP] startTutorial called, tutorial instance:', this.tutorial);
        try {
            if (this.tutorial) {
                this.tutorial.start();
            } else {
                console.error('[PTP] Tutorial not initialized!');
                this.showNotification('Erreur: Le tutoriel n\'est pas disponible', 'error');
            }
        } catch (error) {
            console.error('[PTP] Error starting tutorial:', error);
            this.showNotification('Erreur lors du démarrage du tutoriel', 'error');
        }
    }

    /**
     * Afficher la boîte de dialogue des scénarios
     */
    showScenariosDialog() {
        console.log('[PTP] showScenariosDialog called');
        try {
            if (typeof PTPScenarios === 'undefined') {
                console.error('[PTP] PTPScenarios not loaded!');
                this.showNotification('Erreur: Les scénarios ne sont pas disponibles', 'error');
                return;
            }
            const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10005;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const scenarioList = Object.keys(PTPScenarios).map(key => {
            const scenario = PTPScenarios[key];
            return `
                <div class="scenario-item" style="padding: 15px; margin: 10px 0; background: var(--bg-secondary); border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;"
                     onmouseover="this.style.borderColor='var(--color-primary)'; this.style.background='var(--bg-tertiary)';"
                     onmouseout="this.style.borderColor='transparent'; this.style.background='var(--bg-secondary)';"
                     onclick="window.uiManager.loadScenario('${key}'); this.closest('[style*=fixed]').remove();">
                    <h4 style="color: var(--color-primary); font-weight: bold; margin-bottom: 5px;">${scenario.name}</h4>
                    <p style="color: var(--text-secondary); font-size: 14px;">${scenario.description}</p>
                    <p style="color: var(--text-tertiary); font-size: 12px; margin-top: 5px;">${scenario.clocks.length} horloges</p>
                </div>
            `;
        }).join('');

        dialog.innerHTML = `
            <div style="background: var(--bg-primary); border-radius: 12px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <h2 style="color: var(--text-primary); margin-bottom: 20px; font-size: 24px;">Scénarios Prédéfinis</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">Sélectionnez un scénario pour charger une configuration prête à l'emploi :</p>
                ${scenarioList}
                <button onclick="this.closest('[style*=fixed]').remove();"
                        style="margin-top: 20px; width: 100%; background: var(--color-error); color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Fermer
                </button>
            </div>
        `;

            document.body.appendChild(dialog);
        } catch (error) {
            console.error('[PTP] Error showing scenarios dialog:', error);
            this.showNotification('Erreur lors de l\'affichage des scénarios', 'error');
        }
    }

    /**
     * Charger un scénario
     */
    loadScenario(scenarioKey) {
        try {
            const scenario = ConfigManager.loadScenario(scenarioKey, this.simulation, this);
            this.showNotification(`Scénario "${scenario.name}" chargé avec succès !`, 'success');
            console.log('[PTP] Scénario chargé:', scenario.name, '- Horloges:', this.simulation.clocks.length);
        } catch (error) {
            this.showNotification('Erreur lors du chargement du scénario', 'error');
            console.error('[PTP] Erreur chargement scénario:', error);
        }
    }

    /**
     * Afficher la boîte de dialogue sauvegarde/chargement
     */
    showSaveLoadDialog() {
        console.log('[PTP] showSaveLoadDialog called');
        try {
            if (typeof ConfigManager === 'undefined') {
                console.error('[PTP] ConfigManager not loaded!');
                this.showNotification('Erreur: Le gestionnaire de configuration n\'est pas disponible', 'error');
                return;
            }
            const savedConfigs = ConfigManager.getSavedConfigurations();

        const configList = savedConfigs.map(config => `
            <div style="padding: 10px; margin: 8px 0; background: var(--bg-secondary); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: var(--text-primary); font-weight: bold;">${config.name}</div>
                    <div style="color: var(--text-tertiary); font-size: 12px;">${new Date(config.timestamp).toLocaleString()} - ${config.clocks.length} horloges</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.uiManager.loadConfig('${config.name}'); this.closest('[style*=fixed]').remove();"
                            style="background: var(--color-success); color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Charger
                    </button>
                    <button onclick="window.uiManager.deleteConfig('${config.name}'); this.closest('[style*=fixed]').remove(); window.uiManager.showSaveLoadDialog();"
                            style="background: var(--color-error); color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Supprimer
                    </button>
                </div>
            </div>
        `).join('') || '<p style="color: var(--text-tertiary); text-align: center; padding: 20px;">Aucune configuration sauvegardée</p>';

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        dialog.innerHTML = `
            <div style="background: var(--bg-primary); border-radius: 12px; padding: 30px; max-width: 600px; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <h2 style="color: var(--text-primary); margin-bottom: 20px; font-size: 24px;">Sauvegarder / Charger</h2>

                <!-- Save Section -->
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 10px; font-size: 18px;">Sauvegarder la Configuration Actuelle</h3>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="config-name-input" placeholder="Nom de la configuration"
                               style="flex: 1; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);">
                        <button onclick="window.uiManager.saveCurrentConfig(); this.closest('[style*=fixed]').remove();"
                                style="background: var(--color-primary); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            Sauvegarder
                        </button>
                    </div>
                    <button onclick="window.uiManager.exportConfig();"
                            style="margin-top: 10px; width: 100%; background: var(--color-info); color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        📥 Exporter en JSON
                    </button>
                </div>

                <!-- Load Section -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 10px; font-size: 18px;">Configurations Sauvegardées</h3>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${configList}
                    </div>
                </div>

                <!-- Import Section -->
                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 10px; font-size: 18px;">Importer depuis JSON</h3>
                    <input type="file" id="import-file-input" accept=".json"
                           style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-secondary); color: var(--text-primary);">
                    <button onclick="window.uiManager.importConfig(); this.closest('[style*=fixed]').remove();"
                            style="margin-top: 10px; width: 100%; background: var(--color-success); color: white; padding: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        📤 Importer
                    </button>
                </div>

                <button onclick="this.closest('[style*=fixed]').remove();"
                        style="width: 100%; background: var(--color-error); color: white; padding: 12px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    Fermer
                </button>
            </div>
        `;

            document.body.appendChild(dialog);
        } catch (error) {
            console.error('[PTP] Error showing save/load dialog:', error);
            this.showNotification('Erreur lors de l\'affichage du gestionnaire de configuration', 'error');
        }
    }

    /**
     * Sauvegarder la configuration actuelle
     */
    saveCurrentConfig() {
        const nameInput = document.getElementById('config-name-input');
        const name = nameInput?.value.trim() || `Config-${Date.now()}`;

        if (this.simulation.clocks.length === 0) {
            alert('Aucune horloge à sauvegarder !');
            return;
        }

        try {
            ConfigManager.saveConfiguration(this.simulation, name);
            this.showNotification(`Configuration "${name}" sauvegardée !`, 'success');
        } catch (error) {
            this.showNotification('Erreur lors de la sauvegarde', 'error');
            console.error(error);
        }
    }

    /**
     * Charger une configuration
     */
    loadConfig(configName) {
        try {
            ConfigManager.loadConfiguration(configName, this.simulation, this);

            // Mettre à jour la topologie visuelle
            if (this.topology) {
                this.topology.clear();
                this.simulation.clocks.forEach(clock => {
                    this.topology.addClock(clock);
                });
            }

            this.showNotification(`Configuration "${configName}" chargée !`, 'success');
        } catch (error) {
            this.showNotification('Erreur lors du chargement', 'error');
            console.error(error);
        }
    }

    /**
     * Supprimer une configuration
     */
    deleteConfig(configName) {
        if (confirm(`Supprimer la configuration "${configName}" ?`)) {
            ConfigManager.deleteConfiguration(configName);
            this.showNotification(`Configuration "${configName}" supprimée`, 'info');
        }
    }

    /**
     * Exporter la configuration actuelle en JSON
     */
    exportConfig() {
        const nameInput = document.getElementById('config-name-input');
        const name = nameInput?.value.trim() || `Config-${Date.now()}`;

        if (this.simulation.clocks.length === 0) {
            alert('Aucune horloge à exporter !');
            return;
        }

        try {
            ConfigManager.exportToJSON(this.simulation, name);
            this.showNotification(`Configuration exportée !`, 'success');
        } catch (error) {
            this.showNotification('Erreur lors de l\'export', 'error');
            console.error(error);
        }
    }

    /**
     * Importer une configuration depuis JSON
     */
    async importConfig() {
        const fileInput = document.getElementById('import-file-input');
        const file = fileInput?.files[0];

        if (!file) {
            alert('Veuillez sélectionner un fichier !');
            return;
        }

        try {
            await ConfigManager.importFromJSON(file, this.simulation, this);

            // Mettre à jour la topologie visuelle
            if (this.topology) {
                this.topology.clear();
                this.simulation.clocks.forEach(clock => {
                    this.topology.addClock(clock);
                });
            }

            this.showNotification('Configuration importée !', 'success');
        } catch (error) {
            this.showNotification('Erreur lors de l\'import', 'error');
            console.error(error);
        }
    }
}

// Instance globale
let uiManager;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    uiManager = new UIManager();
    window.uiManager = uiManager; // Make it globally accessible for dialog onclick handlers
    console.log('Simulateur PTP initialisé');
});
