const express = require("express")
const router = new express.Router()

// Serve static files
router.use(express.static("public"))

module.exports = router



