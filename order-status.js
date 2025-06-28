import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';

document.addEventListener("DOMContentLoaded", () => {
  const nameEl = document.getElementById("customer-name");
  const totalEl = document.getElementById("order-total");
  const container = document.getElementById("orders-container");
  const adminNav = document.getElementById("admin-nav");

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const isAdmin = ["+18013474922", "+18012323880"].includes(user.phoneNumber);
    if (isAdmin && adminNav) adminNav.style.display = "block";

    try {
      nameEl.textContent = user.displayName || "Customer";

      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("phone", "==", user.phoneNumber),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        container.innerHTML = "<p>No orders found.</p>";
        return;
      }

      let unpaidTotal = 0;
      let output = "";

      snapshot.forEach(doc => {
        const order = doc.data();
        const itemList = order.items.map(item =>
          `${item.quantity} × ${item.name} ($${item.price.toFixed(2)})`
        ).join("<br>");

        if (!order.paid) unpaidTotal += order.total;

        output += `
          <div class="order-block">
            <p><strong>Customer:</strong> ${order.name || "N/A"}</p>
            <p><strong>Items:</strong><br>${itemList}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status || "Being Prepped"}</p>
            <p><strong>Paid:</strong> ${order.paid ? "✅" : "❌"}</p>
            <hr/>
          </div>
        `;
      });

      totalEl.textContent = unpaidTotal.toFixed(2);
      container.innerHTML = output;

    } catch (error) {
      console.error("Error loading orders:", error);
      container.innerHTML = "<p>Error loading your orders.</p>";
    }
  });
});
