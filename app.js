const defaultImage = "images/laptop-bag.jpg";

/* Default Products */
let products = [
  {
    vendorName: "Tech Store",
    productName: "Laptop Bag",
    category: "Electronics",
    price: 600,
    description: "Waterproof laptop bag",
    imageUrl: "images/laptop-bag.jpg"
  },
  {
    vendorName: "Yoga Studio",
    productName: "Zenith Pro Yoga Mat",
    category: "Home Appliances",
    price: 360,
    description: "Eco-friendly yoga mat",
    imageUrl: "images/yoga-mat.jpg"
  },
  {
    vendorName: "Hydro Gear",
    productName: "Insulated Steel Flask",
    category: "Home Appliances",
    price: 840,
    description: "Vacuum insulated steel bottle",
    imageUrl: "images/steel-flask.jpg"
  },
  {
    vendorName: "Tech Store",
    productName: "Smart Watch",
    category: "Electronics",
    price: 2500,
    description: "Bluetooth smart watch",
    imageUrl: "images/smart-watch.jpg"
  }
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let lastOrder = JSON.parse(localStorage.getItem("lastOrder")) || null;
let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

/* Save Functions */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function saveCurrentUser() {
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function saveLastOrder() {
  localStorage.setItem("lastOrder", JSON.stringify(lastOrder));
}

function saveOrderHistory() {
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
}

/* Login */
function loginUser() {
  const name = document.getElementById("loginName").value.trim();
  const role = document.getElementById("loginRole").value;

  if (!name || !role) {
    alert("Please enter name and select role");
    return;
  }

  currentUser = { name, role };
  saveCurrentUser();
  window.location.href = "dashboard.html";
}

/* Logout — fixed: redirects to index.html (the login page) */
function logoutUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

/* Dashboard */
function initDashboard() {
  if (!currentUser) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeText").innerText =
    `Welcome, ${currentUser.name} (${currentUser.role})`;

  const vendorPanel = document.getElementById("vendorPanel");
  if (vendorPanel && currentUser.role !== "Vendor" && currentUser.role !== "Admin") {
    vendorPanel.style.display = "none";
  }

  renderProducts();
  renderCart();
  renderOrderSummary();
  renderOrderHistory();
  updateStats();
  updateCategoryCounts();
  setupSearchFilter();
}

/* Add Product */
function addProduct() {
  let vendorName = document.getElementById("vendorName").value.trim();
  let productName = document.getElementById("productName").value.trim();
  let category = document.getElementById("category").value;
  let price = parseFloat(document.getElementById("price").value.trim());
  let description = document.getElementById("description").value.trim();
  let imageUrl = document.getElementById("imageUrl").value.trim() || defaultImage;

  if (!vendorName || !productName || !category || !price || !description) {
    alert("Please fill all fields");
    return;
  }

  if (price <= 0 || isNaN(price)) {
    alert("Please enter a valid price");
    return;
  }

  let product = {
    vendorName,
    productName,
    category,
    price,
    description,
    imageUrl
  };

  products.push(product);
  renderProducts();
  updateStats();
  updateCategoryCounts();

  document.getElementById("vendorName").value = "";
  document.getElementById("productName").value = "";
  document.getElementById("category").value = "";
  document.getElementById("price").value = "";
  document.getElementById("description").value = "";
  document.getElementById("imageUrl").value = "";

  alert("Product added successfully!");
}

/* Delete Product */
function deleteProduct(index) {
  if (confirm("Are you sure you want to delete this product?")) {
    products.splice(index, 1);
    renderProducts();
    updateStats();
    updateCategoryCounts();
  }
}

/* Render Products */
function renderProducts() {
  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  let search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  let categoryFilter = document.getElementById("filterCategory")?.value || "All";

  let filtered = products.filter((p) => {
    let searchMatch =
      p.productName.toLowerCase().includes(search) ||
      p.vendorName.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search);

    let categoryMatch = categoryFilter === "All" || p.category === categoryFilter;
    return searchMatch && categoryMatch;
  });

  if (filtered.length === 0) {
    list.innerHTML = "<div class='empty'>No matching products found</div>";
    return;
  }

  filtered.forEach((product) => {
    let index = products.indexOf(product);
    let safeImageUrl = product.imageUrl || defaultImage;

    list.innerHTML += `
      <div class="product-box">
        <div class="image-container">
          <img class="product-image"
               src="${safeImageUrl}"
               alt="${product.productName}"
               onerror="handleImageError(this)">
          <div class="image-placeholder">📦</div>
        </div>
        <span class="category-badge">${product.category}</span>
        <h3>${product.productName}</h3>
        <p class="price">₹${Number(product.price).toLocaleString()}</p>
        <p class="description">${product.description}</p>
        <p class="vendor">Vendor: ${product.vendorName}</p>
        <div class="product-actions">
          <button onclick="addToCart(${index})">🛒 Add to Cart</button>
          ${(currentUser?.role === "Admin" || currentUser?.role === "Vendor")
            ? `<button class="delete-btn" onclick="deleteProduct(${index})">🗑️ Delete</button>`
            : ""}
        </div>
      </div>
    `;
  });
}

/* Image fallback */
function handleImageError(img) {
  img.style.display = "none";
  const placeholder = img.nextElementSibling;
  if (placeholder) {
    placeholder.style.display = "flex";
  }
}

/* Cart */
function addToCart(index) {
  const product = products[index];
  if (!product) return;

  cart.push({ ...product });
  saveCart();
  renderCart();
  updateStats();
  alert(`${product.productName} added to cart!`);
}

function removeFromCart(index) {
  if (confirm("Remove this item from cart?")) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateStats();
  }
}

