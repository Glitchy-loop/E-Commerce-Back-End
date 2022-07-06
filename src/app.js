const express = require('express')
const cors = require('cors')
// const { serverPort } = require('./config')
const userRoutes = require('./routes/v1/users')
const productRoutes = require('./routes/v1/products')
const orderRoutes = require('./routes/v1/orders')
const app = express()

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  return res.status(200).send('Server is running...')
})

app.use('/v1/users', userRoutes)
app.use('/v1/products', productRoutes)
app.use('/v1/orders', orderRoutes)

app.all('*', (req, res) => {
  return res.status(404).send('Page not found...')
})

const PORT = process.env.PORT || '8080'

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server is running on port ${PORT}`)
)
