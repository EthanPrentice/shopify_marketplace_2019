/**
 * @author Ethan Prentice
 * @fileoverview Base file that runs server and contains GraphQL resolvers and schema
 * @global
 */

const express          = require('express')

const graphqlHTTP      = require('express-graphql')
const { buildSchema }  = require('graphql')

const mysql            = require('mysql')
const DB_CONFIG        = require('./config/db_schema.json')
const DB_AUTH          = require('./config/db_auth.json')

const Product          = require('./modules/product.js')
const Cart             = require('./modules/cart.js')

const getError         = require('./modules/errors.js').getError

var sqlConn = mysql.createConnection({
  host: "localhost",
  user: DB_AUTH.username,
  password: DB_AUTH.password,
  database: DB_CONFIG.db_name
});
sqlConn.connect()

const USE_GRAPHIQL = true

// Construct a schema, using GraphQL schema language

/** Schema for GraphQL */
var schema = buildSchema(`

  type Query {
    getCart(cartId: Int!): Cart
    allProducts: [Product]!
    getProduct(productId: Int!): Product
  }

  type Mutation {
    createCart: Cart
    addProductToCart(cartId: Int! productId: Int!, qty: Int!): Cart
    rmvProductFromCart(cartId: Int!, productId: Int!, qty: Int!): Cart
    clearCart(cartId: Int!): Cart
    checkoutCart(cartId: Int!): String
  }

  type Product {
    id: Int!
    name: String!
    price: Int!
    inventory_count: Int!

    qty: Int                # used when product is in cart
    subtotal: Int           # used when product is in cart
  }

  type Cart {
    id: Int!
    products: [Product]!
    totalPrice: Int!
  }

  type Error {
    errors: [String!]!
  }

`);

/** Object containing all the resolver functions for GraphQL queries and mutations */
var root = {
  // Queries
  allProducts: Product.getAllProducts({conn: sqlConn}),
  getCart: async(args) => {
    args.conn = sqlConn
    return await Cart.get(args)
  },
  getProduct: async(args) => {
    args.conn = sqlConn
    return await Product.getProductById(args)
  },

  // Mutations
  createCart: async(args) => {
    args.conn = sqlConn
    return Cart.create(args)
  },
  addProductToCart: async(args) => {
    args.conn = sqlConn
    return Cart.addProduct(args)
  },
  rmvProductFromCart: async(args) => {
    args.conn = sqlConn
    return Cart.rmvProduct(args)
  },
  clearCart: async(args) => {
    args.conn = sqlConn
    return Cart.clear(args)
  },
  checkoutCart: async(args) => {
    args.conn = sqlConn
    return Cart.checkout(args)
  }
};


// Start server (using express middleware)
var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  formatError: (err) => {
    return getError(err.message)
  },
  graphiql: USE_GRAPHIQL
}));

// Start the server on port 3000 of local machine
app.listen(3000)
console.log('Running a GraphQL API server at localhost:3000/graphql')
