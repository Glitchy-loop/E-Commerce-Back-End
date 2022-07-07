const express = require('express')
const cors = require('cors')
const { serverPort } = require('./config')
const userRoutes = require('./routes/v1/users')
const productRoutes = require('./routes/v1/products')
const orderRoutes = require('./routes/v1/orders')
const app = express()

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())

app.get('/', (req, res) => {
  return res.status(200).send('Server is running...')
})

app.use('/v1/users', userRoutes)
app.use('/v1/products', productRoutes)
app.use('/v1/orders', orderRoutes)

app.all('*', (req, res) => {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    req.header('access-control-request-headers')
  )

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send()
  } else {
    // Route logika
    return res.stastus(404).send('Page not found...')
  }
})

app.listen(serverPort, () =>
  console.log(`Server is running on port ${serverPort}`)
)
