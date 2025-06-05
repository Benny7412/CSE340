const utilities = require("../utilities/")
const errorController = {}

errorController.throwError = async function(req, res, next){
    throw new Error("Error 500")
    
}

module.exports = errorController