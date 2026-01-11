const papayooGame = {
    render: function(container) {
        // 1. Cards
        app.state.players.forEach((p, i) => {
            container.innerHTML += `
            <div class="player-card" style="border-left-color: var(--secondary)">
                <div class="player-header"><span>${p.name}</span><span>Total: ${p.score}</span></div>
                <div class="pap-input-row">
                    <input type="number" class="pap-input" id="pap-in-${i}" placeholder="0" oninput="papayooGame.checkSum()">
                    <button class="btn-magic" onclick="papayooGame.fill(${i})">🪄</button>
                </div>
            </div>`;
        });

        // 2. Buttons
        const btnsHtml = `
        <div class="btn-row">
            <button class="btn btn-neutral" onclick="app.finishGame()">Finir</button>
            <button id="btn-pap-next" class="btn btn-pap" onclick="papayooGame.validate()" disabled>Suivante ></button>
        </div>`;
        document.getElementById('action-btn-container').innerHTML = btnsHtml;

        // 3. Init Check
        this.checkSum();
    },

    checkSum: function() {
        let sum = 0; app.state.players.forEach((p, i) => sum += (parseInt(document.getElementById(`pap-in-${i}`).value) || 0));
        const banner = document.getElementById('game-total-banner');
        banner.classList.remove('hidden');
        document.getElementById('banner-text').innerText = `Total : ${sum} / 250`;
       
        const btn = document.getElementById('btn-pap-next');
        if (btn) {
            if (sum === 250) { banner.className = "total-banner sum-ok"; btn.disabled = false; }
            else { banner.className = "total-banner sum-bad"; btn.disabled = true; }
        }
    },

    fill: function(idx) {
        let cur = 0;
        app.state.players.forEach((p,i) => { if(i!==idx) cur += (parseInt(document.getElementById(`pap-in-${i}`).value)||0) });
        document.getElementById(`pap-in-${idx}`).value = 250 - cur;
        this.checkSum();
    },

    validate: function() {
        app.state.players.forEach((p, i) => p.score += (parseInt(document.getElementById(`pap-in-${i}`).value) || 0));
        app.nextRound();
    }
};