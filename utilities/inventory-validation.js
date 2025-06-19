const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invValidate = {};

invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .isAlpha()
      .withMessage("A valid classification name is required."),
  ];
};

invValidate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    });
    return;
  }
  next();
};

invValidate.inventoryRules = () => {
  return [
    body("inv_make").trim().notEmpty().withMessage("Please provide a make."),
    body("inv_model").trim().notEmpty().withMessage("Please provide a model."),
    body("inv_year")
      .trim()
      .isInt()
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be 4 digits."),
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description."),
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path."),
    body("inv_price").trim().isFloat().withMessage("Please provide a price."),
    body("inv_miles").trim().isInt().withMessage("Please provide the mileage."),
    body("inv_color").trim().notEmpty().withMessage("Please provide a color."),
    body("classification_id")
      .trim()
      .isInt()
      .withMessage("Please select a classification."),
  ];
};

invValidate.checkInvData = async (req, res, next) => {
  let errors = validationResult(req);
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

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
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
    return;
  }
  next();
};

invValidate.checkUpdateData = async (req, res, next) => {
  let errors = validationResult(req);
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
    inv_id,
  } = req.body;

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("inventory/edit-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
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
      inv_id,
    });
    return;
  }
  next();
};

module.exports = invValidate;
