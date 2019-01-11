/**
 * @author Ethan Prentice
 * @fileoverview Module
 * @module Cart
 */

const mysql       = require('mysql')
const errorNames  = require('../errors.js').errorNames
const Product     = require('./product.js')

var Cart = module.exports

/**
 * Checks if a cart exists in the database.
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection.
 * @param {!int}    cartId - ID of the cart to be validated.
 *
 * @returns {!boolean} True if cart exists, else false.
 */
module.exports.cartExists = async(args) => {
  var sql = "SELECT * FROM cart WHERE id = ?"
  var sqlArgs = [args.cartId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function (err, result, fields) {
      if (err)
        return reject(err)

      if (result != undefined && result.length != 0)
        resolve(true)
      else
        resolve(false)
    })
  })
}

/**
 * Retrieves a cart from the database.
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection.
 * @param {!int}    cartId - ID of the cart to be retrieved.
 *
 * @throws CART_DOES_NOT_EXIST
 * @returns {Cart} Cart with ID cartID, if does not exist throws error.
 */
module.exports.get = async(args) => {
  var cart = { id: args.cartId, products: [], totalPrice: 0}
  var sql = "SELECT cp.productId AS id, cp.qty, p.name, p.price, p.inventory_count " +
            "FROM cart_product cp " +
            "INNER JOIN product p ON cp.productId = p.id " +
            "WHERE cp.cartId = ?"
  var sqlArgs = [cart.id]

  if (!(await Cart.cartExists(args)))
    throw errorNames.CART_DOES_NOT_EXIST

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function (err, result, fields) {
      if (err) return reject(err)

      for (let i=0; i<result.length; i++) {
        let r = result[i]
        r.subtotal = Number((r.qty * r.price).toFixed(2))
        cart.totalPrice += r.subtotal
      }

      // convert to have a maximum of two decimal places
      cart.totalPrice = Number(cart.totalPrice.toFixed(2))

      cart.products = result

      resolve(cart)
    })
  })

}

/**
 * Inserts a new, empty cart into the database
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 *
 * @returns {Cart} Recently created cart
 */
module.exports.create = async(args) => {
  var sql = "INSERT INTO cart () VALUES ()"

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, function(err, result) {
      if (err) return reject(err)

      // resolve with default cart with auto-incremented id
      resolve({ id: result.insertId, products: [], totalPrice: 0})
    })
  })
}

/**
 * Checks if a product is already in the cart
 * Used to decide whether to create a new entry when increasing quantities
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 * @param {!int}    productId - ID of the product to check
 *
 * @returns {Product|boolean} if the product exists, return it.  Else return false
 */
module.exports.productExistsInCart = async(args) => {
  var sql = "SELECT * FROM cart_product WHERE cartId = ? AND productId = ?"
  var sqlArgs = [args.cartId, args.productId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function(err, result) {
      if (err) return reject(err)

      if (result != undefined && result.length != 0)
        resolve(result[0])
      else
        resolve(false)
    })
  })
}

/**
 * Increases the quantity of a product already contained in a cart
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 * @param {!int}    productId - ID of the product to check
 * @param {!int}    qty - The amount to offset the current quantity by (use decreaseQty instead of negatives)
 *
 * @throws PRODUCT_DOES_NOT_EXIST
 * @returns {Cart} Returns the cart that contains the modified product quantity
 */
module.exports.increaseQty = async(args) => {
  var sql = "UPDATE cart_product SET qty = qty + ? WHERE cartId = ? AND productId = ?"
  var sqlArgs = [args.qty, args.cartId, args.productId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function(err, result) {
      if (err) return reject(err)

      if (result == undefined || result.length == 0)
        throw errorNames.PRODUCT_DOES_NOT_EXIST
      else
        resolve(Cart.get(args))
    })
  })
}

/**
 * Decreases the quantity of a product already contained in a cart
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 * @param {!int}    productId - ID of the product to check
 * @param {!int}    qty - The amount to offset the current quantity by (use increaseQty instead of negatives)
 *
 * @throws PRODUCT_DOES_NOT_EXIST
 * @returns {Cart} Returns the cart that contains the modified product quantity
 */
module.exports.decreaseQty = async(args) => {
  var sql = "UPDATE cart_product SET qty = qty - ? WHERE cartId = ? AND productId = ?"
  var sqlArgs = [args.qty, args.cartId, args.productId]

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function(err, result) {
      if (err) return reject(err)

      if (result == undefined || result.length == 0)
        throw errorNames.PRODUCT_DOES_NOT_EXIST
      else
        resolve(Cart.get(args))
    })
  })
}

