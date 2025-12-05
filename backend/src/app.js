const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const errorHandler = require('./middlewares/errorHandler')
const v1 = require('./routes/v1')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.set('json replacer', (key, value) => {
  return typeof value === 'bigint' ? value.toString() : value
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/v1', v1)

app.use(errorHandler)

module.exports = app
