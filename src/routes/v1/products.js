const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const multer = require('multer')
const isLoggedIn = require('../../middleware/auth')
const addProductSchema = require('../../middleware/schemas/productSchemas')
const validation = require('../../middleware/validation')

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './images'),
  filename: (req, file, cb) => cb(null, `${new Date().getTime()}.jpg`)
})

const path = require('path')
const upload = multer({ storage })
const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM products
    `)

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Add product
router.post(
  '/add',
  isLoggedIn,
  validation(addProductSchema),
  upload.single('img'),
  async (req, res) => {
    try {
      const connection = await mysql.createConnection(mysqlConfig)
      const [data] = await connection.execute(`
    INSERT INTO products (img, title, category, price, description)
    VALUES ('${req.file.filename}', ${mysql.escape(
        req.body.title
      )},${mysql.escape(req.body.category)},${mysql.escape(
        req.body.price
      )}, ${mysql.escape(req.body.description)})
    `)

      if (!data.insertId || data.affectedRows !== 1) {
        await connection.end()
        return res.status(500).send({ err: 'Server issue. Try again later.' })
      }

      await connection.end()
      return res.status(200).send({ msg: 'Successfully added a product.' })
    } catch (err) {
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }
  }
)

// Get product image by img id
router.get('/img/:id', (req, res) => {
  try {
    let reqPath = path.join(__dirname, '../../../images')
    const image = `${reqPath}/${req.params.id}`
    res.sendFile(image)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get product by id
router.get('/product/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT * FROM products
      WHERE id = ${mysql.escape(req.params.id)}
      LIMIT 1
    `)

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT category FROM products
    `)

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

module.exports = router
