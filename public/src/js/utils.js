/**
 * utils.js - Utility functions for save/load and charts
 * Provides configuration management and performance visualization
 */

/**
 * Configuration Save/Load Manager
 */
class ConfigManager {
    static STORAGE_KEY = 'ptp-simulator-configs';

    /**
     * Save current configuration to localStorage
     */
    static saveConfiguration(simulation, name) {
        const config = {
            name: name,
            timestamp: new Date().toISOString(),
            clocks: simulation.clocks.map(clock => ({
                id: clock.id,
                type: clock.type,
                version: clock.version,
                state: clock.state,
                domain: clock.domain,
                dscp: clock.dscp,
                announceInterval: clock.announceInterval,
                syncInterval: clock.syncInterval,
                announceReceiptTimeout: clock.announceReceiptTimeout,
                // PTPv2 params
                priority1: clock.priority1,
                clockClass: clock.clockClass,
                clockAccuracy: clock.clockAccuracy,
                offsetScaledLogVariance: clock.offsetScaledLogVariance,
                priority2: clock.priority2,
                clockIdentity: clock.clockIdentity,
                timeSource: clock.timeSource,
                // PTPv1 params
                stratum: clock.stratum,
                identifier: clock.identifier,
                precision: clock.precision,
                variance: clock.variance
            }))
        };

        // Get existing configurations
        const configs = this.getSavedConfigurations();
        configs.push(config);

        // Save to localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));

        return config;
    }

    /**
     * Load configuration from localStorage
     */
    static loadConfiguration(configName, simulation, uiManager) {
        const configs = this.getSavedConfigurations();
        const config = configs.find(c => c.name === configName);

        if (!config) {
            throw new Error('Configuration non trouvée');
        }

        // Clear current simulation
        simulation.reset();
        document.getElementById('topology-container').innerHTML = '';
        document.getElementById('config-panel').innerHTML = '<p class="text-gray-500 text-center mt-8">Sélectionnez une horloge pour la configurer</p>';

        // Recreate clocks
        config.clocks.forEach(clockData => {
            const clock = new PTPClock(clockData.id, clockData.type, clockData.version);

            // Restore all parameters
            Object.assign(clock, clockData);

            simulation.addClock(clock);
            uiManager.renderClockCard(clock);
        });

        return config;
    }

    /**
     * Get all saved configurations
     */
    static getSavedConfigurations() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    }

    /**
     * Delete a configuration
     */
    static deleteConfiguration(configName) {
        const configs = this.getSavedConfigurations();
        const filtered = configs.filter(c => c.name !== configName);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }

    /**
     * Export configuration to JSON file
     */
    static exportToJSON(simulation, name) {
        const config = this.saveConfiguration(simulation, name);
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ptp-config-${name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import configuration from JSON file
     */
    static importFromJSON(file, simulation, uiManager) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);

                    // Clear current simulation
                    simulation.reset();
                    document.getElementById('topology-container').innerHTML = '';

                    // Recreate clocks
                    config.clocks.forEach(clockData => {
                        const clock = new PTPClock(clockData.id, clockData.type, clockData.version);
                        Object.assign(clock, clockData);
                        simulation.addClock(clock);
                        uiManager.renderClockCard(clock);
                    });

                    resolve(config);
                } catch (error) {
                    reject(new Error('Fichier JSON invalide'));
                }
            };

            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsText(file);
        });
    }

    /**
     * Load a predefined scenario
     */
    static loadScenario(scenarioKey, simulation, uiManager) {
        const scenario = PTPScenarios[scenarioKey];
        if (!scenario) {
            throw new Error('Scénario non trouvé');
        }

        // Clear current simulation
        simulation.reset();
        document.getElementById('topology-container').innerHTML = '';
        document.getElementById('config-panel').innerHTML = '<p class="text-gray-500 text-center mt-8">Sélectionnez une horloge pour la configurer</p>';

        // Create clocks from scenario
        scenario.clocks.forEach(clockData => {
            const clock = new PTPClock(clockData.id, clockData.type, clockData.version);
            Object.assign(clock, clockData);
            simulation.addClock(clock);
            uiManager.renderClockCard(clock);
        });

        return scenario;
    }
}

