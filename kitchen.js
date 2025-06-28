import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);
const container = document.getElementById("kitchen-orders");

function renderOrders(snapshot) {
  container.innerHTML = "";

  const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (orders.length === 0) {
    container.innerHTML = "<p>No orders in queue.</p>";
    return;
  }

  orders.forEach((order, index) => {
    const div = document.createElement("div");
    div.className = "order-card";

    const itemsHtml = `
      <table>
        <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
        ${order.items.map(item => `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`).join('')}
      </table>
    `;

    div.innerHTML = `
      <h3>Order #${index + 1}</h3>
      <p><strong>Customer:</strong> ${order.name}</p>
      <p><strong>Phone:</strong> ${order.phone}</p>
      ${itemsHtml}
      <p class="total">Total: $${order.total.toFixed(2)}</p>
      <p>Status: ${order.status}</p>
      ${order.status !== "Ready for Pickup" ? `<button data-id="${order.id}" class="mark-complete">Mark as Ready</button>` : ""}
    `;

    container.appendChild(div);
  });

  // Add listeners for mark-complete buttons
  container.querySelectorAll(".mark-complete").forEach(btn => {
    btn.addEventListener("click", async () => {
      const orderId = btn.dataset.id;
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: "Ready for Pickup"
      });
    });
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

  onSnapshot(q, (snapshot) => {
    renderOrders(snapshot);
  });
});
