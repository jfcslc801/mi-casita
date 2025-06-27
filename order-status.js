function loadStatus() {
  const statusContainer = document.querySelector(".status");
  const nameEl = document.getElementById("customer-name");
  const totalEl = document.getElementById("order-total");

  // Ensure latest customer phone/name are available
  let phone = localStorage.getItem("latestCustomerPhone");
  let name = localStorage.getItem("latestCustomerName");

  const allOrders = [
    ...(JSON.parse(localStorage.getItem("orders")) || []),
    ...(JSON.parse(localStorage.getItem("completedOrders")) || [])
  ];

  // Fallback: get from most recent order
  if (!phone || !name) {
    const latestOrder = allOrders.slice(-1)[0];
    if (latestOrder) {
      phone = latestOrder.phone;
      name = latestOrder.name;
      localStorage.setItem("latestCustomerPhone", phone);
      localStorage.setItem("latestCustomerName", name);
    }
  }

  nameEl.textContent = name || "Customer";

  if (!phone) {
    statusContainer.innerHTML = "❌ No customer phone stored.";
    totalEl.textContent = "0.00";
    return;
  }

  const now = Date.now();
  const customerOrders = allOrders
    .filter(order => order.phone === phone)
    .sort((a, b) => b.timestamp - a.timestamp);

  const unpaidTotal = customerOrders
    .filter(order => !order.paid)
    .reduce((sum, order) => sum + order.total, 0);

  totalEl.textContent = unpaidTotal.toFixed(2);
  statusContainer.innerHTML = "";

  if (customerOrders.length === 0) {
    statusContainer.innerHTML = `<p>No orders found for ${phone}</p>`;
    return;
  }

  customerOrders.forEach((order, i) => {
    const isMostRecent = i === 0;
    const isPaid = order.paid === true;
    const paidAt = order.paidAt || order.timestamp;
    const isExpired = isPaid && (Date.now() - paidAt > 600000); // 10 minutes
    if (isExpired) return;

    let statusText = order.status || "Being Prepped";
    if (isPaid) {
      statusText = `✅ Ready for Pickup (Paid ${new Date(paidAt).toLocaleTimeString()})`;
    }

    let progress = 33;
    if (statusText.toLowerCase().includes("ready")) progress = 66;
    if (isPaid) progress = 100;

    const itemsLine = order.items.map(item => `${item.name} × ${item.quantity}`).join(', ');

    const block = document.createElement("div");
    let blockClass = "order-block";
    if (isMostRecent) blockClass += " highlight";
    if (!isPaid && statusText.toLowerCase().includes("prepped")) blockClass += " prepping";
    block.className = blockClass;

    block.innerHTML = `
      <h3>${isMostRecent ? "🟢 Latest Order" : "Order"}</h3>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p><strong>Items:</strong> ${itemsLine}</p>
      <p class="status-text"><strong>Status:</strong> ${statusText}</p>
      <div class="progress-container">
        <div class="progress-bar" style="width: ${progress}%"></div>
      </div>
    `;

    statusContainer.appendChild(block);
  });
}

// Initial + repeat every 5 seconds
document.addEventListener("DOMContentLoaded", () => {
  loadStatus();
  setInterval(loadStatus, 5000);
});
