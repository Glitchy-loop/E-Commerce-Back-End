const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM users
    `)
    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

module.exports = router
