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

  if (completed.length > 0) {
    container.innerHTML += "<hr><h2>Completed Orders</h2>";
  }

  // Split into unpaid and paid completed orders
  const unpaidCompleted = completed.filter(order => !order.paid);
  const paidCompleted = completed.filter(order => order.paid);

  // Group unpaid completed by phone
  const groupedUnpaid = {};
  unpaidCompleted.forEach(order => {
    if (!groupedUnpaid[order.phone]) {
      groupedUnpaid[order.phone] = {
        phone: order.phone,
        name: order.name,
        items: [...order.items],
        total: order.total,
        latestTimestamp: order.timestamp
      };
    } else {
      groupedUnpaid[order.phone].items.push(...order.items);
      groupedUnpaid[order.phone].total += order.total;
      if (order.timestamp > groupedUnpaid[order.phone].latestTimestamp) {
        groupedUnpaid[order.phone].latestTimestamp = order.timestamp;
        groupedUnpaid[order.phone].name = order.name;
      }
    }
  });

  // Render grouped unpaid completed orders
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
      <p><em>Completed: ${new Date(group.latestTimestamp).toLocaleString()}</em></p>
      ${itemsHtml}
      <p class="total">Total: $${group.total.toFixed(2)}</p>
      <button onclick="markGroupAsPaid('${group.phone}')">Mark as Paid</button>
    `;

    container.appendChild(div);
  });

  // Group paid orders by phone + paidAt (so we keep them grouped but unique after paid)
  const groupedPaid = {};
  paidCompleted.forEach(order => {
    const groupId = `${order.phone}-${order.paidAt || order.timestamp}`;
    if (!groupedPaid[groupId]) {
      groupedPaid[groupId] = {
        phone: order.phone,
        name: order.name,
        items: [...order.items],
        total: order.total,
        latestTimestamp: order.timestamp,
        paidAt: order.paidAt
      };
    } else {
      groupedPaid[groupId].items.push(...order.items);
      groupedPaid[groupId].total += order.total;
      if (order.timestamp > groupedPaid[groupId].latestTimestamp) {
        groupedPaid[groupId].latestTimestamp = order.timestamp;
        groupedPaid[groupId].name = order.name;
      }
    }
  });

  // ✅ Render paid grouped orders, sorted from newest to oldest
  Object.values(groupedPaid)
    .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
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
        <p><em>Completed: ${new Date(group.latestTimestamp).toLocaleString()}</em></p>
        ${itemsHtml}
        <p class="total">Total: $${group.total.toFixed(2)}</p>
        <p><strong>✅ Paid</strong></p>
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

function markGroupAsPaid(phone) {
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  const now = Date.now();
  completed.forEach(order => {
    if (order.phone === phone && !order.paid) {
      order.paid = true;
      order.paidAt = now;
    }
  });
  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

loadOrders();
setInterval(loadOrders, 5000);
