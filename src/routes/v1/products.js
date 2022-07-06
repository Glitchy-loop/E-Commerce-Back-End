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
const { s3Upload } = require('../../middleware/s3Service')
const upload = multer({ storage })
const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM products
    WHERE archived = 0
    `)

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get all products for cart by ids
router.get('/list/:ids', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM products WHERE ID IN (${req.params.ids})
    WHERE archived = 0
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(500).send({ err: `No data with IDs ${req.params.ids}` })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Add product
router.post(
  '/add',
  // isLoggedIn,
  // validation(addProductSchema),
  upload.array('file'),
  async (req, res) => {
    try {
      //   const connection = await mysql.createConnection(mysqlConfig)
      //   const [data] = await connection.execute(`
      // INSERT INTO products (img, title, category, price, description, inStock, archived)
      // VALUES ('${req.file.filename}', ${mysql.escape(
      //     req.body.title
      //   )},${mysql.escape(req.body.category)},${mysql.escape(
      //     req.body.price
      //   )}, ${mysql.escape(req.body.description)}
      //   , ${mysql.escape(req.body.inStock)}, 0
      //   )
      // `)

      //   if (!data.insertId || data.affectedRows !== 1) {
      //     await connection.end()
      //     return res.status(500).send({ err: 'Server issue. Try again later.' })
      //   }

      const file = req.files[0]
      console.log(file)
      const result = await s3Upload(file)
      console.log(result)
      res.json({ result })
      //   await connection.end()
      // return res.status(200).send({ msg: 'Successfully added a product.' })
    } catch (err) {
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }
  }
)

// Get product image by img ID
router.get('/img/:id', (req, res) => {
  try {
    let reqPath = path.join(__dirname, '../../../images')
    const image = `${reqPath}/${req.params.id}`
    res.sendFile(image)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get product by ID
router.get('/product/:id', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT * FROM products
      WHERE id = ${mysql.escape(req.params.id)}
      AND archived = 0
      LIMIT 1
    `)

    if (data.length === 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: `No products found with ID '${req.params.id}'.` })
    }

    await connection.end()
    return res.status(200).send(data[0])
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

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ err: 'No categories found.' })
    }

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Get product categories by category name
router.get('/categories/:name', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
      SELECT * FROM products
      WHERE category = ${mysql.escape(req.params.name)}
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ err: 'No categories found.' })
    }

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Delete product by ID
router.delete('/delete/:id', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    UPDATE products
    SET archived = 1
    WHERE id = ${mysql.escape(req.params.id)}
    `)

    if (data.affectedRows !== 1) {
      await connection.end()
      return res.status(400).send({
        err: `There is no product with ID ${mysql.escape(req.params.id)}.`
      })
    }

    await connection.end()
    return res.status(200).send({
      msg: `Product with ID ${req.params.id} was sucessfully DELETED.`
    })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Get products by search query
router.get('/search/:query', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM products
    WHERE archived = 0 AND
    title LIKE '%${req.params.query}%'
    OR category LIKE '%${req.params.query}%'
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({
        err: `No products found with search query: '${req.params.query}'`
      })
    }
    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

module.exports = router
