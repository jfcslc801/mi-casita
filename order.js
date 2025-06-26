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
const quantities = new Array(menuItems.length).fill(0);

menuItems.forEach((item, index) => {
  const div = document.createElement("div");
  div.className = "menu-item";
  div.innerHTML = `
    <h3>${item.name}</h3>
    <p>Price: $${item.price.toFixed(2)}</p>
    <label>Quantity:</label>
    <div class="qty-stepper">
      <button type="button" onclick="changeQty(${index}, -1)">−</button>
      <span id="qty-display-${index}">0</span>
      <button type="button" onclick="changeQty(${index}, 1)">+</button>
    </div>
  `;
  container.appendChild(div);
});

window.changeQty = function(index, delta) {
  quantities[index] = Math.max(0, quantities[index] + delta);
  document.getElementById(`qty-display-${index}`).textContent = quantities[index];
  updateTotal();
};

function updateTotal() {
  totalCost = 0;
  quantities.forEach((qty, index) => {
    totalCost += qty * menuItems[index].price;
  });
  totalCostEl.textContent = `$${totalCost.toFixed(2)}`;
}

document.getElementById("order-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const items = [];

  quantities.forEach((qty, index) => {
    if (qty > 0) {
      items.push({
        name: menuItems[index].name,
        quantity: qty,
        price: menuItems[index].price
      });
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
