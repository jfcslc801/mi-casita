function loadStatus() {
  const statusContainer = document.querySelector(".status");
  const nameEl = document.getElementById("customer-name");
  const totalEl = document.getElementById("order-total");

  const phone = localStorage.getItem("latestCustomerPhone");
  const name = localStorage.getItem("latestCustomerName") || "Customer";
  const orders = [
    ...(JSON.parse(localStorage.getItem("orders")) || []),
    ...(JSON.parse(localStorage.getItem("completedOrders")) || [])
  ];

  nameEl.textContent = name;

  if (!phone) {
    statusContainer.innerHTML = "❌ No customer phone stored.";
    totalEl.textContent = "0.00";
    return;
  }

  const now = Date.now();
  const customerOrders = orders
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
    const isExpired = isPaid && (Date.now() - paidAt > 600000); // 10 min
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

document.addEventListener("DOMContentLoaded", () => {
  loadStatus();
  setInterval(loadStatus, 5000); // auto-refresh every 5 seconds
});
// Ensure the latest customer phone and name are stored
const latestPhone = localStorage.getItem("latestCustomerPhone");
const latestName = localStorage.getItem("latestCustomerName");
if (!latestPhone || !latestName) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  if (orders.length > 0) {
    const latestOrder = orders[orders.length - 1];
    localStorage.setItem("latestCustomerPhone", latestOrder.phone);
    localStorage.setItem("latestCustomerName", latestOrder.name);
  }
}
// This ensures that the latest customer phone and name are always available
// for the status page, even if the user navigates away and comes back later.
// It checks if the latest phone and name are already set, and if not,
// it retrieves the most recent order from the orders list and sets them accordingly.
// This way, the status page will always display the most recent customer's information
// without requiring the user to manually enter it again.
// This is particularly useful for scenarios where the user might be checking
// the status of their order after placing it, ensuring a seamless experience.
// The auto-refresh functionality ensures that the status is updated in real-time,
// providing the user with the latest information about their order without needing to reload the page.
// This code is designed to enhance the user experience by keeping the status page