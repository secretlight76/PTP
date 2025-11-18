/**
 * math-formulas.js - Module d'affichage des formules mathématiques PTP
 * Affiche les calculs de synchronisation avec des formules LaTeX-like
 */

class MathFormulas {
    /**
     * Affiche les formules de synchronisation PTP
     * @param {number} t1 - Timestamp de l'envoi du Sync (Master)
     * @param {number} t2 - Timestamp de la réception du Sync (Slave)
     * @param {number} t3 - Timestamp de l'envoi du Delay_Req (Slave)
     * @param {number} t4 - Timestamp de la réception du Delay_Req (Master)
     * @returns {string} HTML des formules
     */
    static displaySyncFormulas(t1, t2, t3, t4) {
        const offset = ((t2 - t1) - (t4 - t3)) / 2;
        const delay = ((t2 - t1) + (t4 - t3)) / 2;

        return `
            <div class="space-y-4 text-sm" style="color: var(--text-primary);">
                <!-- Titre -->
                <div class="p-3 rounded-lg" style="background: var(--bg-tertiary);">
                    <h3 class="font-bold text-base mb-2" style="color: var(--color-primary);">
                        📐 Calcul de Synchronisation PTP
                    </h3>
                    <p class="text-xs" style="color: var(--text-secondary);">
                        Basé sur l'échange de 4 timestamps entre Master et Slave
                    </p>
                </div>

                <!-- Timestamps -->
                <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 rounded" style="background: var(--bg-secondary); border-left: 3px solid var(--color-success);">
                        <div class="text-xs font-semibold" style="color: var(--text-tertiary);">t₁ (Master Send)</div>
                        <div class="font-mono font-bold">${t1.toFixed(3)} ms</div>
                    </div>
                    <div class="p-2 rounded" style="background: var(--bg-secondary); border-left: 3px solid var(--color-info);">
                        <div class="text-xs font-semibold" style="color: var(--text-tertiary);">t₂ (Slave Receive)</div>
                        <div class="font-mono font-bold">${t2.toFixed(3)} ms</div>
                    </div>
                    <div class="p-2 rounded" style="background: var(--bg-secondary); border-left: 3px solid var(--color-warning);">
                        <div class="text-xs font-semibold" style="color: var(--text-tertiary);">t₃ (Slave Send)</div>
                        <div class="font-mono font-bold">${t3.toFixed(3)} ms</div>
                    </div>
                    <div class="p-2 rounded" style="background: var(--bg-secondary); border-left: 3px solid var(--color-passive);">
                        <div class="text-xs font-semibold" style="color: var(--text-tertiary);">t₄ (Master Receive)</div>
                        <div class="font-mono font-bold">${t4.toFixed(3)} ms</div>
                    </div>
                </div>

                <!-- Formule Offset -->
                <div class="p-3 rounded-lg" style="background: var(--bg-secondary); border: 2px solid var(--color-info);">
                    <div class="font-bold mb-2" style="color: var(--color-info);">🎯 Offset Temporel</div>
                    <div class="font-mono text-xs mb-2 p-2 rounded" style="background: var(--bg-primary);">
                        offset = [(t₂ - t₁) - (t₄ - t₃)] / 2
                    </div>
                    <div class="text-xs space-y-1" style="color: var(--text-secondary);">
                        <div>= [(${t2.toFixed(3)} - ${t1.toFixed(3)}) - (${t4.toFixed(3)} - ${t3.toFixed(3)})] / 2</div>
                        <div>= [${(t2 - t1).toFixed(3)} - ${(t4 - t3).toFixed(3)}] / 2</div>
                        <div>= ${((t2 - t1) - (t4 - t3)).toFixed(3)} / 2</div>
                        <div class="font-bold text-base mt-2" style="color: var(--color-info);">
                            = ${offset.toFixed(3)} ms
                        </div>
                    </div>
                    <div class="mt-2 text-xs p-2 rounded" style="background: var(--bg-tertiary); color: var(--text-tertiary);">
                        <strong>Interprétation:</strong> ${Math.abs(offset) < 0.1 ?
                            '✅ Excellent! Synchronisation très précise.' :
                            Math.abs(offset) < 1 ?
                            '✓ Bon. Synchronisation acceptable.' :
                            '⚠️ Attention. Offset élevé, vérifier le réseau.'}
                    </div>
                </div>

                <!-- Formule Delay -->
                <div class="p-3 rounded-lg" style="background: var(--bg-secondary); border: 2px solid var(--color-success);">
                    <div class="font-bold mb-2" style="color: var(--color-success);">⏱️ Délai de Propagation</div>
                    <div class="font-mono text-xs mb-2 p-2 rounded" style="background: var(--bg-primary);">
                        delay = [(t₂ - t₁) + (t₄ - t₃)] / 2
                    </div>
                    <div class="text-xs space-y-1" style="color: var(--text-secondary);">
                        <div>= [(${t2.toFixed(3)} - ${t1.toFixed(3)}) + (${t4.toFixed(3)} - ${t3.toFixed(3)})] / 2</div>
                        <div>= [${(t2 - t1).toFixed(3)} + ${(t4 - t3).toFixed(3)}] / 2</div>
                        <div>= ${((t2 - t1) + (t4 - t3)).toFixed(3)} / 2</div>
                        <div class="font-bold text-base mt-2" style="color: var(--color-success);">
                            = ${delay.toFixed(3)} ms
                        </div>
                    </div>
                    <div class="mt-2 text-xs p-2 rounded" style="background: var(--bg-tertiary); color: var(--text-tertiary);">
                        <strong>Interprétation:</strong> ${delay < 0.5 ?
                            '✅ Excellent! Réseau très rapide.' :
                            delay < 2 ?
                            '✓ Bon. Délai réseau normal.' :
                            '⚠️ Attention. Délai élevé, congestion possible.'}
                    </div>
                </div>

                <!-- Explication -->
                <div class="p-3 rounded" style="background: var(--bg-tertiary);">
                    <div class="text-xs space-y-2" style="color: var(--text-secondary);">
                        <p><strong>💡 Principe:</strong> Le Slave ajuste son horloge en ajoutant l'offset calculé.</p>
                        <p><strong>🔍 Hypothèse:</strong> Les délais de propagation sont symétriques (Master→Slave = Slave→Master).</p>
                        <p><strong>🎓 Note:</strong> Dans un réseau réel, l'asymétrie des délais peut introduire des erreurs.</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Affiche un diagramme de séquence temporelle
     * @param {number} t1 - Timestamp t1
     * @param {number} t2 - Timestamp t2
     * @param {number} t3 - Timestamp t3
     * @param {number} t4 - Timestamp t4
     * @returns {string} HTML du diagramme
     */
    static displayTimingDiagram(t1, t2, t3, t4) {
        const totalTime = Math.max(t4 - t1, 1000);
        const scale = 100 / totalTime; // Pourcentage

        const t1Pos = 0;
        const t2Pos = ((t2 - t1) / totalTime) * 100;
        const t3Pos = ((t3 - t1) / totalTime) * 100;
        const t4Pos = ((t4 - t1) / totalTime) * 100;

        return `
            <div class="mt-6 p-4 rounded-lg" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
                <h3 class="font-bold mb-4 text-sm" style="color: var(--text-primary);">
                    📊 Diagramme de Séquence Temporelle
                </h3>

                <!-- Timeline -->
                <div class="relative" style="height: 200px;">
                    <!-- Master timeline -->
                    <div class="absolute" style="top: 20px; left: 0; right: 0; height: 60px;">
                        <div class="text-xs font-bold mb-2" style="color: var(--color-master);">MASTER</div>
                        <div class="relative" style="height: 2px; background: var(--color-master);">
                            <!-- t1 marker -->
                            <div class="absolute" style="left: ${t1Pos}%; top: -6px;">
                                <div class="w-3 h-3 rounded-full" style="background: var(--color-success);"></div>
                                <div class="text-xs mt-1 font-mono" style="color: var(--text-primary);">t₁</div>
                            </div>
                            <!-- t4 marker -->
                            <div class="absolute" style="left: ${t4Pos}%; top: -6px;">
                                <div class="w-3 h-3 rounded-full" style="background: var(--color-passive);"></div>
                                <div class="text-xs mt-1 font-mono" style="color: var(--text-primary);">t₄</div>
                            </div>
                        </div>
                    </div>

                    <!-- Slave timeline -->
                    <div class="absolute" style="top: 120px; left: 0; right: 0; height: 60px;">
                        <div class="text-xs font-bold mb-2" style="color: var(--color-slave);">SLAVE</div>
                        <div class="relative" style="height: 2px; background: var(--color-slave);">
                            <!-- t2 marker -->
                            <div class="absolute" style="left: ${t2Pos}%; top: -6px;">
                                <div class="w-3 h-3 rounded-full" style="background: var(--color-info);"></div>
                                <div class="text-xs mt-1 font-mono" style="color: var(--text-primary);">t₂</div>
                            </div>
                            <!-- t3 marker -->
                            <div class="absolute" style="left: ${t3Pos}%; top: -6px;">
                                <div class="w-3 h-3 rounded-full" style="background: var(--color-warning);"></div>
                                <div class="text-xs mt-1 font-mono" style="color: var(--text-primary);">t₃</div>
                            </div>
                        </div>
                    </div>

                    <!-- Arrows -->
                    <svg class="absolute" style="top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
                        <!-- Sync message (t1 → t2) -->
                        <line x1="${t1Pos}%" y1="25%" x2="${t2Pos}%" y2="62%"
                              stroke="var(--color-success)" stroke-width="2" stroke-dasharray="4"/>
                        <text x="${(t1Pos + t2Pos) / 2}%" y="40%"
                              fill="var(--text-primary)" font-size="10" text-anchor="middle">SYNC</text>

                        <!-- Delay_Req message (t3 → t4) -->
                        <line x1="${t3Pos}%" y1="62%" x2="${t4Pos}%" y2="25%"
                              stroke="var(--color-warning)" stroke-width="2" stroke-dasharray="4"/>
                        <text x="${(t3Pos + t4Pos) / 2}%" y="55%"
                              fill="var(--text-primary)" font-size="10" text-anchor="middle">DELAY_REQ</text>
                    </svg>
                </div>

                <!-- Légende -->
                <div class="mt-4 text-xs space-y-1" style="color: var(--text-secondary);">
                    <div>• <strong>SYNC</strong> : Master envoie son timestamp (t₁) au Slave (reçu à t₂)</div>
                    <div>• <strong>DELAY_REQ</strong> : Slave envoie une requête (t₃) reçue par Master (t₄)</div>
                </div>
            </div>
        `;
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.MathFormulas = MathFormulas;
}
