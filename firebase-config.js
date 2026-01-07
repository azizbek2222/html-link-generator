import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7VLHdjPqf_tobSiBczGbN8H7YlFwq9Wg",
  authDomain: "magnetic-alloy-467611-u7.firebaseapp.com",
  databaseURL: "https://magnetic-alloy-467611-u7-default-rtdb.firebaseio.com",
  projectId: "magnetic-alloy-467611-u7",
  storageBucket: "magnetic-alloy-467611-u7.firebasestorage.app",
  messagingSenderId: "589500919880",
  appId: "1:589500919880:web:e5dd41c0fba58c3851687d"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Telegram WebApp foydalanuvchisini olish
const tg = window.Telegram.WebApp;
tg.expand(); // Ilovani to'liq ekranga yoyish
const userId = tg.initDataUnsafe?.user?.id || "local_test_user";

export async function getUserBalance() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        return parseFloat(snapshot.val().balance);
    } else {
        const initialBalance = 0.00;
        await set(userRef, {
            id: userId,
            balance: initialBalance,
            username: tg.initDataUnsafe?.user?.username || "unknown"
        });
        return initialBalance;
    }
}

export async function updateBalanceInDB(newBalance) {
    const userRef = ref(db, 'users/' + userId);
    await update(userRef, { balance: parseFloat(newBalance) });
}
