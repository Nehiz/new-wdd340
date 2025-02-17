const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = utilities.handleErrors(async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "Home", nav, pageClass: "home-page" })
})

module.exports = baseController
