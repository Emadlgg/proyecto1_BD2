const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/admin')

const app = express();
app.use(cors());
app.use(express.json());

// Routes (las iremos agregando aquí)
app.use('/api/restaurantes', require('./routes/restaurantes'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/ordenes', require('./routes/ordenes'));
app.use('/api/resenas', require('./routes/resenas'));
app.use('/api/reportes', require('./routes/reportes'));
app.use('/api/archivos', require('./routes/archivos'));
app.use('/api/admin', adminRoutes)

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });