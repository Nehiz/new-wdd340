const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model"); // Ensure this file exists

const regValidate = {};

/* ************************
 * Registration Validation Rules
 * ************************ */
regValidate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .notEmpty().withMessage("First name is required.")
      .isAlpha().withMessage("First name must contain only letters."),
    
    body("account_lastname")
      .trim()
      .notEmpty().withMessage("Last name is required.")
      .isAlpha().withMessage("Last name must contain only letters."),

    body("account_email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Invalid email format.")
      .custom(async (email) => {
        const account = await accountModel.getAccountByEmail(email);
        if (account) {
          throw new Error("Email already in use.");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
      .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
      .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter.")
      .matches(/[0-9]/).withMessage("Password must contain at least one number."),
  ];
};

/* ************************
 * Login Validation Rules
 * ************************ */
regValidate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Invalid email format."),

    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required."),
  ];
};

/* ************************
 * Update Account Validation Rules
 * ************************ */
regValidate.updateAccountRules = () => {
  return [
    body('account_firstname')
      .trim()
      .isLength({ min: 1 })
      .withMessage('First name is required.'),
    body('account_lastname')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Last name is required.'),
    body('account_email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required.')
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists && emailExists.account_id !== account_id) {
          throw new Error('Email already exists.')
        }
      })
  ]
}

/* ************************
 * Password Validation Rules
 * ************************ */
regValidate.passwordRules = () => {
  return [
    body('account_password')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches('[0-9]')
      .withMessage('Password must contain at least one number.')
      .matches('[A-Z]')
      .withMessage('Password must contain at least one uppercase letter.')
      .matches('[a-z]')
      .withMessage('Password must contain at least one lowercase letter.')
  ]
}

/* ************************
 * Middleware to Check Validation Results
 * ************************ */
regValidate.checkRegData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/register", {
      title: "Register",
      errors: errors.array(),
    });
  }
  next();
};

regValidate.checkLoginData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/login", {
      title: "Login",
      errors: errors.array(),
    });
  }
  next();
};

regValidate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      accountData: {
        account_id: req.body.account_id,
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
      }
    })
    return
  }
  next()
}

regValidate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render('account/update-account', {
      title: 'Update Account Information',
      nav,
      errors: errors.array(),
      accountData: {
        account_id: req.body.account_id
      }
    })
    return
  }
  next()
}

module.exports = regValidate;