function clearCart() {
  if (confirm("Clear entire cart?")) {
    cart = [];
    saveCart();
    renderCart();
    updateStats();
  }
}

/* Render Cart */
function renderCart() {
  const cartList = document.getElementById("cartList");
  const total = document.getElementById("cartTotal");

  if (!cartList || !total) return;

  cartList.innerHTML = "";
  let subtotal = 0;

  if (cart.length === 0) {
    cartList.innerHTML = "<div class='empty'>🛒 Your cart is empty</div>";
    total.innerHTML = "";
    return;
  }

  cart.forEach((item, i) => {
    subtotal += Number(item.price);
    let safeImageUrl = item.imageUrl || defaultImage;

    cartList.innerHTML += `
      <div class="product-box">
        <div class="image-container">
          <img class="product-image"
               src="${safeImageUrl}"
               alt="${item.productName}"
               onerror="handleImageError(this)">
          <div class="image-placeholder">📦</div>
        </div>
        <span class="category-badge">${item.category}</span>
        <h3>${item.productName}</h3>
        <p class="price">₹${Number(item.price).toLocaleString()}</p>
        <p class="vendor">Vendor: ${item.vendorName}</p>
        <button class="delete-btn" onclick="removeFromCart(${i})">❌ Remove</button>
      </div>
    `;
  });

  total.innerHTML = `<strong>Total: ₹${subtotal.toLocaleString()}</strong>`;
}

/* Fake Payment Checkout */
function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const deliveryAddress = document.getElementById("deliveryAddress")?.value.trim();
  const paymentMethod = document.getElementById("paymentMethod")?.value;

  if (!deliveryAddress) {
    alert("Please enter delivery address");
    return;
  }

  if (!paymentMethod) {
    alert("Please select payment method");
    return;
  }

  let orderDate = new Date().toLocaleString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  lastOrder = {
    items: [...cart],
    date: orderDate,
    total: cart.reduce((sum, item) => sum + Number(item.price), 0),
    paymentMethod,
    deliveryAddress
  };

  orderHistory.unshift(lastOrder);

  saveLastOrder();
  saveOrderHistory();

  cart = [];
  saveCart();

  renderCart();
  renderOrderSummary();
  renderOrderHistory();
  updateStats();

  document.getElementById("deliveryAddress").value = "";
  document.getElementById("paymentMethod").value = "";

  const successMsg = document.getElementById("successMessage");
  if (successMsg) {
    successMsg.innerHTML = `
      <div class='success-box'>
        ✅ <strong>Payment Successful!</strong><br>
        Method: ${paymentMethod}<br>
        Order placed on: ${orderDate}
      </div>
    `;
  }

  alert("Payment successful! Order placed.");
}

