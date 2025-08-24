import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();

// Usar CartManager para todo
const cartManager = new CartManager('./src/data/carts.json');

// Ruta de test
router.get('/test', (req, res) => {
    res.json({
        message: 'Carrito router funcionando',
        status: 'success'
    });
});

// POST /api/carts/ - Crear carrito
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

// GET /api/carts/:cid - Obtener carrito CON CartManager
// router.get('/:cid', async (req, res) => {  // ← async agregado
//     try {
//         const { cid } = req.params;
//         const cart = await cartManager.getCartById(cid);  // ← usando CartManager
        
//         if (!cart) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: `Carrito con ID ${cid} no encontrado`
//             });
//         }

//         res.json({
//             status: 'success',
//             payload: cart.products
//         });
//     } catch (error) {
//         console.error('Error obteniendo carrito:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Error obteniendo carrito',
//             error: error.message
//         });
//     }
// });

// GET /api/carts/:cid - Obtener carrito CON CartManager

router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        
        console.log(`Buscando carrito con ID: ${cid}`); // ← Debug
        
        const cart = await cartManager.getCartById(cid);
        
        console.log(`Carrito encontrado:`, cart); // ← Debug
        
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

// POST /api/carts/:cid/product/:pid - Agregar producto CON CartManager
// router.post('/:cid/product/:pid', async (req, res) => {  // ← async agregado
//     try {
//         const { cid, pid } = req.params;
        
//         const updatedCart = await cartManager.addProductToCart(cid, pid);  // ← usando CartManager
        
//         res.json({
//             status: 'success',
//             message: 'Producto agregado al carrito exitosamente',
//             payload: updatedCart
//         });
//     } catch (error) {
//         console.error('Error agregando producto al carrito:', error);
//         if (error.message.includes('no encontrado')) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: error.message
//             });
//         }
        
//         res.status(500).json({
//             status: 'error',
//             message: 'Error agregando producto al carrito',
//             error: error.message
//         });
//     }
// });

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        console.log(`Intentando agregar producto ${pid} al carrito ${cid}`); // ← Debug
        
        const updatedCart = await cartManager.addProductToCart(cid, pid);
        
        console.log(`Producto agregado exitosamente:`, updatedCart); // ← Debug
        
        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: updatedCart
        });
    } catch (error) {
        console.error('Error agregando producto al carrito:', error); // ← Más específico
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