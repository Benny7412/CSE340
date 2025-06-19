const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities/");
const regValidate = require("../utilities/account-validation");

// Route to build inventory by classification view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);
// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/", utilities.handleErrors(accountController.buildAccount));

router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Route to update account information view
router.get(
  "/update/:accountId",
  utilities.handleErrors(accountController.buildAccountUpdate)
);

// Process the account update
router.post(
  "/update",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Process password change
router.post(
  "/update-password",
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
);

// Check account balance for checkout
router.post(
  "/check-account-balance",
  utilities.handleErrors(accountController.checkAccountBalance)
);

// Protected route
// Update account balance
router.post(
  "/update-balance",
  utilities.checkJWTToken,
  utilities.checkAuthorization,
  regValidate.balanceRules(),
  regValidate.checkBalanceData,
  utilities.handleErrors(accountController.updateAccountBalance)
);

module.exports = router;
