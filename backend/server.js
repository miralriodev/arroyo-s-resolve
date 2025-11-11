const express = require('express');
const app = express();
const port = 3000;
app.get('/api', (req, res) => res.json({ message: 'API V1 activa!' }));
app.listen(port, '0.0.0.0', () => console.log(`API en puerto ${port}`));