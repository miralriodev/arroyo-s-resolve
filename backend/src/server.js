require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Serializador JSON: convierte BigInt a string para evitar errores
app.set('json replacer', (key, value) => {
  return typeof value === 'bigint' ? value.toString() : value
})

// Salud básica
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// API v1
const v1 = require('./routes/v1')
app.use('/api/v1', v1)

// Manejo de errores
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`)
})