import fs from 'fs/promises';
import path from 'path';

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.lastId = 0;
    }

    // Crear directorio si no existe
    async ensureDirectoryExists() {
        const dir = path.dirname(this.path);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    // Cargar carritos desde el archivo
    async loadCarts() {
        try {
            await this.ensureDirectoryExists();
            const data = await fs.readFile(this.path, 'utf-8');
            const parsedData = JSON.parse(data);
            this.carts = parsedData.carts || [];
            this.lastId = parsedData.lastId || 0;
        } catch (error) {
            // Si el archivo no existe o está corrupto, inicializar vacío
            this.carts = [];
            this.lastId = 0;
            await this.saveCarts();
        }
    }

    // Guardar carritos en el archivo
    async saveCarts() {
        try {
            await this.ensureDirectoryExists();
            const dataToSave = {
                carts: this.carts,
                lastId: this.lastId
            };
            await fs.writeFile(this.path, JSON.stringify(dataToSave, null, 2));
        } catch (error) {
            console.error('Error guardando carritos:', error);
            throw error;
        }
    }

    // Crear un nuevo carrito
    async createCart() {
        await this.loadCarts();

        const newCart = {
            id: ++this.lastId,
            products: []
        };

        this.carts.push(newCart);
        await this.saveCarts();
        return newCart;
    }

    // Obtener carrito por ID
    async getCartById(id) {
        await this.loadCarts();
        const cart = this.carts.find(c => c.id == id);
        return cart || null;
    }

    // Agregar producto al carrito
    async addProductToCart(cartId, productId) {
        await this.loadCarts();

        const cartIndex = this.carts.findIndex(c => c.id == cartId);
        if (cartIndex === -1) {
            throw new Error(`Carrito con ID ${cartId} no encontrado`);
        }

        const cart = this.carts[cartIndex];
        
        // Buscar si el producto ya existe en el carrito
        const existingProductIndex = cart.products.findIndex(p => p.product == productId);

        if (existingProductIndex !== -1) {
            // Si el producto ya existe, incrementar la cantidad
            cart.products[existingProductIndex].quantity += 1;
        } else {
            // Si el producto no existe, agregarlo con cantidad 1
            cart.products.push({
                product: parseInt(productId),
                quantity: 1
            });
        }

        this.carts[cartIndex] = cart;
        await this.saveCarts();
        return cart;
    }
}

export default CartManager;