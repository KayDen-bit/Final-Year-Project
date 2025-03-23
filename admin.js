document.addEventListener("DOMContentLoaded", function () {
    loadAdminMenu();
    loadOrders();
    loadRecords();
});

// Load Menu in Admin Panel
function loadAdminMenu() {
    let menuTable = document.getElementById("menuTable");
    menuTable.innerHTML = "";
    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];

    if (menuItems.length === 0) {
        menuTable.innerHTML = "<tr><td colspan='7' class='text-center'>No menu items available.</td></tr>";
        return;
    }

    menuItems.forEach((item, index) => {
        let row = `
            <tr>
                <td>${index + 1}</td>
                <td contenteditable="true" onBlur="updateMenu(${index}, 'name', this.innerText)">${item.name}</td>
                <td contenteditable="true" onBlur="updateMenu(${index}, 'price', this.innerText)">₹${item.price}</td>
                <td>${item.category}</td>
                <td><img src="${item.image}" width="50"></td>
                <td>
                    <select onchange="updateMenu(${index}, 'availability', this.value)">
                        <option value="Available" ${item.availability === "Available" ? "selected" : ""}>Available</option>
                        <option value="Unavailable" ${item.availability === "Unavailable" ? "selected" : ""}>Unavailable</option>
                    </select>
                </td>
                <td><button class="btn btn-danger" onclick="deleteMenuItem(${index})">Delete</button></td>
            </tr>`;
        menuTable.innerHTML += row;
    });

    syncMenuWithUserView();  // Sync changes
}

// Sync Admin Changes with menu.html
function syncMenuWithUserView() {
    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
    localStorage.setItem("menu", JSON.stringify(menuItems));
    window.dispatchEvent(new Event("storage"));  // Trigger update on other pages
}

// Add New Menu Item
document.getElementById("addMenuForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let name = document.getElementById("menuItem").value.trim();
    let price = parseFloat(document.getElementById("price").value) || 0;
    let category = document.getElementById("category").value;
    let availability = document.getElementById("availability").value;
    let imageInput = document.getElementById("menuImage");
    let imageUrl = imageInput.files.length ? URL.createObjectURL(imageInput.files[0]) : "images/default.jpg";

    if (!name || price <= 0) {
        alert("Please enter a valid item name and price.");
        return;
    }

    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
    menuItems.push({ name, price, category, availability, image: imageUrl });

    localStorage.setItem("menu", JSON.stringify(menuItems));
    loadAdminMenu();
    syncMenuWithUserView(); // Sync menu instantly
    document.getElementById("addMenuForm").reset();
});

// Update Menu Item (Availability, Name, or Price)
function updateMenu(index, key, value) {
    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
    menuItems[index][key] = value;
    localStorage.setItem("menu", JSON.stringify(menuItems));
    loadAdminMenu();
    syncMenuWithUserView();
}

// Delete Menu Item
function deleteMenuItem(index) {
    let menuItems = JSON.parse(localStorage.getItem("menu")) || [];
    menuItems.splice(index, 1);
    localStorage.setItem("menu", JSON.stringify(menuItems));
    loadAdminMenu();
    syncMenuWithUserView();
}

// Listen for storage updates from admin panel
window.addEventListener("storage", function () {
    if (window.location.pathname.includes("menu.html")) {
        loadMenu(); // Reload menu when admin makes changes
    }
});

// ✅ Load Orders in Admin Panel
function loadOrders() {
    let orderTable = document.getElementById("orderTable");
    orderTable.innerHTML = "";
    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    orders.forEach(order => {
        let row = `<tr>
            <td>${order.orderId}</td>
            <td>${order.customerName}</td>
            <td>${order.tableNumber}</td>
            <td>${order.items.map(i => i.name).join(", ")}</td>
            <td>₹${order.totalPrice}</td>
            <td>${order.status}</td>
            <td>
                <button class="btn btn-success" onclick="confirmOrder('${order.orderId}')">Confirm</button>
                <button class="btn btn-danger" onclick="cancelOrder('${order.orderId}')">Cancel</button>
            </td>
        </tr>`;
        orderTable.innerHTML += row;
    });
}

// ✅ Confirm Order
function confirmOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let orderIndex = orders.findIndex(order => order.orderId === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = "Confirmed";
        localStorage.setItem("orders", JSON.stringify(orders));
        loadOrders();
    }
}

// ✅ Cancel Order
function cancelOrder(orderId) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let orderIndex = orders.findIndex(order => order.orderId === orderId);
    if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        localStorage.setItem("orders", JSON.stringify(orders));
        loadOrders();
    }
}

// ✅ Load Order Records
function loadRecords() {
    let recordTable = document.getElementById("recordTable");
    recordTable.innerHTML = "";
    let records = JSON.parse(localStorage.getItem("orderRecords")) || [];

    records.forEach(record => {
        let row = `<tr>
            <td>${record.orderId}</td>
            <td>${record.customerName}</td>
            <td>${record.contact}</td>
            <td>${record.email}</td>
            <td>${record.date}</td>
            <td>₹${record.amountPaid}</td>
        </tr>`;
        recordTable.innerHTML += row;
    });
}

// ✅ Export Order Records to Excel
function exportRecords() {
    let records = JSON.parse(localStorage.getItem("orderRecords")) || [];
    if (records.length === 0) {
        alert("No records available to export.");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order ID, Customer Name, Contact, Email, Date, Amount Paid\n";

    records.forEach(record => {
        csvContent += `${record.orderId}, ${record.customerName}, ${record.contact}, ${record.email}, ${record.date}, ₹${record.amountPaid}\n`;
    });

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Order_Records.csv");
    document.body.appendChild(link);
    link.click();
}
