import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');

//---get productos--->



router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json({
            status: 'success',
            payload: products
        });
    } catch (error) {
        console.error('Error en GET /products:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

//---por id--->
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: `Producto con ID ${pid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            payload: product
        });
    } catch (error) {
        console.error('Error en GET /products/:pid:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

//---post producto--->



router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = await productManager.addProduct(productData);
        
        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            payload: newProduct
        });
    } catch (error) {
        console.error('Error en POST /products:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

//---modificar producto--->



router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedFields = req.body;
        
        const updatedProduct = await productManager.updateProduct(pid, updatedFields);
        
        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente',
            payload: updatedProduct
        });
    } catch (error) {
        console.error('Error en PUT /products/:pid:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

//---del prod--->
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await productManager.deleteProduct(pid);
        
        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente',
            payload: deletedProduct
        });
    } catch (error) {
        console.error('Error en DELETE /products/:pid:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

export default router;