const express = require("express")
const router = new express.Router()
const errorController = require("../controllers/errorController")
const utilities = require("../utilities/")

router.get("/", utilities.handleErrors(async (req, res, next) => {
    next({status: 500});
}))



module.exports = router;