const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const accountController = {}

/* ****************************************
 *  Deliver login view
 * *************************************** */
accountController.buildLogin = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: ""
  })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
accountController.buildRegister = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  })
}

/* ****************************************
 *  Process Registration
 * *************************************** */
accountController.registerAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: ""
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
accountController.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign({ 
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_type: accountData.account_type 
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.session.accountId = accountData.account_id
      req.session.accountData = accountData
      return res.redirect("/account/manage")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
accountController.accountManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(req.session.accountId)
  res.render("account/manage", {
    title: "Account Management",
    nav,
    accountData,
    messages: req.flash(),
    errors: null
  })
}

/* ***************************
 *  Build Update Account View
 * ************************** */
accountController.buildUpdateAccountView = async function (req, res, next) {
  const account_id = parseInt(req.params.accountId)
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  res.render("./account/update-account", {
    title: "Update Account Information",
    nav,
    accountData,
    messages: req.flash(),
    errors: null
  })
}

/* ***************************
 *  Update Account Information
 * ************************** */
accountController.updateAccount = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    req.flash("notice", "Account information updated successfully.")
    res.redirect("/account/manage")
  } else {
    req.flash("error", "Error: Account information could not be updated.")
    res.status(500).render("./account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: { account_id, account_firstname, account_lastname, account_email },
      messages: req.flash(),
      errors: req.flash("error")
    })
  }
}

/* ***************************
 *  Change Password
 * ************************** */
accountController.changePassword = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body

  // Hash the new password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("error", 'Sorry, there was an error processing the password change.')
    res.status(500).render("./account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: await accountModel.getAccountById(account_id),
      messages: req.flash(),
      errors: req.flash("error")
    })
    return
  }
  
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    res.redirect("/account/manage")
  } else {
    req.flash("error", "Error: Password could not be updated.")
    res.status(500).render("./account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: await accountModel.getAccountById(account_id),
      messages: req.flash(),
      errors: req.flash("error")
    })
  }
}
/* **************************
 * Logout Function
 ************************** */
accountController.logout = async function (req, res, next) {
  req.flash("notice", "You have been logged out."); 
  res.clearCookie("jwt", { httpOnly: true, secure: process.env.NODE_ENV !== 'development' });

  res.redirect("/");
};

module.exports = accountController
