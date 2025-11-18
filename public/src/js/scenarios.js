/**
 * scenarios.js - Pre-configured Educational Scenarios
 * Provides ready-to-use PTP network configurations for learning
 */

const PTPScenarios = {
    /**
     * Simple 2-clock synchronization
     */
    simple2Clock: {
        name: "Synchronisation Simple (2 horloges)",
        description: "Un scénario basique avec un GM GPS et une horloge esclave. Idéal pour comprendre les bases.",
        clocks: [
            {
                id: "GM-GPS-1",
                type: ClockType.GRANDMASTER_GPS,
                version: 2,
                priority1: 100,
                clockClass: 6,
                clockAccuracy: 0x21,
                offsetScaledLogVariance: 5000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Horloge-1",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            }
        ]
    },

    /**
     * Industrial network with BC
     */
    industrialNetwork: {
        name: "Réseau Industriel avec BC",
        description: "Un réseau industriel typique avec un GM, un Boundary Clock et plusieurs esclaves.",
        clocks: [
            {
                id: "GM-Atomic",
                type: ClockType.GRANDMASTER_ATOMIC,
                version: 2,
                priority1: 100,
                clockClass: 6,
                clockAccuracy: 0x20,
                offsetScaledLogVariance: 3000,
                priority2: 128,
                domain: 0
            },
            {
                id: "BC-Switch",
                type: ClockType.BOUNDARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0x25,
                offsetScaledLogVariance: 15000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Slave-1",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Slave-2",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            }
        ]
    },

    /**
     * Telecom network with TC
     */
    telecomNetwork: {
        name: "Réseau Télécom avec TC",
        description: "Un réseau télécom utilisant Transparent Clocks pour minimiser le délai.",
        clocks: [
            {
                id: "GM-GPS",
                type: ClockType.GRANDMASTER_GPS,
                version: 2,
                priority1: 100,
                clockClass: 6,
                clockAccuracy: 0x21,
                offsetScaledLogVariance: 5000,
                priority2: 128,
                domain: 0
            },
            {
                id: "TC-P2P-1",
                type: ClockType.TRANSPARENT_CLOCK_P2P,
                version: 2,
                priority1: 255,
                clockClass: 255,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 30000,
                priority2: 255,
                domain: 0
            },
            {
                id: "TC-P2P-2",
                type: ClockType.TRANSPARENT_CLOCK_P2P,
                version: 2,
                priority1: 255,
                clockClass: 255,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 30000,
                priority2: 255,
                domain: 0
            },
            {
                id: "Endpoint-1",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Endpoint-2",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            }
        ]
    },

    /**
     * Redundant GM setup
     */
    redundantGM: {
        name: "Configuration GM Redondante",
        description: "Deux GMs pour la redondance. Le meilleur sera élu automatiquement.",
        clocks: [
            {
                id: "GM-Primary",
                type: ClockType.GRANDMASTER_ATOMIC,
                version: 2,
                priority1: 100,
                clockClass: 6,
                clockAccuracy: 0x20,
                offsetScaledLogVariance: 3000,
                priority2: 128,
                domain: 0
            },
            {
                id: "GM-Backup",
                type: ClockType.GRANDMASTER_GPS,
                version: 2,
                priority1: 110, // Moins prioritaire
                clockClass: 6,
                clockAccuracy: 0x21,
                offsetScaledLogVariance: 5000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Slave-1",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Slave-2",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            }
        ]
    },

    /**
     * PTPv1 legacy network
     */
    ptpv1Legacy: {
        name: "Réseau PTPv1 (Historique)",
        description: "Un réseau utilisant l'ancienne version PTPv1 (IEEE 1588-2002).",
        clocks: [
            {
                id: "Master-v1",
                type: ClockType.GRANDMASTER_GPS,
                version: 1,
                stratum: 1,
                precision: -25,
                variance: 3000,
                domain: 0
            },
            {
                id: "Slave-v1-1",
                type: ClockType.ORDINARY_CLOCK,
                version: 1,
                stratum: 3,
                precision: -20,
                variance: 5000,
                domain: 0
            },
            {
                id: "Slave-v1-2",
                type: ClockType.ORDINARY_CLOCK,
                version: 1,
                stratum: 3,
                precision: -20,
                variance: 5000,
                domain: 0
            }
        ]
    },

    /**
     * Mixed version (demonstrates incompatibility)
     */
    mixedVersion: {
        name: "Versions Mixtes (PTPv1 & v2)",
        description: "Démontre que PTPv1 et PTPv2 ne sont PAS interopérables. Deux élections séparées auront lieu.",
        clocks: [
            {
                id: "GM-v2",
                type: ClockType.GRANDMASTER_GPS,
                version: 2,
                priority1: 100,
                clockClass: 6,
                clockAccuracy: 0x21,
                offsetScaledLogVariance: 5000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Slave-v2",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            },
            {
                id: "GM-v1",
                type: ClockType.GRANDMASTER_GPS,
                version: 1,
                stratum: 1,
                precision: -25,
                variance: 3000,
                domain: 0
            },
            {
                id: "Slave-v1",
                type: ClockType.ORDINARY_CLOCK,
                version: 1,
                stratum: 3,
                precision: -20,
                variance: 5000,
                domain: 0
            }
        ]
    },

    /**
     * BMCA comparison scenario
     */
    bmcaComparison: {
        name: "Comparaison BMCA Détaillée",
        description: "Plusieurs horloges avec des paramètres variés pour comprendre chaque critère BMCA.",
        clocks: [
            {
                id: "Clock-A",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 6,
                clockAccuracy: 0x21,
                offsetScaledLogVariance: 5000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Clock-B",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 7,
                clockAccuracy: 0x20,
                offsetScaledLogVariance: 3000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Clock-C",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 100,
                clockClass: 248,
                clockAccuracy: 0xFE,
                offsetScaledLogVariance: 20000,
                priority2: 128,
                domain: 0
            },
            {
                id: "Clock-D",
                type: ClockType.ORDINARY_CLOCK,
                version: 2,
                priority1: 128,
                clockClass: 6,
                clockAccuracy: 0x22,
                offsetScaledLogVariance: 7000,
                priority2: 100,
                domain: 0
            }
        ]
    }
};

// Export for browser use
if (typeof window !== 'undefined') {
    window.PTPScenarios = PTPScenarios;
}
