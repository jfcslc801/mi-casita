import { auth, db } from './firebase-config.js';
import { collection, addDoc, Timestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inject Admin Navigation (initially hidden)
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

  const menuItems = [
    { name: "Gorditas de Queso", price: 5.0, image: "images/gorditas.jpg" },
    { name: "Gorditas de Desebrada", price: 5.0, image: "images/gordita.jpg" },
    { name: "Menudo", price: 15.0, image: "images/menudo.jpg" },
    { name: "Costilla con Tortillas", price: 15.0, image: "images/costilla.jpg" },
    { name: "Tamales Docena", price: 25.0, image: "images/tamales.jpg" },
    { name: "Tortillas", price: 2.0, image: "images/tortillas.jpg" },
    { name: "Can Soda", price: 1.5, image: "images/can-soda.jpg" },
    { name: "Bottle Soda", price: 2.5, image: "images/bottle-soda.jpg" }
  ];

  const menuContainer = document.getElementById("menu-container");
  const totalCostEl = document.getElementById("total-cost");
  const orderForm = document.getElementById("order-form");

  // Render menu items
  menuItems.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "menu-item";
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h3>${item.name}</h3>
      <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
      <div class="qty-stepper">
        <button type="button" class="decrease">-</button>
        <span class="qty">0</span>
        <button type="button" class="increase">+</button>
      </div>
    `;
    menuContainer.appendChild(itemDiv);
  });

  function calculateTotal() {
    const quantities = document.querySelectorAll(".qty");
    let total = 0;
    quantities.forEach((qtyEl, i) => {
      const qty = parseInt(qtyEl.textContent);
      total += qty * menuItems[i].price;
    });
    totalCostEl.textContent = `$${total.toFixed(2)}`;
  }

  menuContainer.addEventListener("click", (e) => {
    const btn = e.target;
    const stepper = btn.closest(".qty-stepper");
    if (!stepper) return;

    const qtyEl = stepper.querySelector(".qty");
    let qty = parseInt(qtyEl.textContent);
    if (btn.classList.contains("increase")) {
      qty += 1;
    } else if (btn.classList.contains("decrease") && qty > 0) {
      qty -= 1;
    }
    qtyEl.textContent = qty;
    calculateTotal();
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // Show admin nav if admin
    const adminPhones = ["+18013474922", "+18012323880"];
    if (adminPhones.includes(user.phoneNumber)) {
      const adminNav = document.getElementById("admin-nav");
      if (adminNav) adminNav.style.display = "block";
    }

    orderForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const quantities = document.querySelectorAll(".qty");
      const items = [];
      let total = 0;

      quantities.forEach((qtyEl, i) => {
        const qty = parseInt(qtyEl.textContent);
        if (qty > 0) {
          const item = menuItems[i];
          items.push({ name: item.name, price: item.price, quantity: qty });
          total += item.price * qty;
        }
      });

      if (items.length === 0) {
        alert("Please select at least one item.");
        return;
      }

      try {
        await addDoc(collection(db, "orders"), {
          phone: user.phoneNumber,
          name: user.displayName || "Customer",
          items,
          total,
          status: "Being Prepped",
          timestamp: Timestamp.now(),
          paid: false
        });

        alert("✅ Order submitted!");
        window.location.href = "order-status.html";
      } catch (error) {
        console.error("Error submitting order:", error);
        alert("❌ Failed to submit order. Try again.");
      }
    });
  });
});
