/**
 * simulation.js - Logique de simulation PTP
 * Gère l'exécution de la simulation BMCA et des échanges de messages
 */

/**
 * Classe principale de simulation PTP
 */
class PTPSimulation {
    constructor() {
        this.clocks = [];
        this.grandmaster = null;
        this.logs = [];
        this.bmca = null;
        this.isRunning = false;
        this.messageSequence = 0;
    }

    /**
     * Ajoute une horloge à la simulation
     */
    addClock(clock) {
        this.clocks.push(clock);
        this.log(`[SYSTÈME] Horloge "${clock.id}" ajoutée (Type: ${clock.type}, Version: PTPv${clock.version})`);
    }

    /**
     * Supprime une horloge de la simulation
     */
    removeClock(clockId) {
        const index = this.clocks.findIndex(c => c.id === clockId);
        if (index !== -1) {
            const removed = this.clocks.splice(index, 1)[0];
            this.log(`[SYSTÈME] Horloge "${removed.id}" supprimée`);
            return true;
        }
        return false;
    }

    /**
     * Récupère une horloge par son ID
     */
    getClock(clockId) {
        return this.clocks.find(c => c.id === clockId);
    }

    /**
     * Réinitialise la simulation
     */
    reset() {
        this.clocks = [];
        this.grandmaster = null;
        this.logs = [];
        this.isRunning = false;
        this.messageSequence = 0;
        this.log('[SYSTÈME] Simulation réinitialisée');
    }

    /**
     * Ajoute un message au log
     */
    log(message) {
        const timestamp = new Date().toLocaleTimeString('fr-FR');
        this.logs.push(`[${timestamp}] ${message}`);
    }

    /**
     * Récupère tous les logs
     */
    getLogs() {
        return this.logs;
    }

    /**
     * Efface les logs
     */
    clearLogs() {
        this.logs = [];
    }

    /**
     * Lance la simulation BMCA
     * Retourne le Grandmaster élu (ou un objet avec v1GM et v2GM si les deux versions existent)
     */
    async runBMCAElection() {
        if (this.clocks.length === 0) {
            this.log('[ERREUR] Aucune horloge dans la topologie !');
            return null;
        }

        this.isRunning = true;
        this.clearLogs();

        this.log('═══════════════════════════════════════════════════');
        this.log('DÉBUT DE L\'ÉLECTION DU GRANDMASTER (BMCA)');
        this.log('═══════════════════════════════════════════════════');
        this.log('');

        // Séparer les horloges par version PTP
        const v1Clocks = this.clocks.filter(c => c.version === 1);
        const v2Clocks = this.clocks.filter(c => c.version === 2);

        this.log(`[INFO] Nombre d'horloges participantes: ${this.clocks.length}`);
        this.log(`   • PTPv1: ${v1Clocks.length}`);
        this.log(`   • PTPv2: ${v2Clocks.length}`);
        this.log('');

        // IMPORTANT: PTPv1 et PTPv2 ne peuvent pas interopérer
        // Ils doivent avoir des élections séparées
        if (v1Clocks.length > 0 && v2Clocks.length > 0) {
            this.log('[AVERTISSEMENT] Mélange de PTPv1 et PTPv2 détecté !');
            this.log('[INFO] PTPv1 et PTPv2 ne sont PAS interopérables.');
            this.log('[INFO] Deux élections séparées seront effectuées.');
            this.log('');
        }

        let v1GM = null;
        let v2GM = null;

        // Élection PTPv1 si nécessaire
        if (v1Clocks.length > 0) {
            v1GM = await this.runBMCAForVersion(v1Clocks, 1);
        }

        // Élection PTPv2 si nécessaire
        if (v2Clocks.length > 0) {
            v2GM = await this.runBMCAForVersion(v2Clocks, 2);
        }

        // Déterminer le GM principal (priorité à v2 s'il existe)
        this.grandmaster = v2GM || v1GM;

        this.log('═══════════════════════════════════════════════════');
        this.log('ÉLECTION TERMINÉE');
        this.log('═══════════════════════════════════════════════════');

        this.isRunning = false;
        return this.grandmaster;
    }

