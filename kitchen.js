import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

// Inject Admin Menu
const adminNavHTML = `
  <div id="admin-nav" style="display: none;">
    <h2>Admin Menu</h2>
    <nav>
      <a href="index.html">Order Menu</a> |
      <a href="order-status.html">Order Status</a> |
      <a href="kitchen.html">Kitchen View</a>
    </nav>
  </div>
`;
document.body.insertAdjacentHTML("afterbegin", adminNavHTML);

const container = document.getElementById("kitchen-orders");

// Load Orders Function
async function loadOrders() {
  container.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "orders"));
    const orders = [];
    const completed = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      data.id = docSnap.id;

      if (data.status === "Ready for Pickup" || data.paid) {
        completed.push(data);
      } else {
        orders.push(data);
      }
    });

    // Unpaid Orders
    if (orders.length === 0) {
      container.innerHTML = "<p>No unpaid orders in queue.</p>";
    }

    orders.forEach(order => {
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
        <h3>Order</h3>
        <p><strong>Customer:</strong> ${order.name}</p>
        <p><strong>Phone:</strong> ${order.phone}</p>
        ${itemsHtml}
        <p class="total">Total: $${order.total.toFixed(2)}</p>
        <button onclick="completeOrder('${order.id}')">Complete Order</button>
      `;

      container.appendChild(div);
    });

    // Group Unpaid Completed
    const unpaidCompleted = completed.filter(o => !o.paid);
    const groupedUnpaid = {};

    unpaidCompleted.forEach(order => {
      if (!groupedUnpaid[order.phone]) {
        groupedUnpaid[order.phone] = {
          phone: order.phone,
          name: order.name,
          items: [...order.items],
          total: order.total,
          ids: [order.id],
          latestTimestamp: order.timestamp?.seconds || 0
        };
      } else {
        groupedUnpaid[order.phone].items.push(...order.items);
        groupedUnpaid[order.phone].total += order.total;
        groupedUnpaid[order.phone].ids.push(order.id);
        if ((order.timestamp?.seconds || 0) > groupedUnpaid[order.phone].latestTimestamp) {
          groupedUnpaid[order.phone].latestTimestamp = order.timestamp?.seconds || 0;
          groupedUnpaid[order.phone].name = order.name;
        }
      }
    });

    Object.values(groupedUnpaid).forEach(group => {
      const div = document.createElement("div");
      div.className = "order-card";

      const itemMap = {};
      group.items.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { quantity: 0, price: item.price };
        }
        itemMap[item.name].quantity += item.quantity;
      });

      const itemsHtml = `
        <table>
          <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
          ${Object.entries(itemMap).map(([name, data]) => `
            <tr>
              <td>${name}</td>
              <td>${data.quantity}</td>
              <td>$${(data.quantity * data.price).toFixed(2)}</td>
            </tr>`).join('')}
        </table>
      `;

      div.innerHTML = `
        <h3>${group.name} (${group.phone})</h3>
        ${itemsHtml}
        <p class="total">Total: $${group.total.toFixed(2)}</p>
        <button onclick='markGroupAsPaid(${JSON.stringify(group.ids)})'>Mark as Paid</button>
      `;

      container.appendChild(div);
    });

    // Paid Orders
    const paidCompleted = completed.filter(o => o.paid);
    const groupedPaid = {};

    paidCompleted.forEach(order => {
      const key = `${order.phone}-${order.paidAt?.seconds || order.timestamp?.seconds}`;
      if (!groupedPaid[key]) {
        groupedPaid[key] = {
          name: order.name,
          phone: order.phone,
          items: [...order.items],
          total: order.total,
          paidAt: order.paidAt?.seconds || order.timestamp?.seconds || 0
        };
      } else {
        groupedPaid[key].items.push(...order.items);
        groupedPaid[key].total += order.total;
      }
    });

    Object.values(groupedPaid)
      .sort((a, b) => b.paidAt - a.paidAt)
      .forEach(group => {
        const div = document.createElement("div");
        div.className = "order-card paid";

        const itemMap = {};
        group.items.forEach(item => {
          if (!itemMap[item.name]) {
            itemMap[item.name] = { quantity: 0, price: item.price };
          }
          itemMap[item.name].quantity += item.quantity;
        });

        const itemsHtml = `
          <table>
            <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
            ${Object.entries(itemMap).map(([name, data]) => `
              <tr>
                <td>${name}</td>
                <td>${data.quantity}</td>
                <td>$${(data.quantity * data.price).toFixed(2)}</td>
              </tr>`).join('')}
          </table>
        `;

        div.innerHTML = `
          <h3>${group.name} (${group.phone})</h3>
          ${itemsHtml}
          <p class="total">Total: $${group.total.toFixed(2)}</p>
          <p><strong>✅ Paid</strong></p>
        `;

        container.appendChild(div);
      });

  } catch (err) {
    container.innerHTML = `<p>Error loading orders: ${err.message}</p>`;
    console.error("Error loading kitchen orders:", err);
  }
}

// ✅ Make functions global for inline button handlers
window.completeOrder = async function (id) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, {
    status: "Ready for Pickup",
    timestamp: new Date()
  });
  loadOrders();
};

window.markGroupAsPaid = async function (ids) {
  const now = new Date();
  for (const id of ids) {
    const ref = doc(db, "orders", id);
    await updateDoc(ref, {
      paid: true,
      paidAt: now
    });
  }
  loadOrders();
};

// ✅ Only run kitchen view if admin is signed in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    container.innerHTML = `<p>Access denied. Not signed in.</p>`;
    return;
  }

  const adminPhones = ["+18013474922", "+18012323880"];
  if (!adminPhones.includes(user.phoneNumber)) {
    container.innerHTML = `<p>Access denied. Admin only.</p>`;
    return;
  }

  const nav = document.getElementById("admin-nav");
  if (nav) nav.style.display = "block";

  loadOrders();
  setInterval(loadOrders, 5000);
});
