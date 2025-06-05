const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
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
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const data = await invModel.getInventoryItemById(invId)
    const detail = await utilities.buildDetailedView(data)
    let nav = await utilities.getNav()
    const name = `${data.inv_make} ${data.inv_model}`
    res.render("./inventory/detail", {
      title: name,
      nav,
      detail,
    })
  } catch (error) {
    next(error)
  }
}


module.exports = invCont