    /**
     * Effectue l'élection BMCA pour une version PTP spécifique
     */
    async runBMCAForVersion(clocks, version) {
        this.log(`╔═══════════════════════════════════════════════════╗`);
        this.log(`║  ÉLECTION BMCA POUR PTPv${version}                           ║`);
        this.log(`╚═══════════════════════════════════════════════════╝`);
        this.log('');

        this.bmca = new BMCA(version);

        this.log(`[INFO] Nombre d'horloges PTPv${version}: ${clocks.length}`);
        this.log('');

        // Afficher toutes les horloges participantes
        this.log('HORLOGES PARTICIPANTES (PTPv' + version + '):');
        clocks.forEach(clock => {
            if (version === 2) {
                this.log(`   • ${clock.id}: P1=${clock.priority1}, Class=${clock.clockClass}, Acc=0x${clock.clockAccuracy.toString(16).toUpperCase()}, Var=${clock.offsetScaledLogVariance}, P2=${clock.priority2}`);
            } else {
                this.log(`   • ${clock.id}: Stratum=${clock.stratum}, Precision=${clock.precision}, Variance=${clock.variance}`);
            }
        });
        this.log('');

        // Simuler l'envoi de messages Announce
        this.log('PHASE 1: ENVOI DES MESSAGES ANNOUNCE');
        this.log('─────────────────────────────────────────────────');
        await this.sleep(500);

        for (const clock of clocks) {
            const announce = new AnnounceMessage(clock);
            this.log(`[${clock.id}] ➤ Envoie Announce (Domain: ${clock.domain})`);
            await this.sleep(200);
        }
        this.log('');

        // Simuler la réception et la comparaison
        this.log('PHASE 2: RÉCEPTION ET ANALYSE DES ANNOUNCE');
        this.log('─────────────────────────────────────────────────');
        await this.sleep(500);

        // Chaque horloge compare les Announce reçus
        for (const clock of clocks) {
            const otherClocks = clocks.filter(c => c.id !== clock.id);

            if (otherClocks.length === 0) continue;

            this.log(`[${clock.id}] Reçoit ${otherClocks.length} message(s) Announce`);

            // Compare avec chaque autre horloge
            for (const other of otherClocks) {
                const result = this.bmca.compare(other, clock);

                if (result === ComparisonResult.A_BETTER) {
                    this.log(`[${clock.id}] ✓ Announce de "${other.id}" est MEILLEUR`);
                } else if (result === ComparisonResult.B_BETTER) {
                    this.log(`[${clock.id}] ✗ Mon Announce est meilleur que "${other.id}"`);
                } else {
                    this.log(`[${clock.id}] = Announce de "${other.id}" est ÉGAL`);
                }

                await this.sleep(100);
            }
            this.log('');
        }

        // Élection du Grandmaster
        this.log('PHASE 3: ÉLECTION DU GRANDMASTER');
        this.log('─────────────────────────────────────────────────');
        await this.sleep(500);

        const grandmaster = this.bmca.electGrandmaster(clocks);

        if (!grandmaster) {
            this.log('[ERREUR] Impossible d\'élire un Grandmaster !');
            return null;
        }

        this.log(`[RÉSULTAT] Le Grandmaster PTPv${version} élu est: ${grandmaster.id}`);
        this.log('');

        // Mise à jour des états des horloges de cette version
        this.log('PHASE 4: MISE À JOUR DES ÉTATS');
        this.log('─────────────────────────────────────────────────');
        await this.sleep(500);

        for (const clock of clocks) {
            if (clock.id === grandmaster.id) {
                clock.setState(ClockState.MASTER);
                this.log(`[${clock.id}] → État: MASTER`);
            } else {
                // Ne devenir slave que si même version que le GM
                if (clock.version === grandmaster.version) {
                    clock.setState(ClockState.SLAVE);
                    clock.masterClock = grandmaster;
                    this.log(`[${clock.id}] → État: SLAVE (Maître: ${grandmaster.id})`);
                }
            }
            await this.sleep(150);
        }
        this.log('');

        return grandmaster;
    }

