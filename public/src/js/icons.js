/**
 * icons.js - Icônes SVG animées pour les horloges PTP
 * Remplace les icônes textuelles par des SVG modernes et animés
 */

class PTPIcons {
    /**
     * Icône pour Ordinary Clock (OC)
     */
    static ordinaryClock(animated = true) {
        const animation = animated ? `
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="8s"
                repeatCount="indefinite"/>
        ` : '';

        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="12" y1="12" x2="12" y2="7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <line x1="12" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                ${animation}
            </svg>
        `;
    }

    /**
     * Icône pour Grandmaster (GM) - Couronne
     */
    static grandmaster(animated = true) {
        const sparkle = animated ? `
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite"/>
        ` : '';

        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <path d="M3 20h18v-2H3v2zm0-4h18v-2H3v2zM12 2l-2 6h4l-2-6zM6 8L4 14h4L6 8zm12 0l-2 6h4l-2-6z" fill="currentColor">
                    ${sparkle}
                </path>
            </svg>
        `;
    }

    /**
     * Icône pour GPS - Satellite
     */
    static gps(animated = true) {
        const pulse = animated ? `
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
        ` : '';

        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="currentColor">
                    ${pulse}
                </circle>
                <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2"/>
                <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="2"/>
                <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }

    /**
     * Icône pour Atomic Clock - Atome
     */
    static atomic(animated = true) {
        const rotate = animated ? `
            <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="4s"
                repeatCount="indefinite"/>
        ` : '';

        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <g>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="2" fill="none"/>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(60 12 12)"/>
                    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="2" fill="none" transform="rotate(120 12 12)"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                    ${rotate}
                </g>
            </svg>
        `;
    }

    /**
     * Icône pour Boundary Clock (BC) - Switch avec ports
     */
    static boundaryClock(animated = false) {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
    }

    /**
     * Icône pour Transparent Clock (TC) - Switch transparent
     */
    static transparentClock(animated = false) {
        return `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none" opacity="0.5"/>
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-dasharray="2,2"/>
                <circle cx="8" cy="12" r="1" fill="currentColor" opacity="0.7"/>
                <circle cx="16" cy="12" r="1" fill="currentColor" opacity="0.7"/>
            </svg>
        `;
    }

    /**
     * Icône VS pour les comparaisons
     */
    static versus() {
        return `
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="20" cy="20" r="18" fill="var(--color-warning)" opacity="0.2"/>
                <text x="20" y="27" font-size="20" font-weight="bold" text-anchor="middle" fill="var(--color-warning)">VS</text>
                <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
            </svg>
        `;
    }

    /**
     * Icône de check (succès)
     */
    static check() {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="12" cy="12" r="10" fill="var(--color-success)" opacity="0.2"/>
                <path d="M7 12l3 3 7-7" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }

    /**
     * Icône de croix (échec)
     */
    static cross() {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="12" cy="12" r="10" fill="var(--color-error)" opacity="0.2"/>
                <path d="M8 8l8 8M16 8l-8 8" stroke="var(--color-error)" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    }

    /**
     * Icône de point d'interrogation (pourquoi?)
     */
    static questionMark() {
        return `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="inline-block">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M12 17v-1M12 14c0-1.5 2-2 2-3.5 0-1.5-1-2.5-2-2.5s-2 1-2 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
    }

    /**
     * Obtient l'icône appropriée selon le type d'horloge
     */
    static getClockIcon(clock, animated = true) {
        // Si c'est un GM (état MASTER), toujours afficher la couronne
        if (clock.state === ClockState.MASTER) {
            return this.grandmaster(animated);
        }

        // Sinon, selon le type
        switch (clock.type) {
            case ClockType.ORDINARY_CLOCK:
                return this.ordinaryClock(animated);
            case ClockType.GRANDMASTER_GPS:
                return this.gps(animated);
            case ClockType.GRANDMASTER_ATOMIC:
                return this.atomic(animated);
            case ClockType.BOUNDARY_CLOCK:
                return this.boundaryClock(animated);
            case ClockType.TRANSPARENT_CLOCK_P2P:
            case ClockType.TRANSPARENT_CLOCK_E2E:
                return this.transparentClock(animated);
            default:
                return this.ordinaryClock(animated);
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.PTPIcons = PTPIcons;
}
