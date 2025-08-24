import fs from 'fs/promises';
import path from 'path';

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.carts = [];
        this.lastId = 0;
    }

    //---crear dir---->



    async ensureDirectoryExists() {
        const dir = path.dirname(this.path);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    //---cargar carritos---->



    async loadCarts() {
        try {
            await this.ensureDirectoryExists();
            const data = await fs.readFile(this.path, 'utf-8');
            const parsedData = JSON.parse(data);
            this.carts = parsedData.carts || [];
            this.lastId = parsedData.lastId || 0;
        } catch (error) {
            this.carts = [];
            this.lastId = 0;
            await this.saveCarts();
        }
    }

    //---guardar carrito--->



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

    //---crear carrito--->



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

    //---carrito por id--->
    async getCartById(id) {
        await this.loadCarts();
        const cart = this.carts.find(c => c.id == id);
        return cart || null;
    }

    //---agregar al carrito--->



    async addProductToCart(cartId, productId) {
        await this.loadCarts();

        const cartIndex = this.carts.findIndex(c => c.id == cartId);
        if (cartIndex === -1) {
            throw new Error(`Carrito con ID ${cartId} no encontrado`);
        }

        const cart = this.carts[cartIndex];
        
        
        const existingProductIndex = cart.products.findIndex(p => p.product == productId);

        if (existingProductIndex !== -1) {
           
            cart.products[existingProductIndex].quantity += 1;
        } else {
            
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