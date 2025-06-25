const container = document.getElementById("kitchen-orders");

function loadOrders() {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  container.innerHTML = "";

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
      <button onclick="completeOrder(${index})">Complete Order</button>
    `;

    container.appendChild(div);
  });
}

function completeOrder(index) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];

  const currentOrder = orders.splice(index, 1)[0];

  const existingIndex = completed.findIndex(o => o.phone === currentOrder.phone);
  if (existingIndex !== -1) {
    currentOrder.items.forEach(newItem => {
      const match = completed[existingIndex].items.find(i => i.name === newItem.name);
      if (match) {
        match.quantity += newItem.quantity;
      } else {
        completed[existingIndex].items.push({ ...newItem });
      }
    });
    completed[existingIndex].total += currentOrder.total;
  } else {
    completed.push(currentOrder);
  }

  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("completedOrders", JSON.stringify(completed));
  loadOrders();
}

loadOrders();