    /**
     * Génère l'explication détaillée de l'élection
     */
    generateElectionExplanation() {
        if (!this.grandmaster || !this.bmca) {
            return null;
        }

        const explanation = {
            winner: this.grandmaster,
            steps: [],
            summary: ''
        };

        // Pour chaque horloge, comparer avec le GM
        const losers = this.clocks.filter(c => c.id !== this.grandmaster.id);

        losers.forEach(loser => {
            const comparisonSteps = [];
            this.bmca.compare(this.grandmaster, loser);
            const steps = this.bmca.getComparisonSteps();

            explanation.steps.push({
                loser: loser,
                comparisonSteps: steps
            });
        });

        // Générer un résumé
        if (this.grandmaster.version === 2) {
            explanation.summary = `Le Grandmaster ${this.grandmaster.id} a été élu grâce à ses paramètres BMCA supérieurs. `;
            explanation.summary += `Il possède une combinaison optimale de priority1 (${this.grandmaster.priority1}), `;
            explanation.summary += `clockClass (${this.grandmaster.clockClass}), et autres paramètres qui le rendent `;
            explanation.summary += `plus fiable que les autres horloges du réseau.`;
        } else {
            explanation.summary = `Le Grandmaster ${this.grandmaster.id} a été élu car il possède le Stratum le plus bas `;
            explanation.summary += `(${this.grandmaster.stratum}), indiquant sa proximité à une source de temps de référence.`;
        }

        return explanation;
    }

    /**
     * Simule les échanges de messages Sync après l'élection
     */
    async runSynchronization(cycles = 3) {
        if (!this.grandmaster) {
            this.log('[ERREUR] Aucun Grandmaster élu ! Lancez d\'abord l\'élection BMCA.');
            return;
        }

        this.log('');
        this.log('═══════════════════════════════════════════════════');
        this.log('DÉBUT DE LA SYNCHRONISATION TEMPORELLE');
        this.log('═══════════════════════════════════════════════════');
        this.log('');

        const slaves = this.clocks.filter(c => c.state === ClockState.SLAVE);

        for (let cycle = 1; cycle <= cycles; cycle++) {
            this.log(`CYCLE DE SYNCHRONISATION #${cycle}`);
            this.log('─────────────────────────────────────────────────');
            await this.sleep(500);

            // 1. Master envoie Sync
            this.messageSequence++;
            const syncMsg = new SyncMessage(this.grandmaster, this.messageSequence);
            this.log(`[${this.grandmaster.id}] TX Envoie SYNC (Seq: ${syncMsg.sequenceId}, T1: ${syncMsg.originTimestamp})`);
            this.grandmaster.syncsSent++;
            await this.sleep(300);

            // 2. Slaves reçoivent Sync
            for (const slave of slaves) {
                const t2 = Date.now(); // Timestamp de réception
                this.log(`[${slave.id}] RX Reçoit SYNC (T2: ${t2})`);
                slave.syncsReceived++;
                await this.sleep(200);

                // 3. Slave envoie Delay_Req
                this.messageSequence++;
                const delayReq = new DelayReqMessage(slave, this.messageSequence);
                this.log(`[${slave.id}] TX Envoie DELAY_REQ (Seq: ${delayReq.sequenceId}, T3: ${delayReq.originTimestamp})`);
                await this.sleep(200);

                // 4. Master reçoit Delay_Req et envoie Delay_Resp
                const t4 = Date.now(); // Timestamp de réception par le master
                const delayResp = new DelayRespMessage(this.grandmaster, delayReq.sequenceId, t4);
                this.log(`[${this.grandmaster.id}] RX Reçoit DELAY_REQ de ${slave.id} (T4: ${t4})`);
                this.log(`[${this.grandmaster.id}] TX Envoie DELAY_RESP à ${slave.id} (T4: ${delayResp.receiveTimestamp})`);
                await this.sleep(200);

                // 5. Slave calcule le délai (simplifié)
                this.log(`[${slave.id}] Calcule l'offset et le délai de propagation`);
                this.log(`[${slave.id}] Synchronisé avec ${this.grandmaster.id}`);
                await this.sleep(200);
            }

            this.log('');
            await this.sleep(500);
        }

        this.log('═══════════════════════════════════════════════════');
        this.log('SYNCHRONISATION TERMINÉE');
        this.log('═══════════════════════════════════════════════════');
    }

    /**
     * Fonction utilitaire pour simuler un délai
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retourne les statistiques de la simulation
     */
    getStatistics() {
        return {
            totalClocks: this.clocks.length,
            grandmaster: this.grandmaster ? this.grandmaster.id : 'Aucun',
            slaves: this.clocks.filter(c => c.state === ClockState.SLAVE).length,
            totalLogs: this.logs.length
        };
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PTPSimulation
    };
}
