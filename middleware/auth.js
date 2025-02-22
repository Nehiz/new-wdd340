const jwt = require('jsonwebtoken')

const auth = {}

/* ************************
 * Middleware to check account type (Only Admin & Employees Allowed)
 * ************************ */
auth.checkAccountType = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
          res.locals.accountData = accountData
          res.locals.loggedin = 1
          next()
        } else {
          req.flash("notice", "You do not have permission to access this page")
          return res.redirect("/account/login")
        }
      })
  } else {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }
}

module.exports = auth

