/**
 * confetti.js - Système de confettis pour célébrer l'élection du Grandmaster
 */

class ConfettiSystem {
    constructor() {
        this.container = null;
    }

    /**
     * Lance l'animation de confettis
     * @param {number} duration - Durée en millisecondes
     * @param {number} count - Nombre de confettis
     */
    celebrate(duration = 3000, count = 50) {
        // Créer le conteneur s'il n'existe pas
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'confetti-container';
            this.container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 10000;
            `;
            document.body.appendChild(this.container);
        }

        // Couleurs des confettis
        const colors = [
            '#FFD700', // Gold
            '#FFA500', // Orange
            '#FF6347', // Tomato
            '#4169E1', // Royal Blue
            '#32CD32', // Lime Green
            '#FF1493', // Deep Pink
            '#00CED1', // Dark Turquoise
            '#FF69B4'  // Hot Pink
        ];

        // Créer les confettis
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.createConfetti(colors, duration);
            }, i * 30); // Décalage pour un effet progressif
        }

        // Nettoyer après la durée
        setTimeout(() => {
            if (this.container) {
                this.container.innerHTML = '';
            }
        }, duration + 1000);
    }

    /**
     * Crée un confetti individuel
     */
    createConfetti(colors, duration) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';

        // Position aléatoire en haut de l'écran
        const startX = Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 20;

        // Taille et forme aléatoires
        const size = Math.random() * 10 + 5;
        const isRectangle = Math.random() > 0.5;

        // Couleur aléatoire
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Style du confetti
        confetti.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: -10px;
            width: ${isRectangle ? size : size / 2}px;
            height: ${isRectangle ? size / 2 : size}px;
            background-color: ${color};
            border-radius: ${isRectangle ? '2px' : '50%'};
            animation: confetti-fall ${duration}ms linear forwards;
            transform: rotate(${Math.random() * 360}deg);
            opacity: ${Math.random() * 0.5 + 0.5};
        `;

        // Animation personnalisée pour chaque confetti
        const rotation = Math.random() * 720 - 360;
        confetti.style.setProperty('--end-x', `${endX}%`);
        confetti.style.setProperty('--rotation', `${rotation}deg`);

        this.container.appendChild(confetti);

        // Supprimer le confetti après l'animation
        setTimeout(() => {
            confetti.remove();
        }, duration + 100);
    }

    /**
     * Effet de feu d'artifice au centre
     */
    firework(x = '50%', y = '50%') {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#4169E1', '#32CD32'];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const angle = (i / particleCount) * 360;
            const velocity = Math.random() * 100 + 50;

            particle.style.cssText = `
                position: absolute;
                left: ${x};
                top: ${y};
                width: 8px;
                height: 8px;
                background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
            `;

            document.body.appendChild(particle);

            // Animation manuelle
            const rad = (angle * Math.PI) / 180;
            const vx = Math.cos(rad) * velocity;
            const vy = Math.sin(rad) * velocity;

            let px = 0, py = 0;
            let opacity = 1;
            const gravity = 2;

            const animate = () => {
                px += vx / 20;
                py += vy / 20 + gravity;
                opacity -= 0.02;

                particle.style.transform = `translate(${px}px, ${py}px)`;
                particle.style.opacity = opacity;

                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }

    /**
     * Pluie d'étoiles
     */
    starRain(duration = 2000) {
        const starCount = 20;
        const container = this.container || document.body;

        for (let i = 0; i < starCount; i++) {
            setTimeout(() => {
                const star = document.createElement('div');
                star.innerHTML = '⭐';
                star.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${Math.random() * 20 + 20}px;
                    pointer-events: none;
                    z-index: 10000;
                    animation: confetti-fall ${duration}ms linear forwards;
                `;

                container.appendChild(star);

                setTimeout(() => star.remove(), duration + 100);
            }, i * 100);
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.ConfettiSystem = ConfettiSystem;
}
