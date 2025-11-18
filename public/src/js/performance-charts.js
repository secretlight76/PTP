/**
 * performance-charts.js - Module de visualisation des graphiques de performance PTP
 * Affiche l'offset et le délai de synchronisation en temps réel
 */

class PerformanceCharts {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`[PerformanceCharts] Container '${containerId}' not found!`);
            return;
        }

        this.offsetData = [];
        this.delayData = [];
        this.maxDataPoints = 50;

        this.initialize();
    }

    /**
     * Initialise les graphiques
     */
    initialize() {
        this.container.innerHTML = `
            <div class="space-y-6">
                <!-- Graphique Offset -->
                <div class="performance-chart">
                    <h3 class="text-sm font-bold mb-2" style="color: var(--text-primary);">
                        Offset Temporel (Master → Slave)
                    </h3>
                    <div class="relative" style="height: 150px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); padding: 10px;">
                        <canvas id="offset-chart"></canvas>
                    </div>
                    <div class="mt-2 text-xs" style="color: var(--text-tertiary);">
                        <span>Moyenne: <strong id="offset-avg">-</strong></span>
                        <span class="ml-4">Min: <strong id="offset-min">-</strong></span>
                        <span class="ml-4">Max: <strong id="offset-max">-</strong></span>
                    </div>
                </div>

                <!-- Graphique Delay -->
                <div class="performance-chart">
                    <h3 class="text-sm font-bold mb-2" style="color: var(--text-primary);">
                        Délai de Propagation (Round-Trip)
                    </h3>
                    <div class="relative" style="height: 150px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); padding: 10px;">
                        <canvas id="delay-chart"></canvas>
                    </div>
                    <div class="mt-2 text-xs" style="color: var(--text-tertiary);">
                        <span>Moyenne: <strong id="delay-avg">-</strong></span>
                        <span class="ml-4">Min: <strong id="delay-min">-</strong></span>
                        <span class="ml-4">Max: <strong id="delay-max">-</strong></span>
                    </div>
                </div>

                <!-- Légende -->
                <div class="text-xs p-3 rounded" style="background: var(--bg-tertiary); color: var(--text-secondary);">
                    <p><strong>Offset</strong> : Différence de temps entre le Master et le Slave (doit être proche de 0)</p>
                    <p class="mt-1"><strong>Délai</strong> : Temps de propagation des messages sur le réseau</p>
                </div>
            </div>
        `;

        this.offsetCanvas = document.getElementById('offset-chart');
        this.delayCanvas = document.getElementById('delay-chart');

        if (this.offsetCanvas && this.delayCanvas) {
            this.offsetCtx = this.offsetCanvas.getContext('2d');
            this.delayCtx = this.delayCanvas.getContext('2d');

            // Ajuster la taille des canvas
            this.resizeCanvases();

            // Dessiner les axes initiaux
            this.drawChart(this.offsetCtx, [], 'Offset (ms)');
            this.drawChart(this.delayCtx, [], 'Délai (ms)');
        }
    }

    /**
     * Ajuste la taille des canvas à leur conteneur
     */
    resizeCanvases() {
        const canvases = [this.offsetCanvas, this.delayCanvas];
        canvases.forEach(canvas => {
            const parent = canvas.parentElement;
            canvas.width = parent.clientWidth - 20;
            canvas.height = parent.clientHeight - 20;
        });
    }

    /**
     * Ajoute un point de données
     */
    addDataPoint(offset, delay) {
        // Ajouter les nouvelles données
        this.offsetData.push(offset);
        this.delayData.push(delay);

        // Limiter le nombre de points
        if (this.offsetData.length > this.maxDataPoints) {
            this.offsetData.shift();
            this.delayData.shift();
        }

        // Redessiner les graphiques
        this.drawChart(this.offsetCtx, this.offsetData, 'Offset (ms)', 'var(--color-info)');
        this.drawChart(this.delayCtx, this.delayData, 'Délai (ms)', 'var(--color-success)');

        // Mettre à jour les statistiques
        this.updateStats();
    }

    /**
     * Dessine un graphique
     */
    drawChart(ctx, data, label, color = 'var(--color-primary)') {
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;
        const plotWidth = width - 2 * padding;
        const plotHeight = height - 2 * padding;

        // Effacer le canvas
        ctx.clearRect(0, 0, width, height);

        // Couleurs
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim();
        const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim();
        const lineColor = getComputedStyle(document.documentElement).getPropertyValue(color.replace('var(', '').replace(')', '')).trim();

        // Dessiner la grille
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        // Lignes horizontales
        for (let i = 0; i <= 4; i++) {
            const y = padding + (plotHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Lignes verticales
        for (let i = 0; i <= 5; i++) {
            const x = padding + (plotWidth / 5) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Dessiner les axes
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Si pas de données, afficher le label et retourner
        if (data.length === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('Aucune donnée', width / 2, height / 2);
            return;
        }

        // Calculer les échelles
        const maxValue = Math.max(...data.map(Math.abs), 1);
        const minValue = -maxValue;
        const range = maxValue - minValue;

        // Dessiner la ligne de données
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((value, index) => {
            const x = padding + (plotWidth / Math.max(data.length - 1, 1)) * index;
            const y = height - padding - ((value - minValue) / range) * plotHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Dessiner les points
        ctx.fillStyle = lineColor;
        data.forEach((value, index) => {
            const x = padding + (plotWidth / Math.max(data.length - 1, 1)) * index;
            const y = height - padding - ((value - minValue) / range) * plotHeight;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Labels des axes
        ctx.fillStyle = textColor;
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';

        // Labels Y (valeurs)
        for (let i = 0; i <= 4; i++) {
            const value = maxValue - (range / 4) * i;
            const y = padding + (plotHeight / 4) * i;
            ctx.fillText(value.toFixed(1), padding - 5, y + 3);
        }

        // Label X (temps)
        ctx.textAlign = 'center';
        ctx.fillText('Temps →', width / 2, height - 5);
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

            document.getElementById('offset-avg').textContent = `${avgOffset.toFixed(2)} ms`;
            document.getElementById('offset-min').textContent = `${minOffset.toFixed(2)} ms`;
            document.getElementById('offset-max').textContent = `${maxOffset.toFixed(2)} ms`;
        }

        // Statistiques Delay
        if (this.delayData.length > 0) {
            const avgDelay = this.delayData.reduce((a, b) => a + b, 0) / this.delayData.length;
            const minDelay = Math.min(...this.delayData);
            const maxDelay = Math.max(...this.delayData);

            document.getElementById('delay-avg').textContent = `${avgDelay.toFixed(2)} ms`;
            document.getElementById('delay-min').textContent = `${minDelay.toFixed(2)} ms`;
            document.getElementById('delay-max').textContent = `${maxDelay.toFixed(2)} ms`;
        }
    }

    /**
     * Efface toutes les données
     */
    clear() {
        this.offsetData = [];
        this.delayData = [];

        if (this.offsetCtx && this.delayCtx) {
            this.drawChart(this.offsetCtx, [], 'Offset (ms)');
            this.drawChart(this.delayCtx, [], 'Délai (ms)');

            // Réinitialiser les stats
            document.getElementById('offset-avg').textContent = '-';
            document.getElementById('offset-min').textContent = '-';
            document.getElementById('offset-max').textContent = '-';
            document.getElementById('delay-avg').textContent = '-';
            document.getElementById('delay-min').textContent = '-';
            document.getElementById('delay-max').textContent = '-';
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.PerformanceCharts = PerformanceCharts;
}
