const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};
const accountModel = require("../models/account-model");

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("A password is required."),
  ];
};

validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
      account_password,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Account Update Data Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id;
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        const existingAccount = await accountModel.getAccountById(account_id);

        if (emailExists && existingAccount.account_email !== account_email) {
          throw new Error("Email exists. Please use a different email");
        }
        return true;
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to update
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Password Update Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check password data and return errors or continue to update
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
    });
    return;
  }
  next();
};

/*  **********************************
 *  Balance Update Validation Rules
 * ********************************* */
validate.balanceRules = () => {
  return [
    body("account_balance")
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid number for the balance.")
      .custom((value) => {
        const decimalPlaces = (value.toString().split(".")[1] || "").length;
        if (decimalPlaces > 2) {
          throw new Error("Balance can only have 2 decimal places.");
        }
        return true;
      })
      .withMessage("Balance can only have 2 decimal places."),
  ];
};

/* ******************************
 * Check balance data
 * ***************************** */
validate.checkBalanceData = async (req, res, next) => {
  const { account_balance } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountId = req.body.account_id;
    const accountData = await accountModel.getAccountById(accountId);
    return res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      accountData,
    });
  }
  next();
};

module.exports = validate;
