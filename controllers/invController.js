const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Adding new products/categories stuff
 * ************************** */

invCont.buildAddClassification = async function(req, res, next){
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

invCont.addClassification = async function(req, res){
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  const result = await invModel.addClassification(classification_name)
  if(result){
    req.flash("notice", `Classification ${classification_name} added.`)
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Classification addition failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  }
}

invCont.buildAddInventory = async function(req, res, next){
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

invCont.addInventory = async function(req, res){
  let nav = await utilities.getNav()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, } = req.body

  const result = await invModel.addInventory( inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)

  if(result){
    req.flash("notice", `Successfully added ${inv_make} ${inv_model}.`)
    nav = await utilities.getNav()
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
    })
  } else {
    req.flash("notice", "Inventory addition failed.")
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(501).render("inventory/add-inventory", { title: "Add Inventory", nav, classificationList, errors: null, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color,})
  }
}


/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
try {
let nav = await utilities.getNav()
req.flash("notice", "LOADED")
res.render("./inventory/management", {
title: "Inventory Management",
nav,
})
} catch (error) {
next(error)
}
}



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