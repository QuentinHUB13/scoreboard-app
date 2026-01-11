const diceGame = {
    // On stocke ici la liste des faces de chaque dé choisi (ex: [6, 6, 4, 20])
    pool: [],

    render: function(container) {
        // 1. Zone "Ma Main" (Les dés qu'on va lancer)
        let poolHtml = '';
        if (this.pool.length === 0) {
            poolHtml = '<div style="color:#777; font-style:italic; padding:10px;">Aucun dé sélectionné</div>';
        } else {
            this.pool.forEach((sides, index) => {
                // Chaque dé est un petit bouton pour pouvoir le supprimer
                poolHtml += `
                <button onclick="diceGame.removeDie(${index})"
                        style="background:#333; border:1px solid #555; color:white; padding:8px 12px; border-radius:8px; margin:4px; cursor:pointer;">
                    d${sides} <span style="color:#e53935; font-weight:bold; margin-left:5px;">&times;</span>
                </button>`;
            });
        }

        // 2. Zone de Sélection (Ajouter des dés)
        // On propose les standards du jeu de rôle
        const standards = [4, 6, 8, 10, 12, 20, 100];
        let buttonsHtml = '';
        standards.forEach(s => {
            buttonsHtml += `
            <button class="segment-btn" onclick="diceGame.addDie(${s})" style="font-weight:bold; font-size:1.1rem;">
                d${s}
            </button>`;
        });

        // HTML Global
        container.innerHTML = `
        <div class="player-card" style="border-left-color: var(--col-dice);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <label>Dés à lancer</label>
                <button onclick="diceGame.clear()" style="background:none; border:none; color:#aaa; font-size:0.9rem;">Tout effacer 🗑️</button>
            </div>
           
            <div style="background:#111; border-radius:8px; padding:10px; min-height:50px; display:flex; flex-wrap:wrap; align-items:center;">
                ${poolHtml}
            </div>

            <label style="margin-top:15px; display:block;">Ajouter un dé :</label>
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:5px;">
                ${buttonsHtml}
            </div>
        </div>

        <div id="dice-results" style="min-height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top:20px;">
            <div style="color:#555;">Configurez votre main et lancez !</div>
        </div>
        `;

        // 3. Bouton Lancer
        document.getElementById('action-btn-container').innerHTML = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="location.reload()">Quitter</button>
            <button class="btn btn-dice" onclick="diceGame.roll()">🎲 LANCER (${this.pool.length})</button>
        </div>`;
    },

    // --- LOGIQUE ---

    addDie: function(sides) {
        this.pool.push(sides);
        this.render(document.getElementById('game-container'));
    },

    removeDie: function(index) {
        this.pool.splice(index, 1);
        this.render(document.getElementById('game-container'));
    },

    clear: function() {
        this.pool = [];
        this.render(document.getElementById('game-container'));
    },

    roll: function() {
        if (this.pool.length === 0) return alert("Ajoutez au moins un dé !");

        const area = document.getElementById('dice-results');
        area.innerHTML = '<div class="dice-rolling" style="font-size:3rem;">🎲...</div>';

        setTimeout(() => {
            let total = 0;
            let htmlDice = '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:15px;">';

            this.pool.forEach(sides => {
                const val = Math.floor(Math.random() * sides) + 1;
                total += val;
               
                // Style différent selon la valeur (Max = Vert, 1 = Rouge)
                let styleBorder = "#333";
                if (val === sides) styleBorder = "#43a047"; // Critique
                if (val === 1) styleBorder = "#e53935"; // Echec

                htmlDice += `
                <div class="die-face" style="border-color:${styleBorder}; position:relative;">
                    ${val}
                    <span style="position:absolute; bottom:2px; right:4px; font-size:0.6rem; color:#999;">d${sides}</span>
                </div>`;
            });
            htmlDice += '</div>';

            area.innerHTML = `
                ${htmlDice}
                <div style="font-size:1rem; color:#aaa; margin-top:10px;">TOTAL</div>
                <div style="font-size:3.5rem; font-weight:bold; color:var(--col-dice); line-height:1;">${total}</div>
            `;
        }, 300);
    }
};