/**
 * bmca.js - Best Master Clock Algorithm (BMCA)
 * Implémente l'algorithme d'élection du Grandmaster selon IEEE 1588
 */

/**
 * Résultat de la comparaison BMCA
 */
const ComparisonResult = {
    A_BETTER: 'A_BETTER',     // A est meilleur que B
    B_BETTER: 'B_BETTER',     // B est meilleur que A
    EQUAL: 'EQUAL',           // A et B sont équivalents
    ERROR: 'ERROR'            // Erreur de comparaison
};

/**
 * Classe pour gérer le BMCA et fournir des explications pédagogiques
 */
class BMCA {
    constructor(version = 2) {
        this.version = version;
        this.comparisonSteps = []; // Stocke les étapes de comparaison pour l'UI
    }

    /**
     * Compare deux horloges selon l'algorithme BMCA
     * Retourne A_BETTER si clockA est meilleur, B_BETTER si clockB est meilleur
     */
    compare(clockA, clockB) {
        this.comparisonSteps = []; // Reset des étapes

        if (this.version === 2) {
            return this.compareV2(clockA, clockB);
        } else {
            return this.compareV1(clockA, clockB);
        }
    }

    /**
     * Comparaison BMCA pour PTPv2 (IEEE 1588-2008)
     * Ordre de comparaison :
     * 1. priority1 (plus petit = meilleur)
     * 2. clockClass (plus petit = meilleur)
     * 3. clockAccuracy (plus petit = meilleur)
     * 4. offsetScaledLogVariance (plus petit = meilleur)
     * 5. priority2 (plus petit = meilleur)
     * 6. clockIdentity (plus petit = meilleur)
     */
    compareV2(clockA, clockB) {
        // Étape 1 : Comparaison de priority1
        if (clockA.priority1 !== clockB.priority1) {
            const result = clockA.priority1 < clockB.priority1 ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'priority1',
                valueA: clockA.priority1,
                valueB: clockB.priority1,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (${clockA.priority1} < ${clockB.priority1})`
                    : `${clockB.id} gagne (${clockB.priority1} < ${clockA.priority1})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'priority1',
            valueA: clockA.priority1,
            valueB: clockB.priority1,
            result: ComparisonResult.EQUAL,
            explanation: `Égalité (${clockA.priority1} == ${clockB.priority1}), comparaison suivante...`
        });

