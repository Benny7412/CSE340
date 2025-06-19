const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver account view
 * *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  let accountData = res.locals.accountData;
  res.render("account/account", {
    title: "Account",
    nav,
    accountData,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;
  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash(
        "message notice",
        "Please check your credentials and try again."
      );
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

/* ****************************************
 *  Process logout request
 * ************************************ */
async function accountLogout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}

/* ****************************************
 *  Deliver account update view
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.accountId);
  let nav = await utilities.getNav();

  const accountData = await accountModel.getAccountById(account_id);

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    accountData,
  });
}

/* ****************************************
 *  Process account update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    req.flash("notice", "Account updated successfully.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Update failed. Please try again.");
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 *  Process password update
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", "there was an error processing the password update.");
    res.status(500).redirect("/account/");
    return;
  }

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
    res.redirect("/account/");
  } else {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash("notice", "Password update failed. Please try again.");
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  }
}

/* ****************************************
 *  Check Account Balance
 * *************************************** */
async function checkAccountBalance(req, res) {
  // Check if user is logged in
  if (!res.locals.loggedin) {
    return res.json({ loggedIn: false });
  }

  const { total } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    const accountBalance = await accountModel.getAccountBalance(account_id);
    const sufficientFunds = parseFloat(accountBalance) >= parseFloat(total);

    // Return result
    return res.json({
      loggedIn: true,
      sufficientFunds,
      accountBalance,
    });
  } catch (error) {
    console.error("Error checking account balance:", error);
    return res.status(500).json({
      error: "Error checking account balance",
      loggedIn: true,
      sufficientFunds: false,
    });
  }
}

/* ****************************************
 *  Update Account Balance (Admin only)
 * *************************************** */
async function updateAccountBalance(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_balance } = req.body;

  // Check if user is an admin
  if (!res.locals.loggedin || res.locals.accountData.account_type !== "Admin") {
    req.flash("notice", "You don't have permission to perform this action.");
    return res.redirect("/account/");
  }

  try {
    // Convert to number and validate
    const balance = parseFloat(account_balance);
    if (isNaN(balance) || balance < 0) {
      req.flash(
        "notice",
        "Please enter a valid positive number for the balance."
      );
      return res.redirect(`/account/update/${account_id}`);
    }

    // Update account balance
    const newBalance = await accountModel.setAccountBalance(
      account_id,
      balance
    );

    if (newBalance) {
      req.flash("notice", "Account balance updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Balance update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error("Error updating account balance:", error);
    req.flash("notice", "An error occurred while updating the balance.");
    return res.redirect(`/account/update/${account_id}`);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  registerAccount,
  accountLogin,
  accountLogout,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  checkAccountBalance,
  updateAccountBalance,
};