/**
 * Performance Chart Manager
 */
class PerformanceCharts {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = {
            offsets: [],
            delays: [],
            timestamps: []
        };
    }

    /**
     * Add a data point to the chart
     */
    addDataPoint(offset, delay) {
        const timestamp = new Date().toLocaleTimeString();
        this.data.offsets.push(offset);
        this.data.delays.push(delay);
        this.data.timestamps.push(timestamp);

        // Keep only last 50 points
        if (this.data.offsets.length > 50) {
            this.data.offsets.shift();
            this.data.delays.shift();
            this.data.timestamps.shift();
        }

        this.render();
    }

    /**
     * Render the charts using simple SVG
     */
    render() {
        if (this.data.offsets.length === 0) return;

        const width = this.container.clientWidth;
        const height = 300;
        const padding = 40;
        const chartHeight = (height - 3 * padding) / 2;

        this.container.innerHTML = `
            <div style="background: var(--bg-primary); padding: 20px; border-radius: 8px; border: 1px solid var(--border-color);">
                <h3 style="color: var(--text-primary); margin-bottom: 15px; font-weight: bold;">Performance de Synchronisation</h3>
                <svg width="${width}" height="${height}" style="background: var(--bg-secondary); border-radius: 6px;">
                    <!-- Offset Chart -->
                    <text x="10" y="20" fill="var(--text-primary)" font-size="14" font-weight="bold">Offset (ns)</text>
                    ${this.renderLine(this.data.offsets, padding, padding + 20, width - 2 * padding, chartHeight, 'var(--color-success)')}
                    ${this.renderAxis(padding, padding + 20 + chartHeight, width - 2 * padding, chartHeight)}

                    <!-- Delay Chart -->
                    <text x="10" y="${padding + chartHeight + 60}" fill="var(--text-primary)" font-size="14" font-weight="bold">Délai (ns)</text>
                    ${this.renderLine(this.data.delays, padding, padding + chartHeight + 80, width - 2 * padding, chartHeight, 'var(--color-info)')}
                    ${this.renderAxis(padding, padding + 2 * chartHeight + 80, width - 2 * padding, chartHeight)}
                </svg>
                <div style="margin-top: 15px; font-size: 12px; color: var(--text-secondary);">
                    <strong>Statistiques:</strong>
                    Offset moyen: ${this.getAverage(this.data.offsets).toFixed(2)} ns |
                    Délai moyen: ${this.getAverage(this.data.delays).toFixed(2)} ns |
                    Points: ${this.data.offsets.length}
                </div>
            </div>
        `;
    }

    /**
     * Render a line chart
     */
    renderLine(data, x, y, width, height, color) {
        if (data.length < 2) return '';

        const max = Math.max(...data, 1);
        const min = Math.min(...data, 0);
        const range = max - min || 1;

        const points = data.map((value, index) => {
            const px = x + (index / (data.length - 1)) * width;
            const py = y + height - ((value - min) / range) * height;
            return `${px},${py}`;
        }).join(' ');

        return `
            <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" />
            ${data.map((value, index) => {
                const px = x + (index / (data.length - 1)) * width;
                const py = y + height - ((value - min) / range) * height;
                return `<circle cx="${px}" cy="${py}" r="3" fill="${color}" />`;
            }).join('')}
        `;
    }

    /**
     * Render axis
     */
    renderAxis(x, y, width, height) {
        return `
            <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y}" stroke="var(--border-color)" stroke-width="1" />
        `;
    }

    /**
     * Calculate average
     */
    getAverage(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    /**
     * Clear all data
     */
    clear() {
        this.data = {
            offsets: [],
            delays: [],
            timestamps: []
        };
        this.container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 40px;">Aucune donnée de performance. Lancez une synchronisation pour voir les graphiques.</p>';
    }
}

