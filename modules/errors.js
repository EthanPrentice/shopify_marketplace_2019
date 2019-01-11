/**
 * @author Ethan Prentice
 * @fileoverview Holds error names and status codes for consistency
 * @module Errors
 */

/**
 * @enum Contains error messages
 */
module.exports.errorNames = {
  /**
   * @type {string}
   * @desc Referenced when a product in the cart's quantity exceeds the current inventory
   */
  EXCEEDS_INVENTORY:      "EXCEEDS_INVENTORY",
  /**
   * @type {string}
   * @desc Referenced when a cart that doesn't exist is attempted to be retrieved
   */
  CART_DOES_NOT_EXIST:    "CART_DOES_NOT_EXIST",
  /**
   * @type {string}
   * Referenced when a product that doesn't exist is attempted to be retrieved
   */
  PRODUCT_DOES_NOT_EXIST: "PRODUCT_DOES_NOT_EXIST",
  /**
   * @type {object}
   * Referenced when a method is given insufficient arguements
   */
  INVALID_PARAMS: "INVALID_PARAMS"
}

/**
 * @enum Contains more information about errors
 */
module.exports.errorTypes = {
  /**
   * @type {object}
   * @desc Referenced when a product in the cart's quantity exceeds the current inventory (verbose)
   */
  EXCEEDS_INVENTORY: {
    message: "EXCEEDS_INVENTORY",
    statusCode: 418
  },
  /**
   * @type {object}
   * @desc Referenced when a cart that doesn't exist is attempted to be retrievedy (verbose)
   */
  CART_DOES_NOT_EXIST: {
    message: "CART_DOES_NOT_EXIST",
    statusCode: 418
  },
  /**
   * @type {object}
   * Referenced when a product that doesn't exist is attempted to be retrievedy (verbose)
   */
  PRODUCT_DOES_NOT_EXIST: {
    message: "PRODUCT_DOES_NOT_EXIST",
    statusCode: 418
  },
  /**
   * @type {object}
   * Referenced when a method is given insufficient arguements
   */
  INVALID_PARAMS: {
    message: "INVALID_PARAMS",
    statusCode: 502
  }
}

/**
 * Retrieved data from errorTypes based on given errorName
 *
 * @param {string} errorName - name of error to get more information on
 *
 * @return {object|string} more verbose info if available, otherwise return errorName
 */
module.exports.getError = (errorName) => {
  if (module.exports.errorTypes[errorName] == undefined)
    return errorName
  else
    return module.exports.errorTypes[errorName]
}
