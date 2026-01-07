import { getUserBalance } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const balanceEl = document.getElementById('balance');
    
    try {
        const currentBalance = await getUserBalance();
        // NaN tekshiruvi
        if (currentBalance === null || isNaN(currentBalance)) {
            balanceEl.innerText = "0.000000";
        } else {
            balanceEl.innerText = parseFloat(currentBalance).toFixed(6);
        }
    } catch (error) {
        console.error("Xato:", error);
        balanceEl.innerText = "0.000000";
    }
});