/* Latest Order */
function renderOrderSummary() {
  let container = document.getElementById("orderSummaryContent");
  if (!container) return;

  if (!lastOrder || !lastOrder.items || lastOrder.items.length === 0) {
    container.innerHTML = "<div class='empty'>No order placed yet.</div>";
    return;
  }

  let total = lastOrder.total || 0;
  let html = `
    <div class="order-header">
      <h3>📦 Latest Order</h3>
      <p><strong>Date:</strong> ${lastOrder.date}</p>
      <p><strong>Payment:</strong> ${lastOrder.paymentMethod}</p>
      <p><strong>Address:</strong> ${lastOrder.deliveryAddress}</p>
    </div>
  `;

  lastOrder.items.forEach((item) => {
    html += `
      <div class="order-item">
        <div>
          <strong>${item.productName}</strong><br>
          <small>Vendor: ${item.vendorName} | ₹${Number(item.price).toLocaleString()}</small>
        </div>
      </div>
    `;
  });

  html += `<div class="order-total"><strong>Total: ₹${total.toLocaleString()}</strong></div>`;
  container.innerHTML = html;
}

/* Order History */
function renderOrderHistory() {
  const container = document.getElementById("orderHistoryContent");
  if (!container) return;

  if (!orderHistory || orderHistory.length === 0) {
    container.innerHTML = "<div class='empty'>No previous orders.</div>";
    return;
  }

  let html = "";

  orderHistory.forEach((order, index) => {
    html += `
      <div class="order-item">
        <strong>Order ${index + 1}</strong><br>
        <small>Date: ${order.date}</small><br>
        <small>Payment: ${order.paymentMethod}</small><br>
        <small>Total: ₹${Number(order.total).toLocaleString()}</small>
      </div>
    `;
  });

  container.innerHTML = html;
}

/* Stats */
function updateStats() {
  const totalProductsEl = document.getElementById("totalProducts");
  const totalCartItemsEl = document.getElementById("totalCartItems");
  const totalCartPriceEl = document.getElementById("totalCartPrice");

  if (totalProductsEl) totalProductsEl.innerText = products.length;
  if (totalCartItemsEl) totalCartItemsEl.innerText = cart.length;

  let cartTotal = 0;
  cart.forEach((p) => cartTotal += Number(p.price));

  if (totalCartPriceEl) {
    totalCartPriceEl.innerText = `₹${cartTotal.toLocaleString()}`;
  }
}

/* Category Counts */
function updateCategoryCounts() {
  const electronics = products.filter((p) => p.category === "Electronics").length;
  const clothing = products.filter((p) => p.category === "Clothing").length;
  const books = products.filter((p) => p.category === "Books").length;
  const home = products.filter((p) => p.category === "Home Appliances").length;

  const elements = {
    electronicsCount: `Electronics: ${electronics}`,
    clothingCount: `Clothing: ${clothing}`,
    booksCount: `Books: ${books}`,
    homeAppliancesCount: `Home Appliances: ${home}`
  };

  Object.entries(elements).forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  });
}

/* Search & Filter */
function setupSearchFilter() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("filterCategory");

  if (searchInput) {
    searchInput.addEventListener("input", renderProducts);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderProducts);
  }
}

window.onload = function () {
  if (window.location.pathname.includes("dashboard.html")) {
    initDashboard();
  }
};
