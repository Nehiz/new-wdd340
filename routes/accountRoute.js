const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation") // Ensure this line is present

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(), // Ensure validation rules are present
  regValidate.checkRegData, // Ensure validation check is present
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(), // Add validation rules
  regValidate.checkLoginData, // Add validation check
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route
router.get(
  "/",
  utilities.checkLogin, // Add the checkLogin middleware here
  utilities.handleErrors(accountController.accountManagement)
)

// Route to deliver account management view
router.get("/manage", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagementView))

// Route to deliver update account information view
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccountView))

// Route to handle logout process
router.get("/logout", utilities.handleErrors(accountController.logout))

// Route to process account update form submission
router.post("/update", regValidate.updateAccountRules(), regValidate.checkUpdateData, utilities.handleErrors(accountController.updateAccount))

// Route to process password change form submission
router.post("/update-password", regValidate.passwordRules(), regValidate.checkPasswordData, utilities.handleErrors(accountController.changePassword))

module.exports = router
