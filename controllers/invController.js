const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const pickInventory = require('../utils/pickInventory');

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

invCont.addInventory = async (req, res, next) => {
  const nav = await utilities.getNav();
  const inv = pickInventory(req.body);

  try {
    const result = await invModel.addInventory(inv);

    if (result && result.rowCount) {
      req.flash(`notice`, `successfully added ${inv.inv_make} ${inv.inv_model}.`);
      return res.status(201).render('inventory/management', {title: 'Inventory Management', nav })
    }
    throw new Error('Insert Failed');
   } catch (err) {
    req.flash('notice', 'Inventory addition failed.');
    const classificationList = await utilities.buildClassificationList(inv.classification_id);
    
  return res
  .status(500)
  .render('inventory/add-inventory', {
    title: 'Add Inventory',
    nav,
    classificationList,
    errors: err,
    ...inv, //spreads into fields
  });
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