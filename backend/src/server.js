const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Configuración
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(morgan('dev'));

// Rate Limiter aplicado a /api
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite por IP
});
app.use('/api', apiLimiter);

// Rutas v1
const v1Routes = require('./routes/v1');
app.use('/api/v1', v1Routes);

// Manejador de errores al final
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API escuchando en puerto ${PORT}`);
});