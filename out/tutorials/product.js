/**
 * @author Ethan Prentice
 * @fileoverview Module
 * @module Product
 */

const errorNames  = require('../errors.js').errorNames

var Product = module.exports

/**
 * Retrieves all products with an inventory greater than zero
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 */
module.exports.getAllProducts = async(args) => {
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
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection.
 * @param {!int}    productId - ID of the product to be retrieved.
 *
 * @returns Product with ID productId. If none found returns null
 */
module.exports.getProductById = async(args) => {
  var sql = "SELECT * FROM product WHERE id = ?"
  var sqlArgs = [args.productId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function (err, result, fields) {
      if (err) return reject(err)

      if (result == undefined || result.length == 0)
        resolve(null)

      else resolve(result[0])
    })
  })
}

/**
 * Retrieves all products with IDs in productIds
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection.
 * @param {!int}    productIds - Array of IDs of the products to be retrieved.
 *
 * @returns Array of all products found.  If none found returns [].
 */
module.exports.getProductsById = async(args) => {
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
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection.
 * @param {!int}    productId - ID of the product to be updated.
 *
 * @throws PRODUCT_DOES_NOT_EXIST
 * @returns Array of all products found.  If none found throws an error.
 */
module.exports.decreaseInventory = async(conn, productId, amount) => {
  var sql = "UPDATE product SET inventory_count = inventory_count - ? WHERE id = ?"
  var sqlArgs = [amount, productId]

  return new Promise( (resolve, reject) => {
    conn.query(sql, sqlArgs, function (err, result) {
      if (err) return reject(err)

      if (result == undefined || result.length == 0)
        throw errorNames.PRODUCT_DOES_NOT_EXIST
      else
        resolve(result[0])
    })
  })
}
