const container = document.getElementById("completed-orders");

function renderCompletedOrders() {
  const completed = JSON.parse(localStorage.getItem("completedOrders")) || [];
  console.log("Loaded completedOrders:", completed);

  container.innerHTML = "";

  if (completed.length === 0) {
    container.innerHTML = "<p>No completed orders found.</p>";
    return;
  }

  completed.forEach(order => {
    const div = document.createElement("div");
    div.className = "order-card";

    const itemsHtml = order.items.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`).join('');

    div.innerHTML = `
      <h3>Customer: ${order.name}</h3>
      <p><strong>Phone:</strong> ${order.phone}</p>
      <p><strong>Completed:</strong> ${order.timestamp ? new Date(order.timestamp).toLocaleString() : "N/A"}</p>
      <table>
        <tr><th>Item</th><th>Qty</th><th>Subtotal</th></tr>
        ${itemsHtml}
      </table>
      <p class="total">Total: $${order.total.toFixed(2)}</p>
    `;

    container.appendChild(div);
  });
}

renderCompletedOrders();
