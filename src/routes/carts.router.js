import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

const cartManager = new CartManager('./src/data/carts.json');

router.get('/test', (req, res) => {
    res.json({
        message: 'Carrito router funcionando',
        status: 'success'
    });
});

//---crear carrito--->



router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            payload: newCart
        });
    } catch (error) {
        console.error('Error creando carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creando carrito',
            error: error.message
        });
    }
});


//---get carrito--->



router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        
        console.log(`Buscando carrito con ID: ${cid}`);
        
        const cart = await cartManager.getCartById(cid);
        
        console.log(`Carrito encontrado:`, cart);
        
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: `Carrito con ID ${cid} no encontrado`
            });
        }

        res.json({
            status: 'success',
            payload: cart.products
        });
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error obteniendo carrito',
            error: error.message
        });
    }
});

//---agrregar productos--->



router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        console.log(`Intentando agregar producto ${pid} al carrito ${cid}`); 
        
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        
        console.log(`Producto agregado exitosamente:`, updatedCart);
        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: updatedCart
        });
    } catch (error) {
        console.error('Error agregando producto al carrito:', error);
        if (error.message.includes('no encontrado')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        
        res.status(500).json({
            status: 'error',
            message: 'Error agregando producto al carrito',
            error: error.message
        });
    }
});

export default router;