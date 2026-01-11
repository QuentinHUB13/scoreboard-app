const skyjoGame = {
    render: function(container) {
        // 1. Affichage des totaux actuels (Scoreboard)
        let html = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:20px;">`;
       
        app.state.players.forEach(p => {
            html += `
            <div class="tarot-score-pill" style="border-color:var(--quinary); background:#004d40;">
                <span style="font-size:0.8rem; opacity:0.8">${p.name}</span>
                <span style="display:block; font-weight:bold; font-size:1.2rem;">${p.score}</span>
            </div>`;
        });
        html += `</div>`;

        // 2. Zone de saisie pour la manche en cours
        app.state.players.forEach((p, i) => {
            html += `
            <div class="player-card" style="border-left-color: var(--quinary); display:flex; align-items:center; justify-content:space-between;">
                <div style="font-weight:bold; width:30%;">${p.name}</div>
               
                <div style="display:flex; align-items:center; gap:5px; width:70%; justify-content:flex-end;">
                    <button class="sk-btn-step" style="background:#333;" onclick="skyjoGame.updateInput(${i}, -1)">-</button>
                   
                    <input type="number" id="skyjo-in-${i}" value="0"
                           style="width:60px; text-align:center; font-size:1.3rem; font-weight:bold; margin:0; padding:10px;"
                           onfocus="this.select()">
                   
                    <button class="sk-btn-step" style="background:#333;" onclick="skyjoGame.updateInput(${i}, 1)">+</button>
                </div>
            </div>`;
        });

        container.innerHTML = html;

        // 3. Boutons d'action (Finir ou Continuer)
        document.getElementById('action-btn-container').innerHTML = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="app.finishGame()">🏁 Terminer la partie</button>
            <button class="btn btn-skyjo" onclick="skyjoGame.validate()">Manche Suivante ></button>
        </div>`;
    },

    // Permet d'utiliser les boutons + et - pour changer la valeur du champ
    updateInput: function(index, delta) {
        const input = document.getElementById(`skyjo-in-${index}`);
        let currentVal = parseInt(input.value) || 0;
        input.value = currentVal + delta;
    },

    validate: function() {
        // On boucle sur tous les joueurs pour ajouter leur score de manche
        for (let i = 0; i < app.state.players.length; i++) {
            const input = document.getElementById(`skyjo-in-${i}`);
            const val = parseInt(input.value);

            if (isNaN(val)) {
                return alert(`Le score de ${app.state.players[i].name} est invalide !`);
            }

            app.state.players[i].score += val;
        }

        // On passe à la manche suivante (sans limite de nombre)
        app.nextRound();
    }
};