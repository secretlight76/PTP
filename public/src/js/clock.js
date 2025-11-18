/**
 * clock.js - Gestion des horloges PTP
 * Définit les classes pour les différents types d'horloges (OC, BC, TC)
 */

/**
 * Génère un identifiant unique de type MAC (Clock Identity IEEE 1588)
 * Format: XX-XX-XX-FF-FE-XX-XX-XX (8 octets)
 */
function generateClockIdentity() {
    const bytes = [];
    for (let i = 0; i < 8; i++) {
        if (i === 3) bytes.push('FF');
        else if (i === 4) bytes.push('FE');
        else bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase());
    }
    return bytes.join('-');
}

/**
 * États possibles d'une horloge PTP
 */
const ClockState = {
    INITIALIZING: 'Initializing',
    DISABLED: 'Disabled',
    MASTER: 'Master',
    SLAVE: 'Slave',
    PASSIVE: 'Passive',
    LISTENING: 'Listening',
    PRE_MASTER: 'Pre-Master',
    UNCALIBRATED: 'Uncalibrated',
    FAULTY: 'Faulty'
};

/**
 * Sources de temps PTP (IEEE 1588-2008 Table 7)
 */
const TimeSource = {
    ATOMIC_CLOCK: 0x10,
    GPS: 0x20,
    TERRESTRIAL_RADIO: 0x30,
    PTP: 0x40,
    NTP: 0x50,
    HAND_SET: 0x60,
    OTHER: 0x90,
    INTERNAL_OSCILLATOR: 0xA0
};

/**
 * Types d'horloges PTP
 */
const ClockType = {
    ORDINARY_CLOCK: 'OC',           // Ordinary Clock
    GRANDMASTER_GPS: 'GM-GPS',      // Grandmaster Clock with GPS
    GRANDMASTER_ATOMIC: 'GM-ATOMIC', // Grandmaster Clock with Atomic source
    BOUNDARY_CLOCK: 'BC',           // Boundary Clock
    TRANSPARENT_CLOCK_P2P: 'TC-P2P', // Transparent Clock Peer-to-Peer
    TRANSPARENT_CLOCK_E2E: 'TC-E2E'  // Transparent Clock End-to-End
};

/**
 * Classe représentant une horloge PTP
 */
class PTPClock {
    constructor(id, type, version = 2) {
        this.id = id;
        this.type = type;
        this.version = version; // 1 pour PTPv1, 2 pour PTPv2
        this.state = ClockState.INITIALIZING;

        // Paramètres réseau
        this.domain = 0; // Domaine PTP (0-127)
        this.dscp = version === 2 ? 46 : 0; // QoS DSCP

        // Intervalles de messages (en log2 secondes)
        this.announceInterval = 1; // 2^1 = 2 secondes
        this.syncInterval = 0; // 2^0 = 1 seconde
        this.delayReqInterval = 0; // 2^0 = 1 seconde
        this.announceReceiptTimeout = 3; // Nombre de périodes manquées avant timeout

        // Génération de l'identifiant unique
        this.clockIdentity = generateClockIdentity();

        // Paramètres BMCA pour PTPv2
        if (version === 2) {
            // Configurer les paramètres selon le type d'horloge
            if (type === ClockType.GRANDMASTER_GPS) {
                this.priority1 = 128;
                this.clockClass = 6; // GPS/Atomic source
                this.clockAccuracy = 0x21; // < 100ns
                this.offsetScaledLogVariance = 5000;
                this.priority2 = 128;
                this.timeSource = TimeSource.GPS;
            } else if (type === ClockType.GRANDMASTER_ATOMIC) {
                this.priority1 = 128;
                this.clockClass = 6; // GPS/Atomic source
                this.clockAccuracy = 0x20; // < 25ns
                this.offsetScaledLogVariance = 3000;
                this.priority2 = 128;
                this.timeSource = TimeSource.ATOMIC_CLOCK;
            } else {
                this.priority1 = 128;
                this.clockClass = 248; // Default: 248 (non-GM)
                this.clockAccuracy = 0xFE; // Unknown
                this.offsetScaledLogVariance = 20000;
                this.priority2 = 128;
                this.timeSource = TimeSource.INTERNAL_OSCILLATOR;
            }
        }
        // Paramètres pour PTPv1
        else {
            this.stratum = 3; // Niveau de qualité (1 = meilleur)
            this.identifier = this.clockIdentity;
            this.precision = -20; // Précision de l'horloge
            this.variance = 5000;
        }

        // Pour les Boundary Clocks
        if (type === ClockType.BOUNDARY_CLOCK) {
            this.ports = []; // Chaque port peut être Master ou Slave
            this.masterPort = null; // Port qui reçoit le temps
            this.slavePorts = []; // Ports qui distribuent le temps
        }

        // Horloge maître de cette horloge (si en mode Slave)
        this.masterClock = null;

        // Statistiques
        this.announcesReceived = [];
        this.syncsSent = 0;
        this.syncsReceived = 0;
    }

