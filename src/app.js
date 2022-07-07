const express = require('express')
const cors = require('cors')
const { serverPort } = require('./config')
const userRoutes = require('./routes/v1/users')
const productRoutes = require('./routes/v1/products')
const orderRoutes = require('./routes/v1/orders')

const app = express()

const whitelist = [
  'https://comfort-e-commerce-front.web.app/',
  'https://img-bucket-13378.s3.amazonaws.com/images'
]

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error())
    }
  }
}

app.use(express.json())
app.use(cors(corsOptions))

app.get('/', (req, res) => {
  return res.status(200).send('Server is running...')
})

app.use('/v1/users', userRoutes)
app.use('/v1/products', productRoutes)
app.use('/v1/orders', orderRoutes)

app.all('*', (req, res) => {
  return res.status(404).send('Page not found...')
})

app.listen(serverPort, () =>
  console.log(`Server is running on port ${serverPort}`)
)
