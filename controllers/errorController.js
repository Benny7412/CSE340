const utilities = require("../utilities/")
const errorController = {}

errorController.throwError = async function(req, res, next){
    const err = new Error("Error 500")
    err.status = 500
    throw err;
}

module.exports = errorController