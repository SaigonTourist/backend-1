import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');


router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        
        res.render('home', {
            title: 'Productos - E-commerce',
            products: products,
        });
    } catch (error) {
        console.error('Error cargando productos para vista home:', error);
        res.render('home', {
            title: 'Productos - E-commerce',
            products: [],
            error: 'Error cargando productos'
        });
    }
});


router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        
        res.render('realTimeProducts', {
            title: 'Productos en Tiempo Real - E-commerce',
            products: products,
            realtime: true,
        });
    } catch (error) {
        console.error('Error cargando productos para vista en tiempo real:', error);
        res.render('realTimeProducts', {
            title: 'Productos en Tiempo Real - E-commerce',
            products: [],
            realtime: true,
            error: 'Error cargando productos'
        });
    }
});

export default router;