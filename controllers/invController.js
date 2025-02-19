const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  try {
    const invId = req.params.invId;
    const data = await invModel.getInventoryById(invId);
    const detail = await utilities.buildInventoryDetail(data);
    let nav = await utilities.getNav();
    const title = `${data.inv_make} ${data.inv_model}`;
    // Pass both data and detail so the view can reference "data"
    res.render("./inventory/detail", {
      title,
      nav,
      data,
      detail  // Optional if needed elsewhere
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build Inventory Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(); // Create the select list
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect, // Pass the select list to the view
      messages: req.flash() // Pass flash messages to the view
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build Add Classification View
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: null,
      classification_name: ""
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Process Classification Form
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    let nav = await utilities.getNav();
    // Call model function to insert new classification
    const addResult = await invModel.addClassification(classification_name);
    if (addResult) {
      req.flash("success", `Classification "${classification_name}" added successfully.`);
      // Refresh the navigation bar (assumed to incorporate new classification) and render management view
      nav = await utilities.getNav();
      res.redirect("/inv");
    } else {
      req.flash("error", "Error: Classification was not added.");
      res.status(500).render("./inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
        errors: req.flash("error"),
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build Add Inventory View
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    let classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "/images/no-image.png",
      inv_thumbnail: "/images/no-image-thumbnail.png"
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Process Inventory Form Submission
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
    let nav = await utilities.getNav();
    const result = await invModel.addInventory(
      classification_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    );
    if (result) {
      req.flash("success", `Vehicle "${inv_make} ${inv_model}" added successfully.`);
      return req.session.save(() => {
        res.redirect("/inv");
      });
    } else {
      req.flash("error", "Error: Vehicle could not be added.");
      let classificationList = await utilities.buildClassificationList(classification_id);
      return res.status(500).render("./inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        messages: req.flash(),
        errors: req.flash("error"),
        classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Get inventory items by classification ID (AJAX)
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont
