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

// Route to get inventory items by classification
router.get("/classification/:classificationId", utilities.handleErrors(invController.getInventoryByClassificationId));

// New route to get inventory items as JSON based on classification ID
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to deliver edit-inventory view
router.get("/edit/:invId", utilities.handleErrors(invController.buildEditInventoryView));

// Route to process update-inventory form submission
router.post("/update", utilities.handleErrors(invController.updateInventory));

module.exports = router
