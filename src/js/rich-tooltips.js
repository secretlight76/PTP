/**
 * rich-tooltips.js - Système de tooltips enrichis pour l'apprentissage
 * Affiche des explications détaillées avec exemples et visuels
 */

class RichTooltips {
    constructor() {
        this.currentTooltip = null;
        this.tooltips = this.initializeTooltipContent();
    }

    /**
     * Initialise le contenu des tooltips pédagogiques
     */
    initializeTooltipContent() {
        return {
            'priority1': {
                title: 'Priority1',
                icon: '1️⃣',
                description: 'Premier critère de sélection du Grandmaster (configurable par l\'administrateur)',
                details: [
                    '<strong>Valeur:</strong> 0-255 (plus petit = meilleur)',
                    '<strong>Défaut:</strong> 128',
                    '<strong>Usage:</strong> Permet de forcer une horloge à devenir GM'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>💡 Exemple:</strong><br>
                        Si vous voulez qu'une horloge devienne toujours GM, mettez priority1 = 0<br>
                        Les autres horloges avec priority1 = 128 ne gagneront jamais
                    </div>
                `,
                link: 'https://en.wikipedia.org/wiki/Precision_Time_Protocol#Best_master_clock_algorithm'
            },
            'clockClass': {
                title: 'Clock Class',
                icon: '🏆',
                description: 'Indique la qualité et la source de synchronisation de l\'horloge',
                details: [
                    '<strong>6:</strong> Horloge primaire (GPS, Atomique) - Meilleure qualité',
                    '<strong>7:</strong> Horloge primaire en mode Holdover',
                    '<strong>52-58:</strong> Horloge dégradée',
                    '<strong>248:</strong> Horloge par défaut (non sync)',
                    '<strong>255:</strong> Slave-only (ne peut JAMAIS être GM)'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>🔥 Astuce:</strong><br>
                        Une horloge GPS aura clockClass = 6<br>
                        Une horloge ordinateur aura clockClass = 248<br>
                        La GPS gagnera TOUJOURS (si priority1 est égal)
                    </div>
                `
            },
            'clockAccuracy': {
                title: 'Clock Accuracy',
                icon: '🎯',
                description: 'Précision de l\'horloge par rapport à une référence UTC',
                details: [
                    '<strong>0x20:</strong> < 25 nanoseco ndes (excellent)',
                    '<strong>0x21:</strong> < 100 nanosecondes',
                    '<strong>0x23:</strong> < 1 microseconde',
                    '<strong>0x25:</strong> < 10 microsecondes',
                    '<strong>0xFE:</strong> Précision inconnue'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>📏 Échelle:</strong><br>
                        1 seconde = 1 000 ms<br>
                        1 ms = 1 000 µs<br>
                        1 µs = 1 000 ns<br>
                        <br>
                        Une horloge atomique: ~25 ns<br>
                        Un oscillateur interne: ~10 µs
                    </div>
                `
            },
            'variance': {
                title: 'Offset Scaled Log Variance',
                icon: '📊',
                description: 'Mesure de la stabilité de l\'horloge (jitter, dérive)',
                details: [
                    '<strong>Plus petit = meilleur</strong>',
                    'Mesure les variations de l\'horloge au fil du temps',
                    'Horloge stable: ~5000',
                    'Horloge instable: ~20000+'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>🌡️ Analogie:</strong><br>
                        Imaginez une horloge qui avance parfois, recule parfois...<br>
                        La variance mesure cette instabilité.<br>
                        Une bonne horloge est prévisible et stable!
                    </div>
                `
            },
            'domain': {
                title: 'Domaine PTP',
                icon: '🌐',
                description: 'Les domaines PTP permettent de séparer différents réseaux de synchronisation',
                details: [
                    '<strong>Valeur:</strong> 0-127 (ou 0-255 selon la spec)',
                    '<strong>Domaine 0:</strong> Domaine par défaut',
                    'Les horloges de domaines différents NE PEUVENT PAS communiquer',
                    'Permet d\'avoir plusieurs réseaux PTP indépendants'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>🔐 Cas d\'usage:</strong><br>
                        • Domaine 0: Production<br>
                        • Domaine 1: Test<br>
                        • Domaine 2: Développement<br>
                        <br>
                        Chaque domaine a son propre Grandmaster!
                    </div>
                `
            },
            'offset': {
                title: 'Offset Temporel',
                icon: '⏰',
                description: 'Différence de temps entre le Master et le Slave',
                details: [
                    'Calculé via: [(t₂ - t₁) - (t₄ - t₃)] / 2',
                    'Devrait être proche de 0 pour une bonne synchronisation',
                    'Si positif: Slave est en avance',
                    'Si négatif: Slave est en retard'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>🎯 Objectif:</strong><br>
                        Offset < 1 ms: Excellent<br>
                        Offset < 10 ms: Bon<br>
                        Offset > 100 ms: Problème réseau
                    </div>
                `
            },
            'delay': {
                title: 'Délai de Propagation',
                icon: '🚀',
                description: 'Temps que mettent les messages PTP à traverser le réseau',
                details: [
                    'Calculé via: [(t₂ - t₁) + (t₄ - t₃)] / 2',
                    'Mesure le temps aller-retour (round-trip)',
                    'Dépend de la distance et de la qualité du réseau',
                    'Plus petit = meilleur'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>📡 Exemples:</strong><br>
                        Réseau local (LAN): < 1 ms<br>
                        Réseau distant (WAN): 10-50 ms<br>
                        Internet: 50-200 ms<br>
                        <br>
                        PTP fonctionne mieux en LAN!
                    </div>
                `
            },
            'bmca': {
                title: 'Best Master Clock Algorithm',
                icon: '🏆',
                description: 'Algorithme qui détermine quelle horloge devient le Grandmaster',
                details: [
                    'Compare toutes les horloges selon des critères stricts',
                    'Hiérarchie claire: Priority1 → ClockClass → Accuracy → Variance → Priority2 → ClockIdentity',
                    'Déterministe: toujours le même résultat',
                    'S\'exécute automatiquement toutes les 2 secondes (announce interval)'
                ],
                example: `
                    <div class="mt-3 p-3 rounded" style="background: var(--bg-tertiary);">
                        <strong>⚔️ Analogie du combat:</strong><br>
                        Imaginez un tournoi où les horloges se battent.<br>
                        À chaque round, on compare un critère.<br>
                        La première différence décide du gagnant!<br>
                        Le champion final = Grandmaster
                    </div>
                `
            }
        };
    }

    /**
     * Affiche un tooltip enrichi
     */
    show(key, targetElement) {
        // Supprimer le tooltip existant
        this.hide();

        const tooltipData = this.tooltips[key];
        if (!tooltipData) {
            console.warn(`Tooltip "${key}" not found`);
            return;
        }

        // Créer le tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'rich-tooltip-active';
        tooltip.className = 'rich-tooltip fade-in';

        tooltip.innerHTML = `
            <div class="glass-card p-4 rounded-lg shadow-2xl" style="max-width: 400px;">
                <div class="flex items-center gap-2 mb-3">
                    <span class="text-2xl">${tooltipData.icon}</span>
                    <h4 class="font-bold text-lg" style="color: var(--text-primary);">${tooltipData.title}</h4>
                    <button class="ml-auto text-xl" onclick="window.richTooltips.hide()" style="color: var(--color-error);">✕</button>
                </div>

                <p class="text-sm mb-3" style="color: var(--text-secondary);">
                    ${tooltipData.description}
                </p>

                ${tooltipData.details ? `
                    <div class="mb-3 text-xs space-y-1" style="color: var(--text-tertiary);">
                        ${tooltipData.details.map(d => `<div>• ${d}</div>`).join('')}
                    </div>
                ` : ''}

                ${tooltipData.example || ''}

                ${tooltipData.link ? `
                    <div class="mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
                        <a href="${tooltipData.link}" target="_blank" class="text-xs" style="color: var(--color-info);">
                            📚 En savoir plus →
                        </a>
                    </div>
                ` : ''}
            </div>
        `;

        // Positionner le tooltip
        document.body.appendChild(tooltip);

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        // Position par défaut: au-dessus de l'élément
        let top = rect.top - tooltipRect.height - 10;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        // Si pas assez de place en haut, mettre en dessous
        if (top < 10) {
            top = rect.bottom + 10;
        }

        // Ajuster si sort de l'écran à gauche/droite
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        this.currentTooltip = tooltip;
    }

    /**
     * Cache le tooltip actif
     */
    hide() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * Crée un bouton d'aide qui ouvre un tooltip
     */
    createHelpButton(key, text = '?') {
        const button = document.createElement('button');
        button.className = 'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold hover-scale smooth-transition';
        button.style.cssText = 'background: var(--color-info); color: white; margin-left: 4px;';
        button.textContent = text;
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.show(key, button);
        };
        return button;
    }

    /**
     * Ajoute des tooltips enrichis aux éléments existants
     */
    enhanceExistingTooltips() {
        // Trouver tous les éléments avec l'attribut data-tooltip
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            const key = element.getAttribute('data-tooltip');
            const helpButton = this.createHelpButton(key);
            element.appendChild(helpButton);
        });
    }
}

// Export et instance globale
if (typeof window !== 'undefined') {
    window.RichTooltips = RichTooltips;
    window.richTooltips = new RichTooltips();

    // Cacher le tooltip en cliquant en dehors
    document.addEventListener('click', (e) => {
        if (window.richTooltips.currentTooltip &&
            !window.richTooltips.currentTooltip.contains(e.target) &&
            !e.target.closest('[data-tooltip]')) {
            window.richTooltips.hide();
        }
    });
}
