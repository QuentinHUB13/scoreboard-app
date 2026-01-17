const tarotGame = {
    // État temporaire pour la manche en cours
    current: {
        taker: 0,      // Index du preneur
        partner: -1,   // Index du partenaire (si 5 joueurs)
        contract: 1,   // 1=Petite, 2=Garde, 4=Garde Sans, 6=Garde Contre
        oudlers: 0,    // Nombre de bouts (0, 1, 2, 3)
        points: 0,     // Points faits par l'attaque
        petit: 0,      // 0=Non, 1=Attaque, -1=Défense
        poignee: 0,    // 0=Non, 20=Simple, 30=Double, 40=Triple
        chelem: 0      // 0=Non, 200=Annoncé/Réalisé, etc. (Simplifié ici à bonus)
    },

    render: function(container) {
        const pCount = app.state.players.length;
        const c = this.current;

        // --- 1. SÉLECTION DU PRENEUR ---
        let html = `<h3 style="margin-bottom:10px; text-align:center;">Qui a pris ?</h3>
                    <div class="tarot-board">`;
       
        app.state.players.forEach((p, i) => {
            const isSel = (c.taker === i) ? 'border-color:var(--tertiary); background:var(--tertiary); color:white;' : 'background:rgba(255,255,255,0.05);';
            html += `<div onclick="tarotGame.setTaker(${i})" style="${isSel} padding:10px; border-radius:8px; cursor:pointer; border:1px solid #555; min-width:80px; text-align:center;">
                        ${p.name}
                     </div>`;
        });
        html += `</div>`;

        // --- 2. SÉLECTION DU PARTENAIRE (SI 5 JOUEURS) ---
        if (pCount === 5) {
            html += `<h3 style="margin-bottom:10px; text-align:center;">Appel au Roi (Partenaire)</h3>
                     <div class="tarot-board">`;
            app.state.players.forEach((p, i) => {
                if (i === c.taker) return; // On ne peut pas s'appeler soi-même
                const isSel = (c.partner === i) ? 'border-color:var(--secondary); background:var(--secondary); color:white;' : 'background:rgba(255,255,255,0.05);';
                html += `<div onclick="tarotGame.setPartner(${i})" style="${isSel} padding:10px; border-radius:8px; cursor:pointer; border:1px solid #555; min-width:80px; text-align:center;">
                            ${p.name}
                         </div>`;
            });
            html += `</div>`;
        }

        // --- 3. CONTRAT ---
        html += `<div style="margin-bottom:15px;">
                    <div style="text-align:center; color:#aaa; margin-bottom:5px;">Contrat</div>
                    <div class="tarot-segment">
                        <button class="segment-btn ${c.contract===1?'selected':''}" onclick="tarotGame.setContract(1)">Petite (x1)</button>
                        <button class="segment-btn ${c.contract===2?'selected':''}" onclick="tarotGame.setContract(2)">Garde (x2)</button>
                        <button class="segment-btn ${c.contract===4?'selected':''}" onclick="tarotGame.setContract(4)">G.Sans (x4)</button>
                        <button class="segment-btn ${c.contract===6?'selected':''}" onclick="tarotGame.setContract(6)">G.Contre (x6)</button>
                    </div>
                 </div>`;

        // --- 4. RÉSULTAT (Bouts + Points) ---
        html += `<div style="display:flex; gap:10px; margin-bottom:15px;">
                    <div style="flex:1;">
                        <div style="text-align:center; color:#aaa; margin-bottom:5px;">Bouts</div>
                        <div class="tarot-segment">
                            <button class="segment-btn ${c.oudlers===0?'selected':''}" onclick="tarotGame.setOudlers(0)">0</button>
                            <button class="segment-btn ${c.oudlers===1?'selected':''}" onclick="tarotGame.setOudlers(1)">1</button>
                            <button class="segment-btn ${c.oudlers===2?'selected':''}" onclick="tarotGame.setOudlers(2)">2</button>
                            <button class="segment-btn ${c.oudlers===3?'selected':''}" onclick="tarotGame.setOudlers(3)">3</button>
                        </div>
                    </div>
                    <div style="flex:1;">
                        <div style="text-align:center; color:#aaa; margin-bottom:5px;">Points Attaque</div>
                        <input type="number" value="${c.points}" onchange="tarotGame.setPoints(this.value)" style="text-align:center; font-size:1.5rem; font-weight:bold;">
                    </div>
                 </div>`;

        // --- 5. BONUS (Petit au bout, Poignée) ---
        html += `<div style="background:rgba(0,0,0,0.2); padding:10px; border-radius:10px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <span>Petit au bout</span>
                        <div class="tarot-segment" style="margin:0; width:60%;">
                            <button class="segment-btn ${c.petit===-1?'selected':''}" onclick="tarotGame.setBonus('petit', -1)">Déf</button>
                            <button class="segment-btn ${c.petit===0?'selected':''}" onclick="tarotGame.setBonus('petit', 0)">-</button>
                            <button class="segment-btn ${c.petit===1?'selected':''}" onclick="tarotGame.setBonus('petit', 1)">Att</button>
                        </div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span>Poignée</span>
                        <div class="tarot-segment" style="margin:0; width:60%;">
                            <button class="segment-btn ${c.poignee===0?'selected':''}" onclick="tarotGame.setBonus('poignee', 0)">-</button>
                            <button class="segment-btn ${c.poignee===20?'selected':''}" onclick="tarotGame.setBonus('poignee', 20)">Simp</button>
                            <button class="segment-btn ${c.poignee===30?'selected':''}" onclick="tarotGame.setBonus('poignee', 30)">Doub</button>
                            <button class="segment-btn ${c.poignee===40?'selected':''}" onclick="tarotGame.setBonus('poignee', 40)">Trip</button>
                        </div>
                    </div>
                 </div>`;

        // --- 6. BOUTON VALIDER ---
        container.innerHTML = html;
        document.getElementById('action-btn-container').innerHTML = `
            <button class="btn btn-tarot" onclick="tarotGame.validate()">Calculer la manche</button>
        `;
    },

    // --- SETTERS ---
    setTaker: function(i) { this.current.taker = i; this.render(document.getElementById('game-container')); },
    setPartner: function(i) { this.current.partner = i; this.render(document.getElementById('game-container')); },
    setContract: function(v) { this.current.contract = v; this.render(document.getElementById('game-container')); },
    setOudlers: function(v) { this.current.oudlers = v; this.render(document.getElementById('game-container')); },
    setPoints: function(v) { this.current.points = parseFloat(v); }, // Pas de re-render pour ne pas perdre le focus
    setBonus: function(type, v) { this.current[type] = v; this.render(document.getElementById('game-container')); },

    // --- CALCULS ---
    validate: function() {
        // 1. CHECKPOINT POUR L'HISTORIQUE (Important !)
        app.createCheckpoint();

        const c = this.current;
        const nbPlayers = app.state.players.length;

        // Objectifs selon nombre de bouts
        const targets = { 0: 56, 1: 51, 2: 41, 3: 36 };
        const target = targets[c.oudlers];
       
        // Calcul de base
        let diff = c.points - target;
        const isSuccess = diff >= 0;
       
        // La règle des 25 points
        let scoreBase = 25 + Math.abs(diff);
        if (c.contract === 1 && !isSuccess) {
            // Cas particulier Petite perdue ? Non, le calcul reste (25 + chute) * 1
        }

        // Multiplicateur Contrat
        let scoreTotal = scoreBase * c.contract;

        // Ajout Poignée (Indépendant du multiplicateur, s'ajoute au camp qui l'a annoncée - Simplification : Ajouté au score de base)
        // Note: Normalement la poignée est ajoutée avant multiplication ? Non, après mais non multipliée.
        // Simplification usuelle : (25 + pts + petit) * contrat + poignée.
        // Ici on va faire simple : on l'ajoute au total du camp gagnant.
        scoreTotal += c.poignee;

        // Petit au bout (Multiplié par le contrat !)
        // Si petit mené par attaque au bout : (25 + pts + 10) * contrat
        if (c.petit !== 0) {
            // Le petit au bout (10pts) est multiplié par le contrat
            const petitPoints = 10 * c.contract;
           
            if (isSuccess) {
                // Si attaque gagne
                if (c.petit === 1) scoreTotal += petitPoints; // Attaque a mené petit -> Bonus
                else scoreTotal -= petitPoints; // Défense a mené petit -> Malus pour attaque
            } else {
                // Si attaque perd
                if (c.petit === 1) scoreTotal -= petitPoints; // Attaque a mené petit -> Moins de perte ? Non, ils ont le bonus mais perdent le contrat.
                // Correction Règle officielle : Le petit au bout profite à celui qui le fait, quel que soit le résultat du contrat.
                // Donc on le traite à part.
            }
        }
       
        // RE-CALCUL PLUS STRICT :
        // Score = (25 + |Ecart|) * Contrat
        let ptsContrat = (25 + Math.abs(diff)) * c.contract;
       
        // Petit au Bout : + ou - (10 * Contrat) pour celui qui l'a fait
        if (c.petit === 1) ptsContrat += (10 * c.contract); // Bonus pour l'attaque
        if (c.petit === -1) ptsContrat -= (10 * c.contract); // Malus pour l'attaque (car bonus pour la défense)

        // Poignée : Ajoutée au total
        ptsContrat += c.poignee;

        // Résultat final pour le preneur
        const finalScore = isSuccess ? ptsContrat : -ptsContrat;

        // --- DISTRIBUTION DES POINTS ---
        app.state.players.forEach((p, i) => {
            // Le Preneur
            if (i === c.taker) {
                if (nbPlayers === 5 && c.partner !== -1) {
                    p.score += (finalScore * 2); // À 5, preneur gagne x2 (il paie les 3 defs, reçoit de son partenaire)
                    // Règle à 5 : (Preneur + Partenaire) vs (3 Défenseurs).
                    // ScoreBase * 2 pour Preneur, * 1 pour Partenaire.
                } else {
                    p.score += (finalScore * (nbPlayers - 1));
                }
            }
            // Le Partenaire (Si 5 joueurs)
            else if (nbPlayers === 5 && i === c.partner) {
                p.score += finalScore; // Le partenaire gagne 1x la mise
            }
            // Les Défenseurs
            else {
                p.score -= finalScore; // Les défenseurs perdent la mise
            }
        });

        // Reset partiel pour la manche suivante
        this.current.points = 0;
        this.current.petit = 0;
        this.current.poignee = 0;
       
        app.nextRound();
    }
};