        // Étape 2 : Comparaison de clockClass
        if (clockA.clockClass !== clockB.clockClass) {
            const result = clockA.clockClass < clockB.clockClass ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'clockClass',
                valueA: clockA.clockClass,
                valueB: clockB.clockClass,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (${clockA.clockClass} < ${clockB.clockClass})`
                    : `${clockB.id} gagne (${clockB.clockClass} < ${clockA.clockClass})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'clockClass',
            valueA: clockA.clockClass,
            valueB: clockB.clockClass,
            result: ComparisonResult.EQUAL,
            explanation: `Égalité (${clockA.clockClass} == ${clockB.clockClass}), comparaison suivante...`
        });

        // Étape 3 : Comparaison de clockAccuracy
        if (clockA.clockAccuracy !== clockB.clockAccuracy) {
            const result = clockA.clockAccuracy < clockB.clockAccuracy ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'clockAccuracy',
                valueA: this.formatClockAccuracy(clockA.clockAccuracy),
                valueB: this.formatClockAccuracy(clockB.clockAccuracy),
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (0x${clockA.clockAccuracy.toString(16)} < 0x${clockB.clockAccuracy.toString(16)})`
                    : `${clockB.id} gagne (0x${clockB.clockAccuracy.toString(16)} < 0x${clockA.clockAccuracy.toString(16)})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'clockAccuracy',
            valueA: this.formatClockAccuracy(clockA.clockAccuracy),
            valueB: this.formatClockAccuracy(clockB.clockAccuracy),
            result: ComparisonResult.EQUAL,
            explanation: `Égalité, comparaison suivante...`
        });

        // Étape 4 : Comparaison de offsetScaledLogVariance
        if (clockA.offsetScaledLogVariance !== clockB.offsetScaledLogVariance) {
            const result = clockA.offsetScaledLogVariance < clockB.offsetScaledLogVariance ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'offsetScaledLogVariance',
                valueA: clockA.offsetScaledLogVariance,
                valueB: clockB.offsetScaledLogVariance,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (${clockA.offsetScaledLogVariance} < ${clockB.offsetScaledLogVariance})`
                    : `${clockB.id} gagne (${clockB.offsetScaledLogVariance} < ${clockA.offsetScaledLogVariance})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'offsetScaledLogVariance',
            valueA: clockA.offsetScaledLogVariance,
            valueB: clockB.offsetScaledLogVariance,
            result: ComparisonResult.EQUAL,
            explanation: `Égalité (${clockA.offsetScaledLogVariance} == ${clockB.offsetScaledLogVariance}), comparaison suivante...`
        });

        // Étape 5 : Comparaison de priority2
        if (clockA.priority2 !== clockB.priority2) {
            const result = clockA.priority2 < clockB.priority2 ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'priority2',
                valueA: clockA.priority2,
                valueB: clockB.priority2,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (${clockA.priority2} < ${clockB.priority2})`
                    : `${clockB.id} gagne (${clockB.priority2} < ${clockA.priority2})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'priority2',
            valueA: clockA.priority2,
            valueB: clockB.priority2,
            result: ComparisonResult.EQUAL,
            explanation: `Égalité (${clockA.priority2} == ${clockB.priority2}), comparaison suivante...`
        });

        // Étape 6 : Comparaison de clockIdentity (tie-breaker final)
        const result = clockA.clockIdentity < clockB.clockIdentity ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
        this.comparisonSteps.push({
            parameter: 'clockIdentity',
            valueA: clockA.clockIdentity,
            valueB: clockB.clockIdentity,
            result: result,
            explanation: result === ComparisonResult.A_BETTER
                ? `${clockA.id} gagne (${clockA.clockIdentity} < ${clockB.clockIdentity})`
                : `${clockB.id} gagne (${clockB.clockIdentity} < ${clockA.clockIdentity})`
        });

        return result;
    }

    /**
     * Comparaison BMCA pour PTPv1 (IEEE 1588-2002)
     * Ordre de comparaison :
     * 1. Stratum (plus petit = meilleur)
     * 2. Identifier (plus petit = meilleur)
     * 3. Variance (plus petit = meilleur)
     * 4. Precision (plus petit = meilleur, valeurs négatives)
     */
    compareV1(clockA, clockB) {
        // Étape 1 : Comparaison de Stratum
        if (clockA.stratum !== clockB.stratum) {
            const result = clockA.stratum < clockB.stratum ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'stratum',
                valueA: clockA.stratum,
                valueB: clockB.stratum,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (Stratum ${clockA.stratum} < ${clockB.stratum})`
                    : `${clockB.id} gagne (Stratum ${clockB.stratum} < ${clockA.stratum})`
            });
            return result;
        }
        this.comparisonSteps.push({
            parameter: 'stratum',
            valueA: clockA.stratum,
            valueB: clockB.stratum,
            result: ComparisonResult.EQUAL,
            explanation: `Égalité (Stratum ${clockA.stratum} == ${clockB.stratum}), comparaison suivante...`
        });

        // Étape 2 : Comparaison de Identifier
        if (clockA.identifier !== clockB.identifier) {
            const result = clockA.identifier < clockB.identifier ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'identifier',
                valueA: clockA.identifier,
                valueB: clockB.identifier,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (ID ${clockA.identifier} < ${clockB.identifier})`
                    : `${clockB.id} gagne (ID ${clockB.identifier} < ${clockA.identifier})`
            });
            return result;
        }

        // Étape 3 : Comparaison de Variance
        if (clockA.variance !== clockB.variance) {
            const result = clockA.variance < clockB.variance ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
            this.comparisonSteps.push({
                parameter: 'variance',
                valueA: clockA.variance,
                valueB: clockB.variance,
                result: result,
                explanation: result === ComparisonResult.A_BETTER
                    ? `${clockA.id} gagne (Variance ${clockA.variance} < ${clockB.variance})`
                    : `${clockB.id} gagne (Variance ${clockB.variance} < ${clockA.variance})`
            });
            return result;
        }

        // Tie-breaker par precision
        const result = clockA.precision < clockB.precision ? ComparisonResult.A_BETTER : ComparisonResult.B_BETTER;
        this.comparisonSteps.push({
            parameter: 'precision',
            valueA: clockA.precision,
            valueB: clockB.precision,
            result: result,
            explanation: result === ComparisonResult.A_BETTER
                ? `${clockA.id} gagne (Precision ${clockA.precision})`
                : `${clockB.id} gagne (Precision ${clockB.precision})`
        });

        return result;
    }

    /**
     * Trouve le Grandmaster parmi une liste d'horloges
     */
    electGrandmaster(clocks) {
        if (!clocks || clocks.length === 0) {
            return null;
        }

        // Filtre les horloges qui ne peuvent pas être GM
        const candidates = clocks.filter(clock => clock.canBeGrandmaster());

        if (candidates.length === 0) {
            return null;
        }

        // Commence avec la première horloge comme meilleur candidat
        let bestClock = candidates[0];

        // Compare avec toutes les autres horloges
        for (let i = 1; i < candidates.length; i++) {
            const result = this.compare(candidates[i], bestClock);
            if (result === ComparisonResult.A_BETTER) {
                bestClock = candidates[i];
            }
        }

        return bestClock;
    }

    /**
     * Obtient les étapes de comparaison pour affichage pédagogique
     */
    getComparisonSteps() {
        return this.comparisonSteps;
    }

    /**
     * Formate la valeur de clockAccuracy pour affichage
     */
    formatClockAccuracy(value) {
        const accuracyMap = {
            0x20: '< 25ns',
            0x21: '< 100ns',
            0x22: '< 250ns',
            0x23: '< 1μs',
            0x24: '< 2.5μs',
            0x25: '< 10μs',
            0x26: '< 25μs',
            0x27: '< 100μs',
            0x28: '< 250μs',
            0x29: '< 1ms',
            0x2A: '< 2.5ms',
            0x2B: '< 10ms',
            0x2C: '< 25ms',
            0x2D: '< 100ms',
            0x2E: '< 250ms',
            0x2F: '< 1s',
            0x30: '< 10s',
            0x31: '> 10s',
            0xFE: 'Inconnue'
        };
        return accuracyMap[value] || `0x${value.toString(16)}`;
    }

    /**
     * Formate la valeur de clockClass pour affichage
     */
    formatClockClass(value) {
        const classMap = {
            6: 'GM primaire (GPS/Atomique)',
            7: 'GM primaire (Holdover)',
            13: 'GM ARB (Application)',
            14: 'GM ARB (Holdover)',
            52: 'GM dégradé A',
            58: 'GM dégradé B',
            187: 'Horloge externe',
            193: 'Horloge secondaire',
            248: 'Horloge par défaut',
            255: 'Slave-only'
        };
        return classMap[value] || `Class ${value}`;
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BMCA,
        ComparisonResult
    };
}
