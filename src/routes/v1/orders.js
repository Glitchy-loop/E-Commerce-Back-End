const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const isLoggedIn = require('../../middleware/auth')

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM orders
    `)
    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Add new order
router.post('/add', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    INSERT INTO orders (userId, productId)
    VALUES (${mysql.escape(req.body.userId)}, ${mysql.escape(
      req.body.productId
    )})
    `)

    if (!data.insertId || data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }

    await connection.end()
    res.status(200).send({ msg: 'Successfully added an order.' })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get order by id
router.get('/order/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT * FROM orders
      WHERE id = ${mysql.escape(req.params.id)}
      LIMIT 1
    `)

    if (data.length === 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: `No orders found with ID '${req.params.id}'.` })
    }

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Get all orders for admin
router.get('/all', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT orders.id AS orderId, users.email, products.title, products.price, orders.timestamp
    FROM orders
      INNER JOIN users 
        ON orders.userId=users.id
      INNER JOIN products 
        ON orders.productId=products.id
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ err: 'No orders found.' })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get all orders for customer
router.get('/customer/:id', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT orders.id AS orderId, users.email, products.title, products.price, orders.timestamp
    FROM orders
      INNER JOIN products 
        ON orders.productId=products.id
      INNER JOIN users
        ON orders.userId=users.id

    WHERE ${mysql.escape(req.params.id)}=orders.userId
    `)

    if (data.length === 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: `No orders found with ID '${req.params.id}'.` })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

module.exports = router