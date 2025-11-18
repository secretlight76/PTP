/**
 * performance-charts-chartjs.js - Graphiques de performance avec Chart.js
 * Affiche l'offset et le délai avec des graphiques professionnels interactifs
 */

class PerformanceChartsV2 {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`[PerformanceCharts] Container '${containerId}' not found!`);
            return;
        }

        this.offsetData = [];
        this.delayData = [];
        this.labels = [];
        this.maxDataPoints = 50;
        this.dataPointCounter = 0;

        this.offsetChart = null;
        this.delayChart = null;

        this.initialize();
    }

    /**
     * Initialise les graphiques Chart.js
     */
    initialize() {
        this.container.innerHTML = `
            <div class="space-y-6">
                <!-- Graphique Offset -->
                <div class="performance-chart glass-card p-4 rounded-lg smooth-transition">
                    <h3 class="text-sm font-bold mb-3 flex items-center justify-between" style="color: var(--text-primary);">
                        <span>📊 Offset Temporel (Master → Slave)</span>
                        <button class="text-xs px-2 py-1 rounded hover-scale" style="background: var(--bg-tertiary); color: var(--text-secondary);" onclick="window.uiManager.performanceCharts.clearOffset()">
                            Effacer
                        </button>
                    </h3>
                    <div class="relative" style="height: 180px;">
                        <canvas id="offset-chart-canvas"></canvas>
                    </div>
                    <div class="mt-3 flex justify-around text-xs" style="color: var(--text-tertiary);">
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-info);">Moyenne</div>
                            <div id="offset-avg" class="font-mono font-bold">-</div>
                        </div>
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-success);">Min</div>
                            <div id="offset-min" class="font-mono font-bold">-</div>
                        </div>
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-error);">Max</div>
                            <div id="offset-max" class="font-mono font-bold">-</div>
                        </div>
                    </div>
                </div>

                <!-- Graphique Delay -->
                <div class="performance-chart glass-card p-4 rounded-lg smooth-transition">
                    <h3 class="text-sm font-bold mb-3 flex items-center justify-between" style="color: var(--text-primary);">
                        <span>⏱️ Délai de Propagation (Round-Trip)</span>
                        <button class="text-xs px-2 py-1 rounded hover-scale" style="background: var(--bg-tertiary); color: var(--text-secondary);" onclick="window.uiManager.performanceCharts.clearDelay()">
                            Effacer
                        </button>
                    </h3>
                    <div class="relative" style="height: 180px;">
                        <canvas id="delay-chart-canvas"></canvas>
                    </div>
                    <div class="mt-3 flex justify-around text-xs" style="color: var(--text-tertiary);">
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-info);">Moyenne</div>
                            <div id="delay-avg" class="font-mono font-bold">-</div>
                        </div>
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-success);">Min</div>
                            <div id="delay-min" class="font-mono font-bold">-</div>
                        </div>
                        <div class="text-center">
                            <div class="font-semibold" style="color: var(--color-error);">Max</div>
                            <div id="delay-max" class="font-mono font-bold">-</div>
                        </div>
                    </div>
                </div>

                <!-- Légende enrichie -->
                <div class="glass-card p-4 rounded-lg text-xs" style="color: var(--text-secondary);">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <strong style="color: var(--color-info);">📏 Offset</strong>
                            <p class="mt-1">Différence de temps entre Master et Slave. Doit être proche de 0 pour une bonne sync.</p>
                        </div>
                        <div>
                            <strong style="color: var(--color-success);">🔄 Délai</strong>
                            <p class="mt-1">Temps de propagation des messages sur le réseau. Plus il est faible, meilleure est la précision.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Créer les graphiques Chart.js
        this.createOffsetChart();
        this.createDelayChart();
    }

    /**
     * Crée le graphique d'offset avec Chart.js
     */
    createOffsetChart() {
        const canvas = document.getElementById('offset-chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Obtenir les couleurs CSS
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-info').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

        this.offsetChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Offset (ms)',
                    data: this.offsetData,
                    borderColor: primaryColor,
                    backgroundColor: primaryColor + '33',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: primaryColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: primaryColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Offset: ${context.parsed.y.toFixed(3)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toFixed(1) + ' ms';
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Crée le graphique de délai avec Chart.js
     */
    createDelayChart() {
        const canvas = document.getElementById('delay-chart-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Obtenir les couleurs CSS
        const successColor = getComputedStyle(document.documentElement).getPropertyValue('--color-success').trim();
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();

        this.delayChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.labels,
                datasets: [{
                    label: 'Délai (ms)',
                    data: this.delayData,
                    borderColor: successColor,
                    backgroundColor: successColor + '33',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: successColor,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: successColor,
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Délai: ${context.parsed.y.toFixed(3)} ms`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: gridColor,
                            drawBorder: false
                        },
                        ticks: {
                            color: textColor,
                            callback: function(value) {
                                return value.toFixed(1) + ' ms';
                            }
                        },
                        min: 0
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    /**
     * Ajoute un point de données
     */
    addDataPoint(offset, delay) {
        this.dataPointCounter++;

        // Ajouter les nouvelles données
        this.offsetData.push(offset);
        this.delayData.push(delay);
        this.labels.push(`T${this.dataPointCounter}`);

        // Limiter le nombre de points
        if (this.offsetData.length > this.maxDataPoints) {
            this.offsetData.shift();
            this.delayData.shift();
            this.labels.shift();
        }

        // Mettre à jour les graphiques
        if (this.offsetChart) {
            this.offsetChart.update('none'); // 'none' pour une mise à jour sans animation
        }
        if (this.delayChart) {
            this.delayChart.update('none');
        }

        // Mettre à jour les statistiques
        this.updateStats();
    }

    /**
     * Met à jour les statistiques
     */
    updateStats() {
        // Statistiques Offset
        if (this.offsetData.length > 0) {
            const avgOffset = this.offsetData.reduce((a, b) => a + b, 0) / this.offsetData.length;
            const minOffset = Math.min(...this.offsetData);
            const maxOffset = Math.max(...this.offsetData);

            this.updateStatElement('offset-avg', avgOffset);
            this.updateStatElement('offset-min', minOffset);
            this.updateStatElement('offset-max', maxOffset);
        }

        // Statistiques Delay
        if (this.delayData.length > 0) {
            const avgDelay = this.delayData.reduce((a, b) => a + b, 0) / this.delayData.length;
            const minDelay = Math.min(...this.delayData);
            const maxDelay = Math.max(...this.delayData);

            this.updateStatElement('delay-avg', avgDelay);
            this.updateStatElement('delay-min', minDelay);
            this.updateStatElement('delay-max', maxDelay);
        }
    }

    /**
     * Met à jour un élément de statistique avec animation
     */
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = `${value.toFixed(2)} ms`;
            element.classList.add('bounce');
            setTimeout(() => element.classList.remove('bounce'), 1000);
        }
    }

    /**
     * Efface les données d'offset
     */
    clearOffset() {
        this.offsetData = [];
        if (this.offsetChart) {
            this.offsetChart.update();
        }
        document.getElementById('offset-avg').textContent = '-';
        document.getElementById('offset-min').textContent = '-';
        document.getElementById('offset-max').textContent = '-';
    }

    /**
     * Efface les données de délai
     */
    clearDelay() {
        this.delayData = [];
        if (this.delayChart) {
            this.delayChart.update();
        }
        document.getElementById('delay-avg').textContent = '-';
        document.getElementById('delay-min').textContent = '-';
        document.getElementById('delay-max').textContent = '-';
    }

    /**
     * Efface toutes les données
     */
    clear() {
        this.offsetData = [];
        this.delayData = [];
        this.labels = [];
        this.dataPointCounter = 0;

        if (this.offsetChart) {
            this.offsetChart.update();
        }
        if (this.delayChart) {
            this.delayChart.update();
        }

        // Réinitialiser les stats
        ['offset-avg', 'offset-min', 'offset-max', 'delay-avg', 'delay-min', 'delay-max'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '-';
        });
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.PerformanceCharts = PerformanceChartsV2;
}