/**
 * Adds a product to the cart (or increases the quantity if it already exist in the cart)
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 * @param {!int}    productId - ID of the product to check
 * @param {!int}    qty - The amount to offset the current quantity by (use rmvProduct instead of negatives)
 *
 * @throws CART_DOES_NOT_EXIST
 * @throws PRODUCT_DOES_NOT_EXIST
 * @returns {Cart} Returns the cart that contains the added / updated product quantity
 */
module.exports.addProduct = async(args) => {
  if (args.qty < 0) {
    args.qty *= -1
    return Cart.rmvProduct(args)
  }

  // if product is already in cart just update the entry
  if (await Cart.productExistsInCart(args))
    return await Cart.increaseQty(args)

  if (!(await Cart.cartExists(args)))
    throw errorNames.CART_DOES_NOT_EXIST

  if (!(await Product.getProductById(args)))
    throw errorNames.PRODUCT_DOES_NOT_EXIST

  var sql = "INSERT INTO cart_product (cartId, productId, qty) VALUES (?, ?, ?)"
  var sqlArgs = [args.cartId, args.productId, args.qty].map(mysql.escape)

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function(err, result) {
      if (err) return reject(err)

      resolve(Cart.get(args))
    })
  })
}

/**
 * Decreases the quantity of the product in the cart and removes the product if quantity reaches zero
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 * @param {!int}    productId - ID of the product to check
 * @param {!int}    qty - The amount to offset the current quantity by (use addProduct instead of negatives)
 *
 * @throws CART_DOES_NOT_EXIST
 * @throws PRODUCT_DOES_NOT_EXIST
 * @returns {Cart} Returns the cart that contains the removed / updated product quantity
 */
module.exports.rmvProduct = async(args) => {
  if (args.qty < 0) {
    args.qty *= -1
    return Cart.addProduct(args)
  }

  if (!(await Cart.cartExists(args)))
    throw errorNames.CART_DOES_NOT_EXIST

  if (!(await Product.getProductById(args)))
    throw errorNames.PRODUCT_DOES_NOT_EXIST

  // if product is not in cart we can't reduce qty
  var cartProduct = await Cart.productExistsInCart(args)
  if (cartProduct) {
    // don't want qty to be negative
    if (args.qty >= cartProduct.qty) {
      var sql = "DELETE FROM cart_product WHERE cartID = ? AND productID = ?"
      var sqlArgs = [args.cartId, args.productId]

      return new Promise( (resolve, reject) => {
        args.conn.query(sql, sqlArgs, function(err, result) {
          if (err) return reject(err)
          resolve(Cart.get(args))
        })
      })
    }
    else return await Cart.decreaseQty(args)
  }
  else return Cart.get(args)
}

/**
 * Removes all products from a cart
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 *
 * @throws CART_DOES_NOT_EXIST
 * @returns {Cart} Returns the cart that's been cleared
 */
module.exports.clear = async(args) => {
  var sql = "DELETE FROM cart_product WHERE cartId = ?"
  var sqlArgs = [args.cartId]

  if (!(await Cart.cartExists(args)))
    throw errorNames.CART_DOES_NOT_EXIST

  return new Promise( (resolve, reject) => {
    args.conn.query(sql, sqlArgs, function(err, result) {
      if (err) return reject(err)

      resolve(Cart.get(args))
    })
  })
}

/**
 * Validates the cart by checking inventory.  If valid, decrease product inventories and clear the cart.
 * @param {!object} args - Container object for all other params.  Other params MUST be in this object.
 * @param {!string} conn - MySQL connection
 * @param {!int}    cartId - ID of the cart to check
 *
 * @throws EXCEEDS_INVENTORY
 * @returns {Cart} Returns the cart that's been checked out
 */
module.exports.checkout = async(args) => {
  var cart = await Cart.get(args)

  for (let i=0; i<cart.products.length; i++) {
    let product = cart.products[i]
    if (product.qty > product.inventory_count) {
      throw errorNames.EXCEEDS_INVENTORY
    }
  }

  for (let i=0; i<cart.products.length; i++) {
    let product = cart.products[i]
    Product.decreaseInventory(args.conn, product.id, product.qty)
  }

  Cart.clear(args)

  return Cart.get(args)
}
