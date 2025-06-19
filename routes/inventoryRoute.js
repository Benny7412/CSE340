const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

// Inventory management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
// Route to build inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildDetail));
// Route to build inventory item edit view
router.get("/edit/:invId", utilities.handleErrors(invController.buildEdit));

// Route to process the edit inventory form
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

router.get("/delete/:invId", utilities.handleErrors(invController.buildDelete));

router.post("/delete", utilities.handleErrors(invController.deleteInventory));

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

module.exports = router;