/**
 * Math Formulas Display
 */
class MathFormulas {
    /**
     * Display PTP synchronization formulas with actual values
     */
    static displaySyncFormulas(t1, t2, t3, t4) {
        const offset = ((t2 - t1) - (t4 - t3)) / 2;
        const delay = ((t2 - t1) + (t4 - t3)) / 2;

        return `
            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; border-left: 4px solid var(--color-info); margin: 10px 0;">
                <h3 style="color: var(--text-primary); font-weight: bold; margin-bottom: 15px;">Calculs de Synchronisation PTP</h3>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 6px; margin-bottom: 15px; font-family: monospace;">
                    <div style="color: var(--text-primary); margin-bottom: 10px;">
                        <strong>Timestamps:</strong><br>
                        T1 (Envoi Sync du Master) = ${t1} ns<br>
                        T2 (Réception Sync par Slave) = ${t2} ns<br>
                        T3 (Envoi Delay_Req du Slave) = ${t3} ns<br>
                        T4 (Réception Delay_Req par Master) = ${t4} ns
                    </div>
                </div>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="color: var(--color-success); font-weight: bold; margin-bottom: 8px;">Calcul de l'Offset:</div>
                    <div style="font-family: monospace; color: var(--text-primary); line-height: 1.8;">
                        offset = [(T2 - T1) - (T4 - T3)] / 2<br>
                        offset = [(${t2} - ${t1}) - (${t4} - ${t3})] / 2<br>
                        offset = [${t2 - t1} - ${t4 - t3}] / 2<br>
                        offset = ${(t2 - t1) - (t4 - t3)} / 2<br>
                        <strong style="color: var(--color-success);">offset = ${offset} ns</strong>
                    </div>
                </div>

                <div style="background: var(--bg-primary); padding: 15px; border-radius: 6px;">
                    <div style="color: var(--color-info); font-weight: bold; margin-bottom: 8px;">Calcul du Délai de Propagation:</div>
                    <div style="font-family: monospace; color: var(--text-primary); line-height: 1.8;">
                        delay = [(T2 - T1) + (T4 - T3)] / 2<br>
                        delay = [(${t2} - ${t1}) + (${t4} - ${t3})] / 2<br>
                        delay = [${t2 - t1} + ${t4 - t3}] / 2<br>
                        delay = ${(t2 - t1) + (t4 - t3)} / 2<br>
                        <strong style="color: var(--color-info);">delay = ${delay} ns</strong>
                    </div>
                </div>

                <div style="margin-top: 15px; padding: 10px; background: var(--bg-secondary); border-radius: 6px; font-size: 13px; color: var(--text-secondary);">
                    <strong>Explication:</strong> L'offset représente la différence de temps entre le master et le slave.
                    Le délai représente le temps de propagation des messages sur le réseau.
                </div>
            </div>
        `;
    }

    /**
     * Display timing diagram
     */
    static displayTimingDiagram(t1, t2, t3, t4) {
        return `
            <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; margin: 10px 0;">
                <h3 style="color: var(--text-primary); font-weight: bold; margin-bottom: 15px;">Diagramme Temporel</h3>
                <pre style="color: var(--text-primary); font-family: monospace; font-size: 12px; line-height: 1.6; overflow-x: auto;">
Master                                              Slave
  |                                                   |
  |  T1=${t1}                                         |
  |------------ Sync Message -------------------->   |
  |                                           T2=${t2}|
  |                                                   |
  |                                           T3=${t3}|
  |  <----------- Delay_Req -------------------       |
  |                                                   |
  |  T4=${t4}                                         |
  |------------ Delay_Resp ------------------->      |
  |                                                   |

                Offset = ${((t2 - t1) - (t4 - t3)) / 2} ns
                Delay  = ${((t2 - t1) + (t4 - t3)) / 2} ns
                </pre>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ConfigManager, PerformanceCharts, MathFormulas };
}
