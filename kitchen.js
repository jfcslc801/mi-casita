const container = document.getElementById("kitchen-orders");

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  container.innerHTML = "";

  // Render unpaid orders
  if (orders.length === 0) {
    container.innerHTML = "<p>No unpaid orders in queue.</p>";
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
      <button onclick="completeOrder(${index})">Complete Order</button>
    `;

    container.appendChild(div);
  });

  // Divider for completed section
  if (completed.length > 0) {
    container.innerHTML += "<hr><h2>Completed Orders</h2>";
  }

  // ✅ Group completed orders by phone number
  const groupedCompleted = completed.reduce((acc, order) => {
    const phone = order.phone;
    if (!acc[phone]) {
      acc[phone] = {
        phone,
        name: order.name,
        items: [...order.items],
        total: order.total,
        paid: order.paid || false,
        paidAt: order.paidAt || null,
        latestTimestamp: order.timestamp || 0
      };
    } else {
      acc[phone].items.push(...order.items);
      acc[phone].total += order.total;
      if (order.timestamp > acc[phone].latestTimestamp) {
        acc[phone].latestTimestamp = order.timestamp;
        acc[phone].name = order.name;
      }
      if (order.paid) {
        acc[phone].paid = true;
        acc[phone].paidAt = order.paidAt || order.timestamp;
      }
    }
    return acc;
  }, {});

  // ✅ Render grouped completed orders
  Object.values(groupedCompleted).forEach(order => {
    const div = document.createElement("div");
    div.className = "order-card";

    const itemMap = {};
    order.items.forEach(item => {
      const key = item.name;
      if (!itemMap[key]) {
        itemMap[key] = { quantity: 0, price: item.price };
      }
      itemMap[key].quantity += item.quantity;
    });

    const itemsHtml = `
      <table>
        <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
        ${Object.entries(itemMap).map(([name, data]) => `
          <tr>
            <td>${name}</td>
            <td>${data.quantity}</td>
            <td>$${(data.quantity * data.price).toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
    `;

    div.innerHTML = `
      <h3>${order.name} (${order.phone})</h3>
      <p><em>Completed: ${new Date(order.latestTimestamp).toLocaleString()}</em></p>
      ${itemsHtml}
      <p class="total">Total: $${order.total.toFixed(2)}</p>
      ${order.paid ? "<p><strong>✅ Paid</strong></p>" : `<button onclick="markGroupAsPaid('${order.phone}')">Mark as Paid</button>`}
    `;

    container.appendChild(div);
  });
}

function completeOrder(index) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];

  const currentOrder = orders.splice(index, 1)[0];
  currentOrder.timestamp = Date.now();
  currentOrder.status = "Ready for Pickup";

  completed.push(currentOrder);

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

function markAsPaid(index) {
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  if (!completed[index]) return;

  completed[index].paid = true;
  completed[index].paidAt = Date.now();
  completed[index].total = 0;

  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

// ✅ New: Mark all orders with this phone number as paid
function markGroupAsPaid(phone) {
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  const now = Date.now();
  completed.forEach(order => {
    if (order.phone === phone && !order.paid) {
      order.paid = true;
      order.paidAt = now;
      order.total = 0;
    }
  });
  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

loadOrders();
setInterval(loadOrders, 5000);
