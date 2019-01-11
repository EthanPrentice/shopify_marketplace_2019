# Shopify Marketplace

A slick, new, cutting edge API that implements GraphQL and runs on NodeJS.

Developed as a part of the application process for Backend Developer Intern at Shopify for the Summer of 2019.

Note that this has only been tested using NodeJS 8.11, MySQL 5.7 and Windows 10.

## Installation

Must have MySQL, NodeJS and NPM already installed and in PATH.

Create a new schema called marketplace (you can call it whatever you want but will need to change db_name in config/db_schema.json).

Run the sql commands located in init_db.sql to create tables and insert some test products.

Change the parameters in config/db_auth.json to match your own credentials.
The database user will only need read/write permissions to marketplace (other than creating the schema and init_db.sql).

Install all required npm modules in package.json:
```bash
npm install
```

## Documentation

If you're viewing this on GitHub the documentation is located [here](http://htmlpreview.github.io/?https://github.com/EthanPrentice/shopify_marketplace_2019/blob/master/out/index.html).

If you're viewing this in the doc files, great job! You're already here!

To generate updated documentation after any changes run:
```bash
jsdoc -c config/jsdoc_conf.json -R README.md server.js modules/errors.js modules/cart.js modules/product.js.
```


## Usage

To start the server on localhost:3000/graphql run one of the following in the command line:
```bash
npm start
node server.js
```


## Testing

There are test queries located in query_template.sql that can be copy/pasted into GraphIQL.

Note that there are no currently provided unit tests, however you can change around the template to do all available queries and mutations.  There are errors coded into errors.js that should be thrown when items are unavailable or invalid arguements are provided.
Since GraphIQL is a nice interface and easy to use, I found verbose unit tests to be too time consuming for a small project.

## GraphQL Schema

I didn't know where to include this in the documentation so here's the GraphQL schema:
```schema
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
```
