import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyA7VLHdjPqf_tobSiBczGbN8H7YlFwq9Wg",
    authDomain: "magnetic-alloy-467611-u7.firebaseapp.com",
    databaseURL: "https://magnetic-alloy-467611-u7-default-rtdb.firebaseio.com",
    projectId: "magnetic-alloy-467611-u7",
    storageBucket: "magnetic-alloy-467611-u7.firebasestorage.app",
    messagingSenderId: "589500919880",
    appId: "1:589500919880:web:3bb0beedf38b373951687d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tg = window.Telegram?.WebApp;
const userId = tg?.initDataUnsafe?.user?.id || "test_user";

const multiplierEl = document.getElementById('multiplier');
const rocketEl = document.getElementById('rocket');
const statusEl = document.getElementById('game-status');
const cashoutBtn = document.getElementById('cashout-btn');
const potentialWinEl = document.getElementById('potential-win');
const balanceEl = document.getElementById('user-balance');
const displayArea = document.getElementById('display-area');

let gameState = "waiting";
let currentMultiplier = 1.00;
let hasCashedOut = false;

onValue(ref(db, `users/${userId}/balance`), (snap) => {
    balanceEl.innerText = (snap.val() || 0).toFixed(6);
});

const gameRef = ref(db, 'crash_game');

onValue(gameRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    currentMultiplier = data.multiplier;
    gameState = data.state;
    updateUI();
});

function updateUI() {
    if (gameState === "flying") {
        displayArea.classList.add('flying');
        multiplierEl.innerText = currentMultiplier.toFixed(2) + "x";
        multiplierEl.style.color = "#ffffff";
        statusEl.innerText = "RAKETA PARVOZDA...";
        statusEl.style.color = "#38bdf8";
        
        // Raketa miqyosi o'sadi
        const scale = 1 + (currentMultiplier - 1) * 0.1;
        rocketEl.style.transform = `scale(${Math.min(scale, 2)}) rotate(-45deg)`;
        
        if (!hasCashedOut) {
            cashoutBtn.style.display = 'block';
            potentialWinEl.innerText = (currentMultiplier * 0.00001).toFixed(6);
        }
    } 
    else if (gameState === "crashed") {
        displayArea.classList.remove('flying');
        multiplierEl.style.color = "#ef4444";
        statusEl.innerText = "PORTLADI! (" + currentMultiplier.toFixed(2) + "x)";
        statusEl.style.color = "#ef4444";
        cashoutBtn.style.display = 'none';
        rocketEl.style.transform = "scale(0) rotate(-45deg)";
        hasCashedOut = false;
    } 
    else if (gameState === "waiting") {
        displayArea.classList.remove('flying');
        multiplierEl.innerText = "1.00x";
        multiplierEl.style.color = "#64748b";
        statusEl.innerText = "TAYYORGARLIK...";
        statusEl.style.color = "#94a3b8";
        cashoutBtn.style.display = 'none';
        rocketEl.style.transform = "scale(1) rotate(-45deg)";
    }
}

cashoutBtn.addEventListener('click', async () => {
    if (gameState !== "flying" || hasCashedOut) return;

    hasCashedOut = true;
    const winAmount = currentMultiplier * 0.00001;
    
    const userRef = ref(db, `users/${userId}`);
    const snap = await get(userRef);
    const currentBalance = snap.exists() ? (snap.val().balance || 0) : 0;
    
    await update(userRef, { balance: Number((currentBalance + winAmount).toFixed(6)) });
    
    cashoutBtn.style.display = 'none';
    statusEl.innerText = `YUTUQ OLINDI! +${winAmount.toFixed(6)}`;
    statusEl.style.color = "#10b981";
});

// Admin Loop
setInterval(async () => {
    const snap = await get(gameRef);
    const data = snap.val();

    if (!data || data.lastUpdate < Date.now() - 2000) {
        if (!data || data.state === "crashed") {
            set(gameRef, { state: "waiting", multiplier: 1.00, lastUpdate: Date.now() });
            setTimeout(() => set(gameRef, { 
                state: "flying", 
                multiplier: 1.00, 
                lastUpdate: Date.now(), 
                crashAt: (Math.random() * 3.5 + 1.1).toFixed(2) 
            }), 3000);
        } else if (data.state === "flying") {
            const newMultiplier = data.multiplier + 0.07;
            if (newMultiplier >= parseFloat(data.crashAt)) {
                set(gameRef, { state: "crashed", multiplier: data.multiplier, lastUpdate: Date.now() });
            } else {
                update(gameRef, { multiplier: newMultiplier, lastUpdate: Date.now() });
            }
        }
    }
}, 150);

if (tg) { tg.expand(); tg.ready(); }