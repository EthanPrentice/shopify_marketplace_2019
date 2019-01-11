/**
 * @author Ethan Prentice
 * @fileoverview Manages the products, translates from the database to GraphQL and vice-versa
 * @module Product
 */

const errorNames  = require('./errors.js').errorNames

const isNullOrUndefined = (val) => {
  if (val instanceof Array) {
    for (let i=0; i<val.length; i++)
      if (val == undefined || val == null)
        return true
  }
  else
    return val == undefined || val == null
}

var Product = module.exports

/**
 * Retrieves all products with an inventory greater than zero
 *
 * @async
 * @param {!object} args - Container object for all other params.
 * @param {!string} args.conn - MySQL connection
 *
 * @throws {INVALID_PARAMS} Throws an error if args does not contain required arguements
 * @returns {Promise<Array<Product>>}
 */
module.exports.getAllProducts = async(args) => {
  if (isNullOrUndefined([args, args.conn]))
    throw errorNames.INVALID_PARAMS

  var sql = "SELECT * FROM product WHERE inventory_count > 0"

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, function (err, result, fields) {
      if (err) return reject(err)
      return resolve(result)
    });
  })
}

/**
 * Retrieves a product by ID
 *
 * @async
 * @param {!object} args - Container object for all other params.
 * @param {!string} args.conn - MySQL connection.
 * @param {!int}    args.productId - ID of the product to be retrieved.
 *
 * @throws {INVALID_PARAMS} Throws an error if args does not contain required arguements
 * @returns {Promise<Product>}
 */
module.exports.getProductById = async(args) => {
  if (isNullOrUndefined([args, args.conn, args.productId]))
    throw errorNames.INVALID_PARAMS

  var sql = "SELECT * FROM product WHERE id = ?"
  var sqlArgs = [args.productId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function (err, result, fields) {
      if (err) return reject(err)

      if (isNullOrUndefined(result) || result.length == 0)
        resolve(null)

      else resolve(result[0])
    })
  })
}

/**
 * Retrieves all products with IDs in productIds
 *
 * @async
 * @param {!object} args - Container object for all other params.
 * @param {!string} args.conn - MySQL connection.
 * @param {!int}    args.productIds - Array of IDs of the products to be retrieved.
 *
 * @throws {INVALID_PARAMS} Throws an error if args does not contain required arguements
 * @returns {Promise<Array<Product>>}
 */
module.exports.getProductsById = async(args) => {
  if (isNullOrUndefined([args, args.conn, args.productIds]))
    throw errorNames.INVALID_PARAMS

  var sql = "SELECT * FROM product WHERE id IN (?)"
  var sqlArgs = [args.productIds]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function (err, result, fields) {
      if (err) return reject(err)

      resolve(result)
    })
  })
}

/**
 * Decreases inventory of a product with ID productId
 *
 * @async
 * @param {!string} conn - MySQL connection.
 * @param {!int}    productId - ID of the product to be updated.
 * @param {!int}    amount - amount to decrease inventory by
 *
 * @throws {INVALID_PARAMS} Throws an error if arguements are undefined, or amount is negative
 * @throws {PRODUCT_DOES_NOT_EXIST} Throws an error if product cannot be found
 * @returns {Promise<Product>}
 */
module.exports.decreaseInventory = async(conn, productId, amount) => {
  if (isNullOrUndefined([conn, productId, amount]) || amount < 0)
    throw errorNames.INVALID_PARAMS

  var sql = "UPDATE product SET inventory_count = inventory_count - ? WHERE id = ?"
  var sqlArgs = [amount, productId]

  return new Promise( (resolve, reject) => {
    conn.query(sql, sqlArgs, function (err, result) {
      if (err) return reject(err)

      if (isNullOrUndefined(result) || result.length == 0)
        throw errorNames.PRODUCT_DOES_NOT_EXIST
      else
        resolve(result[0])
    })
  })
}
