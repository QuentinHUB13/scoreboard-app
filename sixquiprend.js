const sixGame = {
    render: function(container) {
        // 1. Scoreboard
        let html = `
        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:20px;">`;
       
        app.state.players.forEach(p => {
            html += `
            <div class="tarot-score-pill" style="border-color:var(--col-six); background:#e65100;">
                <span style="font-size:0.8rem; opacity:0.8">${p.name}</span>
                <span style="display:block; font-weight:bold; font-size:1.2rem;">${p.score} 🐮</span>
            </div>`;
        });
        html += `</div>`;

        // 2. Zone de saisie
        app.state.players.forEach((p, i) => {
            html += `
            <div class="player-card" style="border-left-color: var(--col-six); display:flex; align-items:center; justify-content:space-between;">
                <div style="font-weight:bold; width:30%;">${p.name}</div>
               
                <div style="display:flex; align-items:center; gap:5px; width:70%; justify-content:flex-end;">
                    <button class="sk-btn-step" style="background:#333;" onclick="sixGame.updateInput(${i}, -1)">-</button>
                   
                    <input type="number" id="six-in-${i}" value="0"
                           style="width:60px; text-align:center; font-size:1.3rem; font-weight:bold; margin:0; padding:10px;"
                           onfocus="this.select()">
                   
                    <button class="sk-btn-step" style="background:#333;" onclick="sixGame.updateInput(${i}, 1)">+</button>
                    <button class="sk-btn-step" style="background:#333;" onclick="sixGame.updateInput(${i}, 5)">+5</button>
                </div>
            </div>`;
        });

        container.innerHTML = html;

        document.getElementById('action-btn-container').innerHTML = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="app.finishGame()">🏁 Terminer</button>
            <button class="btn btn-six" onclick="sixGame.validate()">Manche Suivante ></button>
        </div>`;
    },

    updateInput: function(index, delta) {
        const input = document.getElementById(`six-in-${index}`);
        let currentVal = parseInt(input.value) || 0;
        input.value = currentVal + delta;
    },

    validate: function() {
        for (let i = 0; i < app.state.players.length; i++) {
            const input = document.getElementById(`six-in-${i}`);
            const val = parseInt(input.value);
            if (isNaN(val)) return alert(`Score invalide pour ${app.state.players[i].name}`);
            app.state.players[i].score += val;
        }
        app.nextRound();
    }
};