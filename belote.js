const beloteGame = {
    mode: 'classique', // 'classique' ou 'coinche'
    isCapotMode: false, // État pour savoir si on est en train de saisir un capot

    render: function(container) {
        const t1 = app.state.players[0];
        const t2 = app.state.players[1];
        const mode = app.state.beloteMode;
        const target = app.state.targetScore;

        // Reset état capot au rendu
        this.isCapotMode = false;

        // 1. Scoreboard & Objectif
        let html = `
        <div style="text-align:center; color:#aaa; font-size:0.8rem; margin-bottom:5px;">Objectif : ${target} points</div>
        <div style="display:flex; gap:10px; margin-bottom:20px;">
            <div class="player-card" style="flex:1; text-align:center; border-left-color:var(--quaternary); background:#1b5e20;">
                <div style="font-size:0.9rem; opacity:0.8">${t1.name}</div>
                <div style="font-size:2.5rem; font-weight:bold;">${t1.score}</div>
            </div>
            <div class="player-card" style="flex:1; text-align:center; border-left-color:var(--quaternary); background:#1b5e20;">
                <div style="font-size:0.9rem; opacity:0.8">${t2.name}</div>
                <div style="font-size:2.5rem; font-weight:bold;">${t2.score}</div>
            </div>
        </div>`;

        // 2. Formulaire Principal
        html += `
        <div class="player-card" style="border-left-color: var(--quaternary)">
            <label>Qui prend ?</label>
            <div class="tarot-segment" id="team-selector">
                <button class="segment-btn selected" onclick="beloteGame.selTeam(this, 0)">${t1.name}</button>
                <button class="segment-btn" onclick="beloteGame.selTeam(this, 1)">${t2.name}</button>
            </div>
            <input type="hidden" id="b-taker" value="0">

            <div id="area-annonce" class="${mode==='classique'?'hidden':''}" style="margin-top:10px;">
                <label>Contrat Annoncé (80 - 160)</label>
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="number" id="b-bid" placeholder="Ex: 100" min="80" max="160" step="10" style="font-size:1.2rem; text-align:center;">
                </div>
            </div>

            <hr style="border:0; border-top:1px solid #444; margin:15px 0;">

            <button id="btn-toggle-capot" class="btn btn-neutral" style="border:1px dashed #777; padding:10px;" onclick="beloteGame.toggleCapotUI()">
                ✨ Saisir un Capot (250 pts)
            </button>

            <div id="area-standard">
                <label>Points Faits par l'Attaque</label>
                <div style="display:flex; align-items:center; gap:10px;">
                    <input type="number" id="b-points" placeholder="Ex: 92" max="162" style="font-size:1.5rem; text-align:center;">
                    <span style="color:#aaa; font-size:0.9rem;">/ 162</span>
                </div>
            </div>

            <div id="area-capot" class="hidden" style="background:#333; padding:10px; border-radius:8px; border:1px solid #ffd700; text-align:center;">
                <h3 style="color:#ffd700; margin-top:0;">🌟 CAPOT (250) 🌟</h3>
                <label style="color:#fff;">Qui a remporté le Capot ?</label>
                <div class="tarot-segment">
                    <button class="segment-btn selected" onclick="beloteGame.selCapotWinner(this, 0)">Le Preneur</button>
                    <button class="segment-btn" onclick="beloteGame.selCapotWinner(this, 1)">La Défense</button>
                </div>
                <input type="hidden" id="b-capot-winner" value="0"> </div>

            <div style="margin-top:15px;">
                <label>Belote (+20)</label>
                <select id="b-belote">
                    <option value="-1">Non</option>
                    <option value="0">Pour le Preneur</option>
                    <option value="1">Pour la Défense</option>
                </select>
            </div>
        </div>`;

        container.innerHTML = html;

        document.getElementById('action-btn-container').innerHTML = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="app.finishGame()">Finir</button>
            <button class="btn btn-belote" onclick="beloteGame.validate()">Valider</button>
        </div>`;
    },

    // --- UI HELPERS ---

    selTeam: function(btn, idx) {
        const container = btn.parentElement;
        container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('b-taker').value = idx;
    },

    selCapotWinner: function(btn, val) {
        const container = btn.parentElement;
        container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('b-capot-winner').value = val;
    },

    toggleCapotUI: function() {
        this.isCapotMode = !this.isCapotMode;
        const btn = document.getElementById('btn-toggle-capot');
        const areaStd = document.getElementById('area-standard');
        const areaCap = document.getElementById('area-capot');

        if (this.isCapotMode) {
            btn.classList.add('selected');
            btn.style.borderColor = "#ffd700";
            btn.style.color = "#ffd700";
            btn.innerText = "❌ Annuler Capot";
            areaStd.classList.add('hidden');
            areaCap.classList.remove('hidden');
        } else {
            btn.classList.remove('selected');
            btn.style.borderColor = "#777";
            btn.style.color = "white";
            btn.innerText = "✨ Saisir un Capot (250 pts)";
            areaStd.classList.remove('hidden');
            areaCap.classList.add('hidden');
        }
    },

    round10: function(val) {
        return Math.round(val / 10) * 10;
    },

    // --- VALIDATION & CALCUL ---

    validate: function() {
        // Indices des équipes
        const takerIdx = parseInt(document.getElementById('b-taker').value); // L'index du preneur dans le tableau players
        const defIdx = takerIdx === 0 ? 1 : 0; // L'index de l'adversaire
       
        const mode = app.state.beloteMode;
        const beloteWho = parseInt(document.getElementById('b-belote').value); // -1, 0 (Taker), 1 (Def)
       
        let pointsTaker = 0;
        let pointsDef = 0;
        let bid = 0;

        // 1. Vérification Annonce (Coinche)
        if (mode === 'coinche') {
            const bidInput = document.getElementById('b-bid').value;
            if (!bidInput) return alert("Entrez le contrat annoncé !");
            bid = parseInt(bidInput);
            if (bid < 80 || bid > 160) return alert("L'annonce doit être entre 80 et 160 !");
        }

        // 2. Gestion BELOTE (Points bonus)
        const bonusTaker = (beloteWho === 0) ? 20 : 0;
        const bonusDef = (beloteWho === 1) ? 20 : 0;

        // --- CAS 1 : CAPOT ---
        if (this.isCapotMode) {
            const capotWinnerType = parseInt(document.getElementById('b-capot-winner').value); // 0 = Taker wins, 1 = Def wins
           
            // Le gagnant du capot prend 250 + Annonce (si coinche) + Belote
            const scoreCapot = 250 + bid;

            if (capotWinnerType === 0) {
                // Preneur a fait le capot
                pointsTaker = scoreCapot + bonusTaker;
                pointsDef = bonusDef; // La défense marque-t-elle sa belote sur un capot ? Souvent oui.
            } else {
                // Défense a mis le preneur Capot (Contre-Capot / Capot Dedans)
                pointsDef = scoreCapot + bonusDef;
                pointsTaker = bonusTaker;
            }
        }
       
        // --- CAS 2 : JEU STANDARD ---
        else {
            const ptsInput = document.getElementById('b-points').value;
            if (ptsInput === "") return alert("Entrez les points faits !");
            const rawTaker = parseInt(ptsInput);

            if (rawTaker > 162) return alert("Max 162 points ! (Utilisez le bouton Capot pour 250)");
            if (rawTaker < 0) return alert("Points négatifs impossibles");

            const rawDef = 162 - rawTaker;

            // Calcul Coinche vs Classique
            if (mode === 'classique') {
                // Classique : Total doit être > Total Défense
                let totalTaker = rawTaker + bonusTaker;
                let totalDef = rawDef + bonusDef;

                if (totalTaker > totalDef) {
                    // RÉUSSI
                    pointsTaker = this.round10(rawTaker) + bonusTaker;
                    pointsDef = this.round10(rawDef) + bonusDef;
                } else {
                    // CHUTE (Dedans) -> Défense prend 160 + Belotes
                    pointsTaker = bonusTaker; // Selon règles, preneur garde parfois belote. Ici oui.
                    pointsDef = 160 + bonusTaker + bonusDef; // Défense prend 160 + tout
                }
            } else {
                // Coinche : Total Réalisé (Points+Belote) >= Annonce
                let totalRealise = rawTaker + bonusTaker;

                if (totalRealise >= bid) {
                    // RÉUSSI
                    pointsTaker = this.round10(rawTaker) + bid + bonusTaker;
                    pointsDef = this.round10(rawDef) + bonusDef;
                } else {
                    // CHUTE
                    // Défense gagne 160 + Annonce + Belotes
                    pointsTaker = bonusTaker;
                    pointsDef = 160 + bid + bonusTaker + bonusDef;
                }
            }
        }

        // 3. Attribution des scores aux équipes
        app.state.players[takerIdx].score += pointsTaker;
        app.state.players[defIdx].score += pointsDef;

        // 4. Vérification Victoire
        const target = app.state.targetScore;
        const s1 = app.state.players[0].score;
        const s2 = app.state.players[1].score;

        if (s1 >= target || s2 >= target) {
            app.finishGame();
        } else {
            app.nextRound();
        }
    }
};