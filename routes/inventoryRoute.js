// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

// Route to deliver management view (accessed via /inv)
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to deliver add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

// Route to process add-classification form submission
router.post("/add-classification", utilities.handleErrors(invController.addClassification));

// Route to deliver add-inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventoryView));

// Route to process add-inventory form submission
router.post("/add-inventory", utilities.handleErrors(invController.addInventory));

module.exports = router
