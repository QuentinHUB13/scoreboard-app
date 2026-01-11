const starRealmsGame = {
    deltaTimers: {},
    pendingDeltas: {},

    init: function() {
        let reset = false;
        app.state.players.forEach(p => {
            if (p.score === 0) { p.score = 50; reset = true; }
            if (this.pendingDeltas[p.name] === undefined) this.pendingDeltas[p.name] = 0;
        });
        return reset;
    },

    render: function(container) {
        let activePlayers = app.state.players.filter(p => p.score > 0);
       
        if (activePlayers.length <= 1 && app.state.players.length > 1) {
             container.innerHTML = `<div style="text-align:center; padding-top:50px;"><h1>Partie Terminée !</h1><button class="btn btn-sr" onclick="app.finishGame()">Voir Résultats</button></div>`;
             return;
        }

        container.style.height = "calc(100vh - 120px)";
        container.style.display = "flex";
        container.style.width = "100%";
        container.style.gap = "8px";
       
        const totalStartPlayers = app.state.players.length;

        // --- CAS 1 : MODE VERTICAL (2 Joueurs) ---
        if (totalStartPlayers === 2) {
            container.style.flexDirection = "column";
            container.style.flexWrap = "nowrap";

            let html = '';
            app.state.players.forEach((p, index) => {
                if (p.score <= 0) return;

                // En mode 2J, on utilise la logique buildZoneHtml spéciale
                // Index 0 = Haut (Inversé 180), Index 1 = Bas (Normal)
                let contentClass = (index === 0) ? 'sr-rotate-180' : '';
               
                // Toujours Expanded en mode 2 joueurs
                html += this.buildZoneHtml(p, index, '100%', 'calc(50% - 4px)', '', contentClass, true);
            });
            container.innerHTML = html;
        }
       
        // --- CAS 2 : MODE HORIZONTAL (3 ou 4 Joueurs) ---
        else {
            container.style.flexDirection = "column";
            container.innerHTML = '';

            // Ligne du Haut (Joueurs 0 et 1)
            const topRowHtml = this.buildRowHtml([0, 1]);
            const divTop = document.createElement('div');
            divTop.className = 'sr-row-container';
            divTop.innerHTML = topRowHtml;
            container.appendChild(divTop);

            // Ligne du Bas (Joueurs 2 et 3)
            const bottomRowHtml = this.buildRowHtml([2, 3]);
            const divBottom = document.createElement('div');
            divBottom.className = 'sr-row-container';
            divBottom.innerHTML = bottomRowHtml;
            container.appendChild(divBottom);
        }

        document.getElementById('action-btn-container').innerHTML = `<button class="btn btn-neutral" style="opacity:0.6; padding:5px 20px; font-size:0.8rem; width:auto; margin:0 auto;" onclick="app.finishGame()">Finir</button>`;
    },

    buildRowHtml: function(indices) {
        let html = '';
        const rowPlayers = [];
        indices.forEach(idx => {
            if (app.state.players[idx] && app.state.players[idx].score > 0) {
                rowPlayers.push({ p: app.state.players[idx], idx: idx });
            }
        });

        if (rowPlayers.length === 0) return '<div style="flex:1;"></div>';

        const isExpanded = (rowPlayers.length === 1);

        rowPlayers.forEach(item => {
            // DÉTERMINATION DU SENS DU TEXTE
            // Indice Pair (0, 2) = Gauche = 90° (Haut -> Bas)
            // Indice Impair (1, 3) = Droite = -90° (Bas -> Haut)
            let contentClass = '';
            if (item.idx % 2 === 0) {
                contentClass = 'sr-rotate-90';
            } else {
                contentClass = 'sr-rotate-minus-90';
            }

            html += this.buildZoneHtml(item.p, item.idx, 'auto', '100%', '', contentClass, isExpanded);
        });

        return html;
    },

    buildZoneHtml: function(p, index, width, height, zoneClass, contentClass, isExpanded) {
        let color = '#4caf50';
        if(p.score <= 25) color = '#ffeb3b';
        if(p.score <= 10) color = '#f44336';

        const deltaVal = this.pendingDeltas[p.name] || 0;
        const sign = deltaVal > 0 ? '+' : '';
        const deltaHtml = deltaVal !== 0 ? `<span class="sr-delta fade-out">${sign}${deltaVal}</span>` : '';
       
        const expandedClass = isExpanded ? 'sr-expanded' : '';

        return `
        <div class="sr-zone ${zoneClass} ${expandedClass}" style="width:${width}; height:${height}; border-color:${color}; flex-grow:1;">
            <div class="sr-inner-layout ${contentClass}">
                <div class="sr-info">
                    <span class="sr-name">${p.name}</span>
                    ${deltaHtml}
                </div>
                <div class="sr-score" style="color:${color}">${p.score}</div>
                <div class="sr-controls">
                    <button class="sr-btn minus" onclick="starRealmsGame.update(${index}, -1)">-1</button>
                    <button class="sr-btn minus" onclick="starRealmsGame.update(${index}, -5)">-5</button>
                    <button class="sr-btn plus" onclick="starRealmsGame.update(${index}, 5)">+5</button>
                    <button class="sr-btn plus" onclick="starRealmsGame.update(${index}, 1)">+1</button>
                </div>
            </div>
        </div>`;
    },

    update: function(idx, val) {
        const p = app.state.players[idx];
        p.score += val;
       
        if (!this.pendingDeltas[p.name]) this.pendingDeltas[p.name] = 0;
        this.pendingDeltas[p.name] += val;

        if (this.deltaTimers[p.name]) clearTimeout(this.deltaTimers[p.name]);
        this.deltaTimers[p.name] = setTimeout(() => {
            this.pendingDeltas[p.name] = 0;
            this.render(document.getElementById('game-container'));
        }, 1500);

        this.render(document.getElementById('game-container'));
    }
};