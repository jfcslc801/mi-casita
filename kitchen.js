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

  // Render completed orders
  completed.forEach((order, index) => {
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
      <h3>${order.name} (${order.phone})</h3>
      <p><em>Completed: ${order.timestamp ? new Date(order.timestamp).toLocaleString() : "Unknown"}</em></p>
      ${itemsHtml}
      <p class="total">Total: $${order.total.toFixed(2)}</p>
      ${order.paid ? "<p><strong>✅ Paid</strong></p>" : `<button onclick="markAsPaid(${index})">Mark as Paid</button>`}
    `;

    container.appendChild(div);
  });
}

function completeOrder(index) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];

  const currentOrder = orders.splice(index, 1)[0];
  currentOrder.timestamp = Date.now();
  currentOrder.paid = true; // ✅ Mark as paid (ready)
  currentOrder.status = "Ready for Pickup"; // ✅ Add status

  completed.push(currentOrder);

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}


function markAsPaid(index) {
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  if (!completed[index]) return;

  completed[index].paid = true;
  completed[index].total = 0;

  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

loadOrders();
