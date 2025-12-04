import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import errorHandler from './middlewares/errorHandler.js'
import v1Routes from './routes/v1.js'

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1', v1Routes)
console.log('Routes loaded successfully.')

// Serializador JSON: convierte BigInt a string para evitar errores
app.set('json replacer', (key, value) => {
  return typeof value === 'bigint' ? value.toString() : value
})

// Salud básica
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Manejo de errores
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`)
})
