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

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(), // Add validation rules
  regValidate.checkLoginData, // Add validation check
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router
