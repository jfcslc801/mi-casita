
const menuItems = [
  { name: "Gorditas de Queso", image: "", price: 7.00 },
  { name: "Gorditas de Desebrada", image: "", price: 7.00 },
  { name: "Menudo", image: "", price: 20.00 },
  { name: "Dozena de Tamales", image: "", price: 22.00 },
  { name: "Refresco", image: "", price: 1.00 }
];

const container = document.querySelector(".menu-container");
const totalCostEl = document.getElementById("total-cost");
let totalCost = 0;

menuItems.forEach((item, index) => {
  const div = document.createElement("div");
  div.className = "menu-item";
  div.innerHTML = `
    <h3>${item.name}</h3>
    <p>Price: $${item.price.toFixed(2)}</p>
    <label for="qty-${index}">Quantity:</label>
    <select id="qty-${index}" onchange="updateTotal()">
      <option value="0">0</option>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
  `;
  container.appendChild(div);
});

window.updateTotal = function () {
  totalCost = 0;
  const selects = document.querySelectorAll(".menu-item select");
  selects.forEach((select, index) => {
    const quantity = parseInt(select.value, 10);
    totalCost += menuItems[index].price * quantity;
  });
  totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
};

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const selects = document.querySelectorAll(".menu-item select");
  const items = [];

  selects.forEach((select, index) => {
    const quantity = parseInt(select.value, 10);
    if (quantity > 0) {
      items.push({ name: menuItems[index].name, quantity, price: menuItems[index].price });
    }
  });

  if (!items.length) return alert("Please select at least one item.");

  const order = {
    id: "order-" + Date.now(),
    name,
    phone,
    items,
    total: totalCost,
    timestamp: Date.now(),
    paid: false
  };

  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
  localStorage.setItem("latestOrderId", JSON.stringify(order.id));
  window.location.href = "order-status.html";
});
