const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const bcrypt = require('bcrypt')
const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT name, email FROM users
    `)
    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Register new user
router.post('/register', async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10)

    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
        INSERT INTO users (name, email, password, admin)
        VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(
      req.body.email
    )}, '${hash}', ${mysql.escape(req.body.admin)})
        `)

    if (!data.insertId || data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }

    await connection.end()
    return res.status(200).send({
      msg: 'Successfully created account',
      accountId: data.insertId
    })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

module.exports = router
