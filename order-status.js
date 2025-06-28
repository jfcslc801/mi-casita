import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);
const orderList = document.getElementById("order-status");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, where("userId", "==", userId), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    orderList.innerHTML = "";
    if (snapshot.empty) {
      orderList.innerHTML = "<p>No orders found.</p>";
      return;
    }

    snapshot.forEach((doc) => {
      const order = doc.data();
      const div = document.createElement("div");
      div.className = "order-card";

      const itemsHtml = order.items
        .map(
          (item) =>
            `<li>${item.quantity} x ${item.name} - $${(
              item.quantity * item.price
            ).toFixed(2)}</li>`
        )
        .join("");

      div.innerHTML = `
        <h3>Status: ${order.status}</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        <p><em>Time: ${new Date(
          order.timestamp.seconds * 1000
        ).toLocaleString()}</em></p>
      `;

      orderList.appendChild(div);
    });
  });
});
