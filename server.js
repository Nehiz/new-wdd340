/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require('express-ejs-layouts');
const env = require("dotenv").config()
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser") // Ensure this line is present
const cookieParser = require("cookie-parser")  // <-- Added cookie-parser
const flash = require("connect-flash") // Add this line
const messages = require("express-messages") // Add this line
const utilities = require("./utilities/")  // <-- Ensure utilities is required
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * Middleware
 ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(flash()) // Ensure this line is present
app.use(function(req, res, next){
  res.locals.messages = messages(req, res) // Ensure this line is present
  next()
})

// Body Parser Middleware
app.use(bodyParser.json()) // Ensure this line is present
app.use(bodyParser.urlencoded({ extended: true })) // Ensure this line is present

// Cookie Parser Middleware
app.use(cookieParser()) // <-- Add the cookie-parser middleware here

// JWT Middleware
app.use(utilities.checkJWTToken)  // <-- Add the JWT middleware here

/* View Engine and Templates */
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/layout'); // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Error route
app.use("/error", errorRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
