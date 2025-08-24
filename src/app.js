import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;

app.use(express.json());

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta básica
app.get('/', (req, res) => {
    res.json({ message: 'API funcionando' });
});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});