const app = {
    state: {
        game: null,
        players: [],
        round: 1,
        dealerIdx: 0,
        maxRounds: 10,
        beloteMode: 'classique',
        targetScore: 1000,
        skMode: 'classic',
        // NOUVEAU : Historique pour l'annulation
        history: []
    },

    RULES: {
        papayoo: { 3: "6x3 + 1x2 (Écart 5)", 4: "5x3 (Écart 5)", 5: "4x3 (Écart 4)", 6: "3x3 + 1x2 (Écart 3)", 7: "⚠️ Sans As (Écart 3)", 8: "⚠️ Sans As (Écart 3)" },
        tarot: { 3: "1 vs 2", 4: "1 vs 3", 5: "Appel au Roi (1+1 vs 3)" },
        belote: { 2: "Entrez les noms des 2 équipes", 4: "Entrez les 4 joueurs (Equipe 1 vs Equipe 2)" },
        skyjo: { 2: "Le but est d'avoir le moins de points. Fin à 100 pts." },
        rami: { 2: "Le moins de points possible." },
        six: { 2: "Attention aux têtes de bœufs ! Fin à 66 pts." },
        starrealms: { 2: "Combat Spatial. Départ 50 PV. Le dernier survivant gagne." }
    },

    // --- INITIALISATION ---
    init: function() {
        // Vérifier s'il y a une sauvegarde
        const save = localStorage.getItem('sb_save');
        if (save) {
            document.getElementById('btn-resume').classList.remove('hidden');
        }
       
        // Haptic global
        document.addEventListener('click', function(e) {
            if (e.target.closest('button') && navigator.vibrate) navigator.vibrate(10);
        });
    },

    // --- SAUVEGARDE & RESTAURATION ---
    saveGame: function() {
        // On sauvegarde l'état actuel dans le téléphone
        localStorage.setItem('sb_save', JSON.stringify(this.state));
    },

    resumeGame: function() {
        const save = localStorage.getItem('sb_save');
        if (!save) return;
       
        this.state = JSON.parse(save);
       
        // Restauration de l'interface
        this.showScreen('screen-game');
        this.renderGameUI();
       
        // Cas spécifique Star Realms qui a besoin de re-rendu spécial
        if (this.state.game === 'starrealms') {
            starRealmsGame.render(document.getElementById('game-container'));
        }
    },

    clearSave: function() {
        localStorage.removeItem('sb_save');
        this.state.history = []; // On vide l'historique aussi
    },

    // --- GESTION HISTORIQUE (UNDO) ---
    createCheckpoint: function() {
        // On pousse une COPIE de l'état actuel dans l'historique
        // JSON.stringify permet de casser les références (Deep Copy)
        this.state.history.push(JSON.stringify(this.state));
       
        // Limite l'historique à 10 coups en arrière pour ne pas surcharger la mémoire
        if (this.state.history.length > 10) this.state.history.shift();
    },

    undoLastRound: function() {
        if (this.state.history.length === 0) return alert("Impossible de revenir plus loin !");
       
        if (!confirm("Revenir à la manche précédente ?")) return;

        // On récupère le dernier état
        const previousJson = this.state.history.pop();
        const previousState = JSON.parse(previousJson);
       
        // On restaure l'état (sauf l'historique lui-même qu'on vient de modifier)
        const currentHistory = this.state.history;
        this.state = previousState;
        this.state.history = currentHistory;

        this.saveGame(); // On sauvegarde le retour en arrière
        this.renderGameUI();
       
        // Si c'est Star Realms, on force le render spécifique
        if (this.state.game === 'starrealms') {
            starRealmsGame.render(document.getElementById('game-container'));
        }
    },

    // --- NAVIGATION ---
    selectSkMode: function(btn, mode) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('input-sk-mode').value = mode;
    },

    goToSetup: function(type) {
        this.clearSave(); // Nouvelle partie = on efface la sauvegarde précédente
       
        this.state.game = type;
        this.state.round = 1;
        this.state.dealerIdx = 0;
        this.state.history = [];
       
        // Changement Fond
        document.body.className = '';
        document.body.classList.add('bg-' + type);

        // ... Code existant des inputs (copiez votre ancien goToSetup ici pour abréger,
        // ou demandez-moi si vous voulez le bloc entier, mais c'est surtout le début qui change) ...
       
        const title = document.getElementById('setup-title');
        const btn = document.getElementById('btn-start');
        const info = document.getElementById('setup-info');
        const standardArea = document.getElementById('setup-standard');
        const skArea = document.getElementById('setup-skullking');
        const beloteArea = document.getElementById('setup-belote');
       
        info.classList.add('hidden');
        standardArea.classList.remove('hidden');
        beloteArea.classList.add('hidden');
        skArea.classList.add('hidden');
        btn.innerText = "Lancer la partie";

        if (type === 'skullking') {
            title.innerText = "💀 Skull King"; btn.className = "btn btn-sk"; this.state.maxRounds = 10;
            skArea.classList.remove('hidden');
        }
        else if (type === 'papayoo') {
            title.innerText = "🎲 Papayoo"; btn.className = "btn btn-pap"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        else if (type === 'tarot') {
            title.innerText = "🔮 Tarot"; btn.className = "btn btn-tarot"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        else if (type === 'belote') {
            title.innerText = "♣️ Belote & Coinche"; btn.className = "btn btn-belote"; this.state.maxRounds = 999;
            standardArea.classList.add('hidden');
            beloteArea.classList.remove('hidden');
        }
        else if (type === 'skyjo') {
            title.innerText = "🃏 Skyjo"; btn.className = "btn btn-skyjo"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        else if (type === 'rami') {
            title.innerText = "🃏 Rami"; btn.className = "btn btn-rami"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        else if (type === 'six') {
            title.innerText = "🐮 6 qui prend"; btn.className = "btn btn-six"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        else if (type === 'dice') {
            title.innerText = "🎲 Lanceur de dés";
            btn.className = "btn btn-dice";
            btn.innerText = "Accéder aux dés";
            standardArea.classList.add('hidden');
            beloteArea.classList.add('hidden');
            skArea.classList.add('hidden');
        }
        else if (type === 'starrealms') {
            title.innerText = "🚀 Star Realms"; btn.className = "btn btn-sr"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
       
        this.showScreen('screen-setup');
    },
   
    // ... Gardez updateSetupInfo et selectBeloteMode ...
    updateSetupInfo: function() {
        const nb = document.getElementById('input-players').value.split(',').filter(n=>n.trim()).length;
        const info = document.getElementById('setup-info');
        if (this.RULES[this.state.game] && this.RULES[this.state.game][nb]) {
             info.classList.remove('hidden');
             info.innerText = this.RULES[this.state.game][nb];
        } else if (this.RULES[this.state.game] && this.RULES[this.state.game][2]) {
            info.classList.remove('hidden'); info.innerText = this.RULES[this.state.game][2];
        } else {
            info.classList.add('hidden');
        }
    },
    selectBeloteMode: function(btn, mode) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('input-belote-mode').value = mode;
    },

    startGame: function() {
        // ... (Copiez votre startGame existant) ...
        if (this.state.game === 'dice') {
            this.state.players = [];
            this.showScreen('screen-game');
            this.renderGameUI();
            return;
        }

        let names = [];
        if (this.state.game === 'belote') {
            const t1 = document.getElementById('input-team1').value.trim() || "Nous";
            const t2 = document.getElementById('input-team2').value.trim() || "Eux";
            names = [t1, t2];
            const mode = document.getElementById('input-belote-mode').value;
            this.state.beloteMode = mode;
            this.state.targetScore = (mode === 'classique') ? 1000 : 2000;
        } else {
            names = document.getElementById('input-players').value.split(',').map(n=>n.trim()).filter(n=>n);
        }

        if (this.state.game === 'skullking') {
            this.state.skMode = document.getElementById('input-sk-mode').value;
        }

        if (!names.length) return alert("Il faut des joueurs !");
       
        // Initialisation complète des joueurs avec toutes les propriétés possibles
        this.state.players = names.map(n => ({
            name: n, score: 0,
            bet:0, made:0,
            betType: 'chevrotine',
            bonusSir:0, bonusPir:0, bonusSK:0, bonus14Std:0, bonus14Black:0,
            bonusLoot: 0, bonusRascalBet: 0
        }));
       
        // INIT STAR REALMS PV
        if (this.state.game === 'starrealms') {
            this.state.players.forEach(p => p.score = 50);
        }

        this.showScreen('screen-game');
        this.saveGame(); // PREMIÈRE SAUVEGARDE
        this.renderGameUI();
    },

    renderGameUI: function() {
        const gName = (this.state.game === 'skullking') ? "Skull King" :
                      (this.state.game === 'papayoo') ? "Papayoo" :
                      (this.state.game === 'tarot') ? "Tarot" :
                      (this.state.game === 'belote') ? "Belote" :
                      (this.state.game === 'skyjo') ? "Skyjo" :
                      (this.state.game === 'rami') ? "Rami" :
                      (this.state.game === 'six') ? "6 qui prend" :
                      (this.state.game === 'starrealms') ? "Star Realms" : "Dés";

        // Bouton Undo (Nouveau)
        const undoHtml = (this.state.history.length > 0)
            ? `<button onclick="app.undoLastRound()" style="background:none; border:none; color:#aaa; font-size:1.2rem; cursor:pointer; margin-left:10px;">↩️</button>`
            : '';

        document.getElementById('game-name').innerHTML = gName + undoHtml;
        document.getElementById('round-num').innerText = (this.state.game === 'dice' || this.state.game === 'starrealms') ? '' : `(M${this.state.round})`;
       
        const dealerBanner = document.getElementById('dealer-banner');
        if (this.state.game === 'tarot' || this.state.game === 'dice' || this.state.game === 'belote' || this.state.game === 'starrealms') {
            dealerBanner.classList.add('hidden');
        } else {
            dealerBanner.classList.remove('hidden');
            if(this.state.players.length > 0) {
                document.getElementById('dealer-name').innerText = this.state.players[this.state.dealerIdx].name;
            }
        }

        const container = document.getElementById('game-container');
        container.innerHTML = '';
        document.getElementById('game-total-banner').classList.add('hidden');

        if (this.state.game === 'skullking') skullKingGame.render(container);
        else if (this.state.game === 'papayoo') papayooGame.render(container);
        else if (this.state.game === 'tarot') tarotGame.render(container);
        else if (this.state.game === 'belote') beloteGame.render(container);
        else if (this.state.game === 'skyjo') skyjoGame.render(container);
        else if (this.state.game === 'rami') ramiGame.render(container);
        else if (this.state.game === 'six') sixGame.render(container);
        else if (this.state.game === 'dice') diceGame.render(container);
        else if (this.state.game === 'starrealms') starRealmsGame.render(container);
    },

    nextRound: function() {
        this.state.round++;
        this.state.dealerIdx = (this.state.dealerIdx + 1) % this.state.players.length;
       
        this.saveGame(); // SAUVEGARDE NOUVELLE MANCHE
       
        this.renderGameUI();
        window.scrollTo(0,0);
    },

    finishGame: function() {
        this.clearSave(); // Partie finie = on vide la mémoire
       
        this.showScreen('screen-results');
        const tbody = document.getElementById('results-body'); tbody.innerHTML = '';
       
        const highScoreWins = ['skullking', 'tarot', 'belote', 'starrealms'];
        const isDesc = highScoreWins.includes(this.state.game);
       
        this.state.players.sort((a, b) => isDesc ? b.score - a.score : a.score - b.score);
       
        this.state.players.forEach((p, i) => {
            let style = (i===0) ? 'rank-1' : '';
            let icon = (i===0) ? '🏆 ' : (i===1 ? '🥈 ' : (i===2 ? '🥉 ' : ''));
            tbody.innerHTML += `<tr><td class="${style}">${icon}${p.name}</td><td style="text-align:right;font-weight:bold;">${p.score}</td></tr>`;
        });
       
        // Confetti logic...
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff0000', '#00ff00', '#0000ff'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff0000', '#00ff00', '#0000ff'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    },

    showScreen: function(id) {
        document.querySelectorAll('body > div').forEach(d => {
             if(d.id.startsWith('screen-')) d.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    }
};

// Lancement au chargement de la page
window.onload = function() {
    app.init();
};
