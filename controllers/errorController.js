const errorController = {}

/* ***************************
 *  Trigger a 500 error
 * ************************** */
errorController.triggerError = function (req, res, next) {
  const error = new Error("Server encountered an issue. Please try again later.")
  error.status = 500
  next(error)
}

module.exports = errorController
