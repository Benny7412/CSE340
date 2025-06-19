// Create the "Add to Cart" button
const addToCart = document.createElement("a");
addToCart.href = "#";
addToCart.textContent = "Add to Cart";
addToCart.classList.add("add-to-cart-btn");

const vehicleInfo = document.querySelector(".vehicle-info");
const vehicleId = vehicleInfo.dataset.id;
const vehicleName = document.querySelector(".vehicle-info h2").textContent;
const vehiclePrice = vehicleInfo.dataset.price;
const vehicleImage = document.querySelector(".vehicle-detail img").src;

vehicleInfo.appendChild(addToCart);

addToCart.addEventListener("click", function (event) {
  event.preventDefault();

  // Get current cart from localStorage or create empty array if none exists
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === vehicleId);

  if (existingItem) {
    // If car is already in cart, show message that it's already added
    const notification = document.createElement("div");
    notification.textContent = "This vehicle is already in your cart!";
    notification.classList.add("cart-notification", "warning");
    vehicleInfo.appendChild(notification);
  } else {
    cart.push({
      id: vehicleId,
      name: vehicleName,
      price: vehiclePrice,
      image: vehicleImage,
      quantity: 1,
    });

    // Save updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    const notification = document.createElement("div");
    notification.textContent = "Added to cart!";
    notification.classList.add("cart-notification");
    vehicleInfo.appendChild(notification);

    addToCart.classList.add("disabled");
    addToCart.textContent = "Added to Cart";
  }

  const notifications = document.querySelectorAll(".cart-notification");
  notifications.forEach((notification) => {
    setTimeout(() => {
      notification.remove();
    }, 1000 * /*Notification Time in seconds*/ 2 /* Notification Time in seconds*/);
  });

  updateCartCount();
});

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.length;

  const cartCounter = document.getElementById("cart-counter");
  if (cartCounter) {
    cartCounter.textContent = totalItems;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  // Check if current car is already in cart and update button
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const vehicleId = document.querySelector(".vehicle-info").dataset.id;
  const existingItem = cart.find((item) => item.id === vehicleId);

  if (existingItem) {
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    addToCartBtn.classList.add("disabled");
    addToCartBtn.textContent = "Added to Cart";
  }
});
