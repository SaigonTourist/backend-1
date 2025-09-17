import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Crear servidor HTTP para Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Hacer io disponible en las rutas
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Configuración WebSockets
io.on('connection', (socket) => {
    console.log('🔌 Cliente conectado:', socket.id);

    socket.on('join-products', () => {
        console.log('👀 Cliente viendo productos en tiempo real');
    });

    // Crear producto via WebSocket
    socket.on('create-product', async (productData) => {
        try {
            console.log('📦 Creando producto via WebSocket:', productData);
            
            const { default: ProductManager } = await import('./managers/ProductManager.js');
            const productManager = new ProductManager('./src/data/products.json');
            
            const newProduct = await productManager.addProduct(productData);
            
            socket.emit('product-created', { 
                status: 'success', 
                message: `Producto "${newProduct.title}" creado exitosamente`
            });
            
            // Actualizar todos los clientes
            io.emit('products-updated');
            
        } catch (error) {
            console.error('❌ Error creando producto:', error);
            socket.emit('product-error', { 
                status: 'error', 
                message: error.message 
            });
        }
    });

    // Eliminar producto via WebSocket
    socket.on('delete-product', async (productId) => {
        try {
            console.log('🗑️ Eliminando producto via WebSocket:', productId);
            
            const { default: ProductManager } = await import('./managers/ProductManager.js');
            const productManager = new ProductManager('./src/data/products.json');
            
            const deletedProduct = await productManager.deleteProduct(productId);
            
            socket.emit('product-deleted', { 
                status: 'success', 
                message: `Producto "${deletedProduct.title}" eliminado exitosamente`
            });
            
            // Actualizar todos los clientes
            io.emit('products-updated');
            
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            socket.emit('product-error', { 
                status: 'error', 
                message: error.message 
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Cliente desconectado:', socket.id);
    });
});

app.get('/test', (req, res) => {
    res.json({ message: 'Test funcionando', timestamp: new Date() });
});

// Usar httpServer en lugar de app
httpServer.listen(PORT, () => {
    console.log(`🚀 Servidor con WebSockets en http://localhost:${PORT}`);
    console.log(`📦 API Productos: http://localhost:${PORT}/api/products`);
    console.log(`🛒 API Carritos: http://localhost:${PORT}/api/carts`);
    console.log(`🏠 Vista Home: http://localhost:${PORT}/`);
    console.log(`⚡ Vista Tiempo Real: http://localhost:${PORT}/realtimeproducts`);
});