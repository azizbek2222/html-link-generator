import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const tgUserId = tg?.initDataUnsafe?.user?.id || "test_user";

const balanceText = document.getElementById('user-balance');
const minesGrid = document.getElementById('mines-grid');
const startGameBtn = document.getElementById('start-game-btn');
const restartGameBtn = document.getElementById('restart-game-btn');
const cashoutBtn = document.getElementById('cashout-btn');
const gameStatus = document.getElementById('game-status');

const GRID_SIZE = 5;
const NUM_MINES = 5; // 5 ta mina
const PRIZE_PER_CLICK = 0.00001;

let board = [];
let gameStarted = false;
let gameOver = false;
let currentSessionWin = 0; // Bu sessiyadagi yutuq

// Balansni kuzatish
const balanceRef = ref(db, `users/${tgUserId}/balance`);
onValue(balanceRef, (snap) => {
    const val = snap.val() || 0;
    if (balanceText) balanceText.innerText = parseFloat(val).toFixed(6);
});

function startGame() {
    board = Array(GRID_SIZE * GRID_SIZE).fill(false);
    let placedMines = 0;
    while (placedMines < NUM_MINES) {
        let index = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
        if (!board[index]) {
            board[index] = true;
            placedMines++;
        }
    }

    minesGrid.innerHTML = '';
    currentSessionWin = 0;
    gameStarted = true;
    gameOver = false;
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.classList.add('mine-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i, cell));
        minesGrid.appendChild(cell);
    }

    gameStatus.innerText = "Ehtiyot bo'ling, 5 ta mina bor!";
    startGameBtn.style.display = 'none';
    restartGameBtn.style.display = 'none';
    cashoutBtn.style.display = 'none';
}

async function handleCellClick(index, element) {
    if (!gameStarted || gameOver || element.classList.contains('opened')) return;

    if (board[index]) {
        // Mina bosildi
        gameOver = true;
        element.classList.add('mine');
        element.innerHTML = '💣';
        gameStatus.innerText = "Portladingiz! Yutuqlar bekor qilindi.";
        revealMines();
        cashoutBtn.style.display = 'none';
        restartGameBtn.style.display = 'block';
    } else {
        // Xavfsiz
        element.classList.add('opened');
        element.innerHTML = '💎';
        currentSessionWin += PRIZE_PER_CLICK;
        gameStatus.innerText = `Yutuq: ${currentSessionWin.toFixed(6)} USDT`;
        cashoutBtn.style.display = 'block';
        cashoutBtn.innerText = `💰 Cash Out (${currentSessionWin.toFixed(6)})`;
    }
}

async function cashOut() {
    if (!gameStarted || gameOver || currentSessionWin <= 0) return;

    gameOver = true;
    gameStatus.innerText = `Tabriklaymiz! ${currentSessionWin.toFixed(6)} USDT balansga qo'shildi.`;
    
    const userRef = ref(db, `users/${tgUserId}`);
    const snap = await get(userRef);
    let currentBalance = snap.exists() ? (parseFloat(snap.val().balance) || 0) : 0;
    
    await update(userRef, { balance: Number((currentBalance + currentSessionWin).toFixed(6)) });
    
    revealMines();
    cashoutBtn.style.display = 'none';
    restartGameBtn.style.display = 'block';
}

function revealMines() {
    const cells = document.querySelectorAll('.mine-cell');
    board.forEach((isMine, i) => {
        if (isMine) {
            cells[i].classList.add('mine');
            cells[i].innerHTML = '💣';
        }
    });
}

startGameBtn.addEventListener('click', startGame);
restartGameBtn.addEventListener('click', startGame);
cashoutBtn.addEventListener('click', cashOut);

if (tg) { tg.expand(); tg.ready(); }