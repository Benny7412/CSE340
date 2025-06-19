const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

//Protected route
// Route to build inventory management view
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildManagementView)
);

//Protected route
// Route to build add classification view
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddClassification)
);

//Protected route
// Route to add classification
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

//Protected route
// Route to build inventory item add view
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildAddInventory)
);

//Protected route
// Route to build inventory item edit view
router.get(
  "/edit/:invId",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildEdit)
);

//Protected route
// Route to build  delete inventory item view
router.get(
  "/delete/:invId",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildDelete)
);

//Protected route
// Route to build inventory item edit view
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

//Protected route
// Route to delete inventory item
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.deleteInventory)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));

// Route to add to cart
router.post(
  "/detail/:invId/add-to-cart",
  utilities.handleErrors(invController.updateCart)
);

// Route for shopping cart
router.get("/cart", utilities.handleErrors(invController.buildCartView));

// route to get inventory by classification
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get("/checkout", utilities.handleErrors(invController.buildCheckout));

// Route to process payment
router.post(
  "/process-payment",
  utilities.handleErrors(invController.processPayment)
);

module.exports = router;
