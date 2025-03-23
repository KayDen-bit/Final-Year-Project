document.addEventListener("DOMContentLoaded", function () {
  loadMenu();
  loadCart();
});

// Load Menu
function loadMenu() {
  let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
  let menuContainer = document.getElementById("menuContainer");
  menuContainer.innerHTML = "";

  if (menuItems.length === 0) {
      menuContainer.innerHTML = "<p class='text-center'>No menu items available.</p>";
      return;
  }

  let categories = {};

  // Group items by category
  menuItems.forEach(item => {
      if (!categories[item.category]) {
          categories[item.category] = [];
      }
      categories[item.category].push(item);
  });

  // Display categories with items
  for (let category in categories) {
      menuContainer.innerHTML += `<h3 class="menu-category">${category}</h3>`;
      categories[category].forEach(item => {
          if (item.availability === "Available") { // Show only available items
              let itemHTML = `
                  <div class="menu-item">
                      <img src="${item.image}" alt="${item.name}" class="menu-image">
                      <p>${item.name} - ₹${item.price}</p>
                      <button class="btn btn-primary" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
                  </div>`;
              menuContainer.innerHTML += itemHTML;
          }
      });
  }
}

// Add Item to Cart
function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(name + " added to cart!");
}

// Listen for admin updates & refresh menu
window.addEventListener("storage", function () {
  if (window.location.pathname.includes("menu.html")) {
      loadMenu(); // Reload menu
  }
});

// ✅ Load Cart Items in `order.html`
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartTable = document.getElementById("cartTable");
  let subtotal = 0;
  let gst = 30; // Fixed GST amount

  cartTable.innerHTML = "";

  if (cart.length === 0) {
      cartTable.innerHTML = "<tr><td colspan='5' class='text-center'>Your cart is empty.</td></tr>";
  } else {
      cart.forEach((item, index) => {
          let row = `<tr>
                      <td>${item.name}</td>
                      <td>
                          <button onclick="updateQuantity(${index}, -1)">➖</button>
                          ${item.quantity}
                          <button onclick="updateQuantity(${index}, 1)">➕</button>
                      </td>
                      <td>₹${item.price}</td>
                      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                      <td><button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})">❌</button></td>
                   </tr>`;
          cartTable.innerHTML += row;
          subtotal += item.price * item.quantity;
      });
  }

  let total = subtotal + gst;
  document.getElementById("subtotalAmount").innerText = "₹" + subtotal.toFixed(2);
  document.getElementById("totalAmount").innerText = "₹" + total.toFixed(2);
}

// ✅ Update Quantity in Cart
function updateQuantity(index, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart[index].quantity + change > 0) {
      cart[index].quantity += change;
  } else {
      cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// ✅ Remove Item from Cart
function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// ✅ Checkout & Submit Order
function submitOrder(event) {
  event.preventDefault();
  
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
      alert("Your cart is empty. Please add items to your cart first.");
      return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  const contactNumber = document.getElementById("contactNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const tableNumber = document.getElementById("tableNumber").value.trim();
  const orderNumber = generateOrderNumber();
  const totalAmount = parseFloat(document.getElementById("totalAmount").innerText.replace("₹", ""));

  if (!customerName || !contactNumber || !tableNumber) {
      alert("Please fill in all required fields.");
      return;
  }

  let orders = JSON.parse(localStorage.getItem("orders")) || [];

  let newOrder = {
      orderId: orderNumber,
      customerName: customerName,
      contactNumber: contactNumber,
      email: email,
      tableNumber: parseInt(tableNumber),
      items: cart,
      totalPrice: totalAmount.toFixed(2),
      status: "Pending"
  };

  orders.push(newOrder);
  localStorage.setItem("orders", JSON.stringify(orders));

  localStorage.removeItem("cart");

  alert("Order submitted successfully! Your order number is: " + orderNumber);
  window.location.href = "index.html";
}

// ✅ Generate Unique Order ID
function generateOrderNumber() {
  return "NR" + Math.floor(100000 + Math.random() * 900000);
}