    /**
     * Met à jour l'état de l'horloge
     */
    setState(newState) {
        this.state = newState;
    }

    /**
     * Retourne les paramètres BMCA sous forme d'objet
     */
    getBMCAParams() {
        if (this.version === 2) {
            return {
                priority1: this.priority1,
                clockClass: this.clockClass,
                clockAccuracy: this.clockAccuracy,
                offsetScaledLogVariance: this.offsetScaledLogVariance,
                priority2: this.priority2,
                clockIdentity: this.clockIdentity
            };
        } else {
            return {
                stratum: this.stratum,
                identifier: this.identifier,
                precision: this.precision,
                variance: this.variance
            };
        }
    }

    /**
     * Vérifie si cette horloge peut être Grandmaster
     */
    canBeGrandmaster() {
        if (this.version === 2) {
            // Une horloge avec clockClass 255 est "Slave-Only"
            return this.clockClass !== 255;
        } else {
            // En PTPv1, toutes les horloges peuvent être GM sauf si configuré autrement
            return true;
        }
    }

    /**
     * Retourne une représentation textuelle de l'horloge
     */
    toString() {
        if (this.version === 2) {
            return `${this.id} (P1:${this.priority1}, Class:${this.clockClass}, P2:${this.priority2})`;
        } else {
            return `${this.id} (Stratum:${this.stratum})`;
        }
    }

    /**
     * Clone les paramètres de cette horloge (pour comparaison)
     */
    clone() {
        const cloned = new PTPClock(this.id, this.type, this.version);
        Object.assign(cloned, this);
        return cloned;
    }
}

/**
 * Message Announce PTP
 * Utilisé pour l'élection du Grandmaster via BMCA
 */
class AnnounceMessage {
    constructor(clock) {
        this.sourceClock = clock.id;
        this.version = clock.version;
        this.domain = clock.domain;

        if (clock.version === 2) {
            this.priority1 = clock.priority1;
            this.clockClass = clock.clockClass;
            this.clockAccuracy = clock.clockAccuracy;
            this.offsetScaledLogVariance = clock.offsetScaledLogVariance;
            this.priority2 = clock.priority2;
            this.clockIdentity = clock.clockIdentity;
        } else {
            this.stratum = clock.stratum;
            this.identifier = clock.identifier;
            this.precision = clock.precision;
            this.variance = clock.variance;
        }

        this.timestamp = Date.now();
    }
}

/**
 * Message Sync PTP
 * Utilisé pour la synchronisation temporelle
 */
class SyncMessage {
    constructor(masterClock, sequenceId, twoStep = false) {
        this.sourceClock = masterClock.id;
        this.sequenceId = sequenceId;
        this.originTimestamp = twoStep ? 0 : Date.now(); // T1 (0 si two-step)
        this.correctionField = 0; // Utilisé par les TC
        this.twoStep = twoStep;
    }
}

/**
 * Message Follow_Up PTP
 * Utilisé avec two-step clock pour transmettre le timestamp précis
 */
class FollowUpMessage {
    constructor(masterClock, sequenceId, preciseOriginTimestamp) {
        this.sourceClock = masterClock.id;
        this.sequenceId = sequenceId;
        this.preciseOriginTimestamp = preciseOriginTimestamp; // T1 précis
    }
}

/**
 * Message Delay_Req PTP
 * Envoyé par le slave pour mesurer le délai
 */
class DelayReqMessage {
    constructor(slaveClock, sequenceId) {
        this.sourceClock = slaveClock.id;
        this.sequenceId = sequenceId;
        this.originTimestamp = Date.now(); // T3
    }
}

/**
 * Message Delay_Resp PTP
 * Réponse du master avec le timestamp de réception de Delay_Req
 */
class DelayRespMessage {
    constructor(masterClock, sequenceId, receiveTimestamp) {
        this.sourceClock = masterClock.id;
        this.sequenceId = sequenceId;
        this.receiveTimestamp = receiveTimestamp; // T4
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PTPClock,
        ClockState,
        ClockType,
        TimeSource,
        AnnounceMessage,
        SyncMessage,
        FollowUpMessage,
        DelayReqMessage,
        DelayRespMessage,
        generateClockIdentity
    };
}
