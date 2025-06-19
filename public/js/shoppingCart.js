// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCartMessage = document.getElementById("empty-cart-message");
  const cartContainer = document.getElementById("cart-container");
  const totalPriceElement = document.getElementById("total-price");
  const checkoutButton = document.getElementById("checkout-button");
  const clearCartButton = document.getElementById("clear-cart");

  // Load cart from localStorage
  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      cartContainer.style.display = "none";
      emptyCartMessage.style.display = "block";
      return;
    }

    emptyCartMessage.style.display = "none";
    cartContainer.style.display = "block";
    cartItemsContainer.innerHTML = "";

    // Create table for cart items
    const table = document.createElement("table");
    table.classList.add("cart-table");
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Vehicle</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    let totalPrice = 0;

    cart.forEach((item, index) => {
      const row = document.createElement("tr");

      const itemPrice = parseFloat(item.price);
      totalPrice += itemPrice;

      const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(itemPrice);

      row.innerHTML = `
        <td class="item-info">
          <img src="${item.image}" alt="${item.name}" width="50">
          <span>${item.name}</span>
        </td>
        <td>${formattedPrice}</td>
        <td>
          <button class="remove-btn" data-index="${index}">Remove</button>
        </td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    cartItemsContainer.appendChild(table);
    totalPriceElement.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(totalPrice);

    document.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", removeItem);
    });
  }

  // Remove an item from the cart
  function removeItem(event) {
    const index = event.target.dataset.index;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCart();
  }

  function clearCart() {
    localStorage.removeItem("cart");
    loadCart();
  }
  loadCart();

  clearCartButton.addEventListener("click", clearCart);

  checkoutButton.addEventListener("click", function () {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      return;
    }

    // Calculate total price
    let totalPrice = 0;
    cart.forEach((item) => {
      totalPrice += parseFloat(item.price);
    });

    fetch("/account/check-account-balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ total: totalPrice }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.loggedIn === false) {
          // Not logged in, redirect to login
          window.location.href = "/account/login";
        } else if (data.sufficientFunds === false) {
          // Insufficient funds, show message
          showInsufficientFundsMessage(data.accountBalance, totalPrice);
        } else {
          window.location.href = "/inv/checkout";
        }
      })
      .catch((error) => {
        console.error("Error checking account balance:", error);
        window.location.href = "/inv/checkout";
      });
  });

  function showInsufficientFundsMessage(balance, total) {
    const existingMessage = document.querySelector(
      ".insufficient-funds-message"
    );
    if (existingMessage) {
      existingMessage.remove();
    }

    // Format currency
    const formattedBalance = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(balance);

    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(total);

    // Create message element
    const message = document.createElement("div");
    message.classList.add("insufficient-funds-message");
    message.innerHTML = `
      <p>Insufficient funds in your account.</p>
      <p>Your balance: ${formattedBalance}</p>
      <p>Order total: ${formattedTotal}</p>
      <p>Please add funds to your account before proceeding.</p>
    `;

    cartContainer.insertAdjacentElement("afterend", message);
    message.scrollIntoView({ behavior: "smooth" });
  }
});
