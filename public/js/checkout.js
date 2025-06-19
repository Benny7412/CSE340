document.addEventListener("DOMContentLoaded", function () {
  // Get elements
  const checkoutItemsContainer = document.getElementById("checkout-items");
  const checkoutTotalElement = document.getElementById("checkout-total");
  const orderTotalInput = document.getElementById("order-total-input");
  const accountBalanceElement = document.getElementById("account-balance");

  function loadCheckoutItems() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      window.location.href = "/inv/cart";
      return;
    }
    checkoutItemsContainer.innerHTML = "";

    // Create table for checkout items
    const table = document.createElement("table");
    table.classList.add("checkout-table");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Vehicle</th>
        <th>Price</th>
      </tr>
    `;
    table.appendChild(thead);
    const tbody = document.createElement("tbody");
    let totalPrice = 0;
    let vehicleIds = [];

    cart.forEach((item) => {
      const row = document.createElement("tr");

      // Store vehicle ID for deletion
      vehicleIds.push(item.id);

      const itemPrice = parseFloat(item.price);
      totalPrice += itemPrice;

      const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(itemPrice);

      // Build item info
      row.innerHTML = `
        <td class="item-info">
          <img src="${item.image}" alt="${item.name}" width="50">
          <span>${item.name}</span>
        </td>
        <td>${formattedPrice}</td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    checkoutItemsContainer.appendChild(table);

    // Update total price
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(totalPrice);
    checkoutTotalElement.textContent = formattedTotal;

    // Set the hidden input value for the form
    if (orderTotalInput) {
      orderTotalInput.value = totalPrice;

      const paymentForm = document.getElementById("payment-form");
      if (paymentForm) {
        const existingInput = document.getElementById("vehicle-ids-input");
        if (existingInput) {
          existingInput.remove();
        }

        const vehicleIdsInput = document.createElement("input");
        vehicleIdsInput.type = "hidden";
        vehicleIdsInput.id = "vehicle-ids-input";
        vehicleIdsInput.name = "vehicle_ids";
        vehicleIdsInput.value = JSON.stringify(vehicleIds);
        paymentForm.appendChild(vehicleIdsInput);

        // Add order details for success page
        const orderDetailsInput = document.createElement("input");
        orderDetailsInput.type = "hidden";
        orderDetailsInput.id = "order-details-input";
        orderDetailsInput.name = "order_details";
        orderDetailsInput.value = JSON.stringify(cart);
        paymentForm.appendChild(orderDetailsInput);
      }
    }

    if (accountBalanceElement) {
      // Get account balance and format for processing
      const balanceText = accountBalanceElement.textContent;
      const balance = parseFloat(balanceText.replace(/[$,]/g, ""));

      // Check if balance is sufficient
      const sufficientFunds = balance >= totalPrice;

      // Update UI based on funds
      const paymentForm = document.getElementById("payment-form");
      const insufficientMessage = document.querySelector(".insufficient-funds");

      if (paymentForm && insufficientMessage) {
        if (sufficientFunds) {
          paymentForm.style.display = "block";
          insufficientMessage.style.display = "none";
        } else {
          paymentForm.style.display = "none";
          insufficientMessage.style.display = "block";
        }
      }
    }
  }

  loadCheckoutItems();

  const paymentForm = document.getElementById("payment-form");
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (event) {
      localStorage.removeItem("cart");
    });
  }
});
