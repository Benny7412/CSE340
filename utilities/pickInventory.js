const FIELDS = require('../constants/inventoryFields');

module.exports = function pickInventory(source) {
  return FIELDS.reduce((obj, key) => {
    if (key in source) obj[key] = source[key];
    return obj;
  }, {});
};