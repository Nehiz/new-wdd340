const errorController = {}

/* ***************************
 *  Trigger a 500 error
 * ************************** */
errorController.triggerError = function (req, res, next) {
  const error = new Error("This is an intentional 500 error.")
  error.status = 500
  next(error)
}

module.exports = errorController
