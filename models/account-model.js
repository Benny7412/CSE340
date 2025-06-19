const pool = require("../database");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

/* *****************************
 * Return account data using account ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_balance FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching account found");
  }
}

/* *****************************
 * Get account balance
 * ***************************** */
async function getAccountBalance(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_balance FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0].account_balance;
  } catch (error) {
    return new Error("Error getting account balance");
  }
}

/* *****************************
 * Check if account has sufficient funds
 * ***************************** */
async function hasSufficientFunds(account_id, amount) {
  try {
    const balance = await getAccountBalance(account_id);
    return parseFloat(balance) >= parseFloat(amount);
  } catch (error) {
    return false;
  }
}

/* *****************************
 * Update account data
 * ***************************** */
async function updateAccount(
  account_id,
  account_firstname,
  account_lastname,
  account_email
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error in updateAccount:", error);
    return false;
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, account_password) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return false;
  }
}

/* *****************************
 * Update account balance
 * ***************************** */
async function updateAccountBalance(account_id, amount) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_balance = account_balance - $1 WHERE account_id = $2 RETURNING account_balance",
      [amount, account_id]
    );
    return result.rows[0].account_balance;
  } catch (error) {
    return new Error("Error updating account balance");
  }
}

/* *****************************
 * Set account balance to specific amount
 * ***************************** */
async function setAccountBalance(account_id, amount) {
  try {
    const result = await pool.query(
      "UPDATE account SET account_balance = $1 WHERE account_id = $2 RETURNING account_balance",
      [amount, account_id]
    );
    return result.rows[0].account_balance;
  } catch (error) {
    return new Error("Error setting account balance");
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
  getAccountBalance,
  hasSufficientFunds,
  updateAccountBalance,
  setAccountBalance,
};
