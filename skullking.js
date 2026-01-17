const skullKingGame = {
    render: function(container) {
        // 1. Render Cards (Joueurs)
        app.state.players.forEach((p, i) => {
            container.innerHTML += this.getCardHtml(p, i);
        });

        // 2. Zone Kraken (Global pour la manche)
        const currentKraken = document.getElementById('sk-kraken-count') ? document.getElementById('sk-kraken-count').value : 0;
       
        container.innerHTML += `
        <div class="player-card" style="border-left-color: #9c27b0; margin-top:15px; background:#1a1a1a;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; color:#e1bee7;">🐙 Kraken (Plis détruits)</span>
                <div class="sk-stepper">
                    <button class="sk-btn-step" onclick="skullKingGame.updKraken(-1)">-</button>
                    <span class="sk-val" id="sk-kraken-val">${currentKraken}</span>
                    <button class="sk-btn-step" onclick="skullKingGame.updKraken(1)">+</button>
                </div>
                <input type="hidden" id="sk-kraken-count" value="${currentKraken}">
            </div>
        </div>`;

        // 3. Render Button & Banner
        const isLast = app.state.round === 10;
        const btnHtml = `<button id="btn-sk-next" class="btn btn-sk" onclick="skullKingGame.validate()">${isLast ? '🏁 Terminer' : 'Manche Suivante'}</button>`;
        document.getElementById('action-btn-container').innerHTML = btnHtml;

        // 4. Initial Check
        this.checkTotal();
    },

    getCardHtml: function(p, i) {
        // Option Rascal : Chevrotine vs Boulet
        let rascalOptions = '';
        if (app.state.skMode === 'rascal') {
            const isChev = p.betType === 'chevrotine';
            rascalOptions = `
            <div style="margin-bottom:10px; background:#333; padding:5px; border-radius:8px;">
                <div style="font-size:0.8rem; color:#aaa; margin-bottom:5px; text-align:center;">Type de Pari</div>
                <div class="tarot-segment" style="margin-bottom:0;">
                    <button class="segment-btn ${isChev?'selected':''}" onclick="skullKingGame.setBetType(${i}, 'chevrotine')" style="font-size:0.8rem;">Chevrotine</button>
                    <button class="segment-btn ${!isChev?'selected':''}" onclick="skullKingGame.setBetType(${i}, 'boulet')" style="font-size:0.8rem;">Boulet 💣</button>
                </div>
            </div>`;
        }

        // Sélecteur pour le Pari Rascal (Bonus)
        const rascalBetBonusHtml = `
        <div class="sk-control-row" style="font-size:0.9rem">
            <span>Pari Rascal</span>
            <select id="sk-bonusRascalBet-${i}" onchange="skullKingGame.updRascalBet(${i}, this.value)" style="background:#444; color:#fff; border:1px solid #666; padding:5px; border-radius:4px; width:80px; text-align:center;">
                <option value="0" ${p.bonusRascalBet===0?'selected':''}>-</option>
                <option value="10" ${p.bonusRascalBet===10?'selected':''}>+10</option>
                <option value="20" ${p.bonusRascalBet===20?'selected':''}>+20</option>
                <option value="-10" ${p.bonusRascalBet===-10?'selected':''}>-10</option>
                <option value="-20" ${p.bonusRascalBet===-20?'selected':''}>-20</option>
            </select>
        </div>`;

        return `
        <div class="player-card" style="border-left-color: var(--primary)">
            <div class="player-header"><span>${p.name}</span><span>${p.score} pts</span></div>
           
            ${rascalOptions}

            <div class="sk-control-row"><span style="color:#aaa">Pari</span>
                <div class="sk-stepper"><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'bet',-1)">-</button><span class="sk-val" id="sk-bet-${i}">${p.bet}</span><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'bet',1)">+</button></div>
            </div>
            <div class="sk-control-row"><span style="color:#aaa">Plis Faits</span>
                <div class="sk-stepper"><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'made',-1)">-</button><span class="sk-val" id="sk-made-${i}">${p.made}</span><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'made',1)">+</button></div>
            </div>
           
            <button onclick="document.getElementById('bonus-${i}').classList.toggle('hidden')" style="background:none; border:1px dashed #555; color:#aaa; width:100%; padding:5px; margin-top:5px;">Bonus & Trésor 🔽</button>
            <div id="bonus-${i}" class="hidden" style="background:#252525; padding:5px; margin-top:5px;">
                ${this.bonusHtml(i, 'Trésor (20)', 'bonusLoot', p.bonusLoot)}
                ${rascalBetBonusHtml}
                <hr style="border:0; border-top:1px solid #444; margin:5px 0;">
                ${this.bonusHtml(i, 'Sirène (20)', 'bonusSir', p.bonusSir)}
                ${this.bonusHtml(i, 'Pirate (30)', 'bonusPir', p.bonusPir)}
                ${this.bonusHtml(i, 'King (50)', 'bonusSK', p.bonusSK)}
                ${this.bonusHtml(i, '14 (10)', 'bonus14Std', p.bonus14Std)}
                ${this.bonusHtml(i, '14 Noir (20)', 'bonus14Black', p.bonus14Black)}
            </div>
        </div>`;
    },

    bonusHtml: function(i, lbl, field, val) {
        return `<div class="sk-control-row" style="font-size:0.9rem"><span>${lbl}</span><div class="sk-stepper" style="transform:scale(0.9)"><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'${field}',-1)">-</button><span class="sk-val" id="sk-${field}-${i}">${val}</span><button class="sk-btn-step" onclick="skullKingGame.upd(${i},'${field}',1)">+</button></div></div>`;
    },

    setBetType: function(idx, type) {
        app.state.players[idx].betType = type;
        const container = document.getElementById('game-container');
        container.innerHTML = '';
        this.render(container);
    },

    // --- FONCTIONS UTILITAIRES (Nécessaires pour les boutons) ---

    upd: function(i, fld, d) {
        const p = app.state.players[i];
        let nv = p[fld] + d;
       
        if(nv < 0) return;
        if((fld==='bet'||fld==='made') && nv > app.state.round) return;
        if((fld==='bonusSK'||fld==='bonus14Black') && nv > 1) return;
        if(fld==='bonusSir' && nv > 2) return;
        if(fld==='bonusPir' && nv > 6) return;
        if(fld==='bonusLoot' && nv > 2) return;

        p[fld] = nv;
        document.getElementById(`sk-${fld}-${i}`).innerText = nv;
       
        if (fld === 'made') this.checkTotal();
    },

    updKraken: function(d) {
        const input = document.getElementById('sk-kraken-count');
        const disp = document.getElementById('sk-kraken-val');
        let v = parseInt(input.value) + d;
        if (v < 0) v = 0;
        if (v > app.state.round) v = app.state.round;
        input.value = v;
        disp.innerText = v;
        this.checkTotal();
    },

    updRascalBet: function(idx, val) {
        app.state.players[idx].bonusRascalBet = parseInt(val);
    },

    checkTotal: function() {
        let totalMade = 0;
        app.state.players.forEach(p => totalMade += p.made);
       
        const krakenCount = document.getElementById('sk-kraken-count') ? parseInt(document.getElementById('sk-kraken-count').value) : 0;
        const target = app.state.round - krakenCount;

        const banner = document.getElementById('game-total-banner');
        banner.classList.remove('hidden');
       
        let txt = `Plis : ${totalMade} / ${target}`;
        if (krakenCount > 0) txt += ` (🐙-${krakenCount})`;
       
        document.getElementById('banner-text').innerText = txt;
       
        const btn = document.getElementById('btn-sk-next');
        if (btn) {
            if (totalMade === target) {
                banner.className = "total-banner sum-ok";
                btn.disabled = false;
                btn.style.opacity = "1";
            } else {
                banner.className = "total-banner sum-bad";
                btn.disabled = true;
                btn.style.opacity = "0.5";
            }
        }
    },

    // --- VALIDATION ET CALCULS ---

    validate: function() {
        // 1. CHECKPOINT
        app.createCheckpoint();
        const mode = app.state.skMode;
        const round = app.state.round;

        app.state.players.forEach(p => {
            let pts = 0;
            // Calcul Bonus Total
            let bTotal = (p.bonusSir*20)+(p.bonusPir*30)+(p.bonusSK*50)+(p.bonus14Std*10)+(p.bonus14Black*20);
            bTotal += (p.bonusLoot * 20);
            bTotal += p.bonusRascalBet;

            // --- MODE RASCAL ---
            if (mode === 'rascal') {
                const type = p.betType;
               
                if (type === 'boulet') {
                    if (p.made === p.bet) {
                        pts = (15 * round) + bTotal;
                    } else {
                        pts = 0; // Boulet raté = 0 (perte des bonus aussi)
                    }
                }
                else { // Chevrotine
                    const diff = Math.abs(p.made - p.bet);
                   
                    if (diff === 0) {
                        pts = (10 * round) + bTotal;
                    }
                    else if (diff === 1) {
                        // Tolérance 1 : Moitié des points ET Moitié des bonus
                        pts = (5 * round) + (bTotal / 2);
                    }
                    else {
                        pts = 0;
                    }
                }
            }
           
            // --- MODE CLASSIQUE ---
            else {
                if (p.bet === 0) {
                    pts = (p.made === 0) ? (round * 10) : (round * -10);
                    // MODIF : On ajoute les bonus même si le pari 0 est raté
                    pts += bTotal;
                } else {
                    if (p.bet === p.made) {
                        pts = (p.bet * 20) + bTotal;
                    } else {
                        pts = Math.abs(p.bet - p.made) * -10;
                        // MODIF : On ajoute les bonus même si le pari est raté
                        pts += bTotal;
                    }
                }
            }

            p.score += pts;
           
            // Reset
            p.bet=0; p.made=0;
            p.bonusSir=0; p.bonusPir=0; p.bonusSK=0; p.bonus14Std=0; p.bonus14Black=0;
            p.bonusLoot=0; p.bonusRascalBet=0;
            p.betType = 'chevrotine';
        });

        if (app.state.round >= 10) app.finishGame();
        else app.nextRound();
    }
};
