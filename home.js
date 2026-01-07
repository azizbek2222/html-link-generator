import { getUserBalance } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const balanceEl = document.getElementById('balance');
    
    try {
        const currentBalance = await getUserBalance();
        balanceEl.innerText = currentBalance.toFixed(6);
    } catch (error) {
        console.error("Balansni yuklashda xato:", error);
    }
});
