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

    nameEl.textContent = user.displayName || "Customer";

    try {
      const ordersRef = collection(db, "orders");

      let q;
      if (isAdmin) {
        q = query(ordersRef, orderBy("timestamp", "desc"));
      } else {
        q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        container.innerHTML = "<p>No orders found.</p>";
        totalEl.textContent = "0.00";
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

        let progressPercent = 33;
        let progressColor = "#f39c12";
        if (order.status === "Ready for Pickup") {
          progressPercent = 66;
          progressColor = "#2ecc71";
        }
        if (order.paid) {
          progressPercent = 100;
          progressColor = "#3498db";
        }

        const status = (order.status || "Being Prepped").trim().toLowerCase();
        let orderClass = "";
        if (order.paid) orderClass = "paid";
        else if (status === "ready for pickup") orderClass = "highlight";
        else if (status === "being prepped") orderClass = "prepping";

        output += `
          <div class="order-block ${orderClass}">
            <p><strong>Customer:</strong> ${order.name || "N/A"}</p>
            <p><strong>Items:</strong><br>${itemList}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status || "Being Prepped"}</p>
            <p><strong>Paid:</strong> ${order.paid ? "✅" : "❌"}</p>
            <div class="progress-container">
              <div class="progress-bar" style="width: ${progressPercent}%; background-color: ${progressColor};"></div>
            </div>
            <hr/>
          </div>
        `;
      });

      totalEl.textContent = unpaidTotal.toFixed(2);
      container.innerHTML = output;

    } catch (error) {
      console.error("Error loading orders:", error.message);
      container.innerHTML = `<p>Error loading your orders: ${error.message}</p>`;
      totalEl.textContent = "0.00";
    }
  });
});
