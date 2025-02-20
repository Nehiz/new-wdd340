const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const pool = require('../database/')
const { body, validationResult } = require('express-validator')
const invModel = require('../models/inventory-model') // Add this line
require("dotenv").config()

const utilities = {}

/* ************************
 * Middleware to check JWT token
 * ************************ */
utilities.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

/* ************************
 * Handle errors
 * ************************ */
utilities.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/* ************************
 * Get navigation bar
 * ************************ */
utilities.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************
 * Build classification list
 * ************************ */
utilities.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
utilities.buildClassificationGrid = async function(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
 * Build the inventory detail view HTML
 * ************************************ */
utilities.buildInventoryDetail = async function(data) {
  let detail = `
    <div class="inventory-detail">
      <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors" />
      <div class="inventory-info">
        <h2>${data.inv_make} ${data.inv_model}</h2>
        <p>Year: ${data.inv_year}</p>
        <p>Price: $${new Intl.NumberFormat('en-US').format(data.inv_price)}</p>
        <p>Mileage: ${new Intl.NumberFormat('en-US').format(data.inv_miles)} miles</p>
        <p>Color: ${data.inv_color}</p>
        <p>Description: ${data.inv_description}</p>
      </div>
    </div>
  `
  return detail
}

/* ****************************************
 *  Check Login
 * ************************************ */
utilities.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = utilities
