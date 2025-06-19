const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const pool = require("../database/");
const accountModel = require("../models/account-model");

const invCont = {};

/* ***************************
 *  Adding new products/categories stuff
 * ************************** */

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const result = await invModel.addClassification(classification_name);
  if (result) {
    req.flash("notice", `Classification ${classification_name} added.`);
    nav = await utilities.getNav();
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    });
  } else {
    req.flash("notice", "Classification addition failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  });
};

invCont.addInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const result = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (result) {
    req.flash("notice", `Successfully added ${inv_make} ${inv_model}.`);
    nav = await utilities.getNav();
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    });
  } else {
    req.flash("notice", "Inventory addition failed.");
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
};

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const classifications = await invModel.getClassifications();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      classifications: classifications.rows,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getInventoryItemById(inv_id);
    const detail = await utilities.buildDetailedView(data);
    let nav = await utilities.getNav();
    const name = `${data.inv_make} ${data.inv_model}`;
    res.render("./inventory/detail", {
      title: name,
      nav,
      detail,
      inv_id,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

invCont.buildEdit = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    let nav = await utilities.getNav();

    const itemData = await invModel.getInventoryItemById(invId);
    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    console.error("Error in buildEdit:", error);
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body;

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  );

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the update failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 *  Delete confirmation view
 * ************************** */
invCont.buildDelete = async function (req, res, next) {
  try {
    const invId = parseInt(req.params.invId);
    let nav = await utilities.getNav();

    const itemData = await invModel.getInventoryItemById(invId);
    const classificationSelect = await utilities.buildClassificationList(
      itemData.classification_id
    );
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    console.error("Error in buildEdit:", error);
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);

    // Get the item data before deletion to display in confirmation message
    const itemData = await invModel.getInventoryItemById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    // Perform the deletion
    const deleteResult = await invModel.deleteInventoryItem(inv_id);

    if (deleteResult) {
      req.flash("notice", `The ${itemName} was successfully deleted.`);
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Sorry, the deletion failed.");
      res.redirect("/inv/");
    }
  } catch (error) {
    console.error("Error in deleteInventory:", error);
    next(error);
  }
};

/* **********************************
 *  Build cart view
 * ********************************* */
invCont.buildCartView = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("inventory/shopping-cart", {
    title: "Shopping Cart",
    nav,
    errors: null,
  });
};

/* **********************************
 *  Build checkout view
 * ********************************* */
invCont.buildCheckout = async function (req, res, next) {
  const nav = await utilities.getNav();

  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in to proceed with checkout");
    return res.redirect("/account/login");
  }

  const account_id = res.locals.accountData.account_id;
  const accountBalance = await accountModel.getAccountBalance(account_id);

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(accountBalance);

  res.render("inventory/checkout", {
    title: "Checkout",
    nav,
    errors: null,
    accountBalance: formattedBalance,
    sufficientFunds: true,
  });
};

/* **********************************
 *  Process payment
 * ********************************* */
invCont.processPayment = async function (req, res, next) {
  const nav = await utilities.getNav();

  // Check if user is logged in
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in to complete your purchase");
    return res.redirect("/account/login");
  }

  const { order_total, vehicle_ids, order_details } = req.body;
  const account_id = res.locals.accountData.account_id;

  // Check if account has sufficient funds
  const hasFunds = await accountModel.hasSufficientFunds(
    account_id,
    order_total
  );

  if (!hasFunds) {
    req.flash("notice", "Insufficient funds in your account");
    return res.redirect("/inv/checkout");
  }

  try {
    // Process payment by updating account balance
    const newBalance = await accountModel.updateAccountBalance(
      account_id,
      order_total
    );

    // Parse vehicle IDs and order details
    const vehicleIds = JSON.parse(vehicle_ids);
    let orderDetails = [];

    if (order_details) {
      try {
        orderDetails = JSON.parse(order_details);
        // Format prices for display
        orderDetails = orderDetails.map((item) => {
          return {
            ...item,
            formattedPrice: new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(item.price),
          };
        });
      } catch (e) {
        console.error("Error parsing order details:", e);
      }
    }

    // Delete vehicles from inventory
    if (vehicleIds && vehicleIds.length > 0) {
      await invModel.deleteMultipleInventoryItems(vehicleIds);
    }

    // Format balance and total for display
    const formattedBalance = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(newBalance);

    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(order_total);

    req.flash(
      "success",
      "Payment successful! Your vehicle(s) will be ready for pickup."
    );

    // Redirect to success page with order details
    return res.render("inventory/purchase-success", {
      title: "Purchase Successful",
      nav,
      accountBalance: formattedBalance,
      totalPrice: formattedTotal,
      orderDetails: orderDetails,
      errors: null,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    req.flash("notice", "An error occurred while processing your payment");
    return res.redirect("/inv/checkout");
  }
};

module.exports = invCont;
