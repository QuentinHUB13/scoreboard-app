const app = {
    state: {
        game: null,
        players: [],
        round: 1,
        dealerIdx: 0,
        maxRounds: 10,
        beloteMode: 'classique',
        targetScore: 1000
    },

    RULES: {
        papayoo: { 3: "6x3 + 1x2 (Écart 5)", 4: "5x3 (Écart 5)", 5: "4x3 (Écart 4)", 6: "3x3 + 1x2 (Écart 3)", 7: "⚠️ Sans As 2x3 + 1x2 (Écart 3)", 8: "⚠️ Sans As 2x3 + 1x1 (Écart 3)" },
        tarot: { 3: "1 vs 2", 4: "1 vs 3", 5: "Appel au Roi (1+1 vs 3)" },
        belote: { 2: "Entrez les noms des 2 équipes", 4: "Entrez les 4 joueurs (Equipe 1 vs Equipe 2)" },
        skyjo: { 2: "Le but est d'avoir le moins de points. Fin à 100 pts." },
        rami: { 2: "Le moins de points possible." },
        six: { 2: "Attention aux têtes de bœufs ! Fin à 66 pts." },
        starrealms: { 2: "Combat Spatial. Départ 50 PV. Le dernier survivant gagne." },
    },

    selectSkMode: function(btn, mode) {
        const parent = btn.parentElement;
        parent.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('input-sk-mode').value = mode;
    },

    goToSetup: function(type) {
        this.state.game = type;
        this.state.round = 1;
        this.state.dealerIdx = 0;
       
        // 1. CHANGEMENT DYNAMIQUE DU FOND
        // On retire toutes les anciennes classes bg-
        document.body.className = ''; 
        // On ajoute la nouvelle classe
        document.body.classList.add('bg-' + type);

        const title = document.getElementById('setup-title');
        const btn = document.getElementById('btn-start');
        const info = document.getElementById('setup-info');
       
        // Zones d'inputs
        const standardArea = document.getElementById('setup-standard');
        const skArea = document.getElementById('setup-skullking');
        const beloteArea = document.getElementById('setup-belote');
       
        // Reset visuel par défaut
        info.classList.add('hidden');
        standardArea.classList.remove('hidden');
        beloteArea.classList.add('hidden');
        skArea.classList.add('hidden');
        btn.innerText = "Lancer la partie"; // Reset texte bouton

        // Configuration selon le jeu
        if (type === 'skullking') {
            title.innerText = "💀 Skull King"; btn.className = "btn btn-sk"; this.state.maxRounds = 10;
            skArea.classList.remove('hidden'); // On affiche les options SK
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
        else if (type === 'starrealms') {
            title.innerText = "🚀 Star Realms"; btn.className = "btn btn-sr"; this.state.maxRounds = 999;
            this.updateSetupInfo();
        }
        // --- LE CAS SPÉCIAL DÉS ---
        else if (type === 'dice') {
            title.innerText = "🎲 Lanceur de dés";
            btn.className = "btn btn-dice";
            btn.innerText = "Accéder aux dés"; // Texte spécifique
           
            // On cache TOUS les inputs de joueurs
            standardArea.classList.add('hidden');
            beloteArea.classList.add('hidden');
            skArea.classList.add('hidden');
        }
       
        this.showScreen('screen-setup');
    },

    updateSetupInfo: function() {
        const nb = document.getElementById('input-players').value.split(',').filter(n=>n.trim()).length;
        const info = document.getElementById('setup-info');
        // Vérifie si une règle existe pour ce jeu et ce nombre de joueurs
        if (this.RULES[this.state.game] && this.RULES[this.state.game][nb]) {
             info.classList.remove('hidden');
             info.innerText = this.RULES[this.state.game][nb];
        }
        else if (this.RULES[this.state.game] && this.RULES[this.state.game][2]) {
            // Règle générique (ex: Skyjo)
            info.classList.remove('hidden');
            info.innerText = this.RULES[this.state.game][2];
        }
        else {
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
        // --- 1. CAS SPÉCIAL DÉS (Bypass Joueurs) ---
        if (this.state.game === 'dice') {
            this.state.players = [];
            this.showScreen('screen-game'); // On force le passage à l'écran jeu
            this.renderGameUI(); // On dessine l'interface des dés
            return; // On s'arrête là
        }

        // --- 2. JEUX NORMAUX ---
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
            this.state.skMode = document.getElementById('input-sk-mode').value; // 'classic' ou 'rascal'
        } 

        if (!names.length) return alert("Il faut des joueurs !");
       
        this.state.players = names.map(n => ({
            name: n, score: 0,
            bet:0, made:0,
            betType: 'chevrotine',
            // Anciens Bonus
            bonusSir:0, bonusPir:0, bonusSK:0, bonus14Std:0, bonus14Black:0,
            // Nouveaux Bonus (Extension)
            bonusLoot: 0,      // Trésor (0 à 2)
            bonusRascalBet: 0  // Pari Rascal (-20 à 20)
        }));

        if (this.state.game === 'starrealms') {
            this.state.players.forEach(p => p.score = 50);
        }

        this.showScreen('screen-game');
        this.renderGameUI();
    },

    renderGameUI: function() {
        // Titres et Infos
        const gName = (this.state.game === 'skullking') ? "Skull King" :
                      (this.state.game === 'papayoo') ? "Papayoo" :
                      (this.state.game === 'tarot') ? "Tarot" :
                      (this.state.game === 'belote') ? "Belote" :
                      (this.state.game === 'skyjo') ? "Skyjo" :
                      (this.state.game === 'rami') ? "Rami" :
                      (this.state.game === 'six') ? "6 qui prend" : 
                      (this.state.game === 'starrealms') ? "Star Realms" : "Dés";

        document.getElementById('game-name').innerText = gName;
        document.getElementById('round-num').innerText = (this.state.game === 'dice') ? '' : `(M${this.state.round})`;
       
        // Gestion Donneur
        const dealerBanner = document.getElementById('dealer-banner');
        // On cache le donneur pour Tarot, Dés, Belote ET Star Realms
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

        // --- AIGUILLAGE VERS LES FICHIERS SPÉCIFIQUES ---
        if (this.state.game === 'skullking') skullKingGame.render(container);
        else if (this.state.game === 'papayoo') papayooGame.render(container);
        else if (this.state.game === 'tarot') tarotGame.render(container);
        else if (this.state.game === 'belote') beloteGame.render(container);
        else if (this.state.game === 'skyjo') skyjoGame.render(container);
        else if (this.state.game === 'rami') ramiGame.render(container);
        else if (this.state.game === 'six') sixGame.render(container);
        else if (this.state.game === 'starrealms') starRealmsGame.render(container);
       
        // --- LE FIX EST ICI : ---
        else if (this.state.game === 'dice') diceGame.render(container);
    },

    nextRound: function() {
        this.state.round++;
        this.state.dealerIdx = (this.state.dealerIdx + 1) % this.state.players.length;
        this.renderGameUI();
        window.scrollTo(0,0);
    },

    finishGame: function() {
        this.showScreen('screen-results');
        const tbody = document.getElementById('results-body'); tbody.innerHTML = '';
       
        // Liste des jeux où le PLUS GROS score gagne
        const highScoreWins = ['skullking', 'tarot', 'belote', 'starrealms'];
        const isDesc = highScoreWins.includes(this.state.game);
       
        this.state.players.sort((a, b) => isDesc ? b.score - a.score : a.score - b.score);
       
        this.state.players.forEach((p, i) => {
            let style = (i===0) ? 'rank-1' : '';
            let icon = (i===0) ? '🏆 ' : (i===1 ? '🥈 ' : (i===2 ? '🥉 ' : ''));
            tbody.innerHTML += `<tr><td class="${style}">${icon}${p.name}</td><td style="text-align:right;font-weight:bold;">${p.score}</td></tr>`;
        });

        // 2. EFFET CONFETTI (Le "Juice")
        // Lance une explosion de confettis depuis le bas de l'écran
        const duration = 3000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#ff0000', '#00ff00', '#0000ff'] // Couleurs festives
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#ff0000', '#00ff00', '#0000ff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
        
        // Reset du fond d'écran (optionnel, ou on le garde pour le style)
        // document.body.className = ''; 
    },

    showScreen: function(id) {
        document.querySelectorAll('body > div').forEach(d => {
             if(d.id.startsWith('screen-')) d.classList.add('hidden');
        });
        document.getElementById(id).classList.remove('hidden');
    }
};

// --- EFFET HAPTIQUE GLOBAL ---
// Dès qu'on clique sur un bouton, le téléphone vibre très légèrement (5ms)
document.addEventListener('click', function(e) {
    // Si l'élément cliqué est un bouton ou à l'intérieur d'un bouton
    if (e.target.closest('button')) {
        if (navigator.vibrate) {
            navigator.vibrate(10); // Vibration ultra-courte (10ms)
        }
    }
});
