const tarotGame = {
    OUDLERS: { 0: 56, 1: 51, 2: 41, 3: 36 },
    CONTRATS: { 'P': 1, 'G': 2, 'GS': 4, 'GC': 6 },

    render: function(container) {
        // 1. Scoreboard Top
        let scoresHtml = '<div class="tarot-board">';
        app.state.players.forEach(p => scoresHtml += `<div class="tarot-score-pill"><span>${p.name}</span><span style="display:block;font-weight:bold;font-size:1.1rem">${p.score}</span></div>`);
        scoresHtml += '</div>';

        // 2. Formulaire
        let options = app.state.players.map((p,i) => `<option value="${i}">${p.name}</option>`).join('');
        let partnerHtml = '';
        // Si 5 joueurs, on affiche le choix du partenaire
        if (app.state.players.length === 5) {
            partnerHtml = `<label>Partenaire (Appel au Roi)</label><select id="t-partner"><option value="-1">Aucun (Seul)</option>${options}</select>`;
        }

        container.innerHTML = `
        ${scoresHtml}
        <div class="player-card tarot-form" style="border-left-color: var(--tertiary)">
            <label>Preneur</label><select id="t-taker">${options}</select>
            ${partnerHtml}
           
            <label>Contrat</label>
            <div class="tarot-segment">
                <button class="segment-btn selected" onclick="tarotGame.sel(this,'P')">Petite</button>
                <button class="segment-btn" onclick="tarotGame.sel(this,'G')">Garde</button>
                <button class="segment-btn" onclick="tarotGame.sel(this,'GS')">G.Sans</button>
                <button class="segment-btn" onclick="tarotGame.sel(this,'GC')">G.Contre</button>
            </div>
            <input type="hidden" id="t-contract" value="P">

            <div style="display:flex; gap:10px;">
                <div style="flex:1">
                    <label>Bouts</label>
                    <select id="t-oudlers">
                        <option value="0">0 (56)</option>
                        <option value="1">1 (51)</option>
                        <option value="2">2 (41)</option>
                        <option value="3">3 (36)</option>
                    </select>
                </div>
                <div style="flex:1">
                    <label>Points Faits</label>
                    <input type="number" id="t-points" placeholder="Ex: 41.5" step="0.5">
                </div>
            </div>
           
            <label>Petit au Bout</label>
            <select id="t-petit"><option value="0">Non</option><option value="1">Oui (Attaque)</option><option value="-1">Oui (Défense)</option></select>
        </div>`;

        // 3. Buttons
        document.getElementById('action-btn-container').innerHTML = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="app.finishGame()">Finir</button>
            <button class="btn btn-tarot" onclick="tarotGame.validate()">Valider</button>
        </div>`;
    },

    sel: function(btn, val) {
        document.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('t-contract').value = val;
    },

    // Fonction utilitaire pour arrondir à la dizaine
    round10: function(val) {
        return Math.round(val / 10) * 10;
    },

    validate: function() {<
        // 1. CHECKPOINT ! (On sauvegarde l'état AVANT de calculer les nouveaux scores)
        app.createCheckpoint();
        const takerIdx = parseInt(document.getElementById('t-taker').value);
        const partnerIdx = document.getElementById('t-partner') ? parseInt(document.getElementById('t-partner').value) : -1;
        const contract = document.getElementById('t-contract').value;
        const nbOudlers = parseInt(document.getElementById('t-oudlers').value);
        const pointsInput = document.getElementById('t-points').value;
        const petit = parseInt(document.getElementById('t-petit').value);

        if (pointsInput === "") return alert("Points manquants !");
        const pointsMade = parseFloat(pointsInput);

        if (app.state.players.length === 5 && takerIdx === partnerIdx) return alert("Le preneur ne peut pas être partenaire.");

        // 1. Calcul de la différence
        const target = this.OUDLERS[nbOudlers];
        const diff = pointsMade - target;
        const isSuccess = diff >= 0;
       
        // 2. Score de base (25 + Ecart)
        let base = 25 + Math.abs(diff);
        let score = base * this.CONTRATS[contract];

        // 3. Gestion du Petit au Bout (Multiplié par le contrat)
        // Si petit pour l'attaque : on ajoute. Si pour défense : on retire (du point de vue du contrat de base)
        if (petit === 1) score += (10 * this.CONTRATS[contract]);
        if (petit === -1) score -= (10 * this.CONTRATS[contract]);

        // 4. ARRONDI À LA DIZAINE (Nouveau)
        score = this.round10(score);

        // 5. Application de la Chute ou Réussite
        if (!isSuccess) score = -score;

        // 6. Distribution des points
        const nbP = app.state.players.length;
       
        if (nbP < 5) {
            // 3 ou 4 Joueurs (1 contre tous)
            const defCount = nbP - 1;
            app.state.players.forEach((p, i) => {
                if (i === takerIdx) p.score += (score * defCount);
                else p.score -= score;
            });
        } else {
            // 5 Joueurs
            if (partnerIdx === -1) {
                // Preneur joue seul contre 4
                app.state.players.forEach((p, i) => {
                    if (i === takerIdx) p.score += (score * 4);
                    else p.score -= score;
                });
            } else {
                // Appel au Roi (2 contre 3)
                app.state.players.forEach((p, i) => {
                    if (i === takerIdx) p.score += (score * 2);
                    else if (i === partnerIdx) p.score += score;
                    else p.score -= score;
                });
            }
        }

        app.nextRound();
    }

};
