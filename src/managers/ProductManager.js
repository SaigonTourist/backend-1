import fs from 'fs/promises';
import path from 'path';

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
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

    // Cargar productos desde el archivo
    async loadProducts() {
        try {
            await this.ensureDirectoryExists();
            const data = await fs.readFile(this.path, 'utf-8');
            const parsedData = JSON.parse(data);
            this.products = parsedData.products || [];
            this.lastId = parsedData.lastId || 0;
        } catch (error) {
            // Si el archivo no existe o está corrupto, inicializar vacío
            this.products = [];
            this.lastId = 0;
            await this.saveProducts();
        }
    }

    // Guardar productos en el archivo
    async saveProducts() {
        try {
            await this.ensureDirectoryExists();
            const dataToSave = {
                products: this.products,
                lastId: this.lastId
            };
            await fs.writeFile(this.path, JSON.stringify(dataToSave, null, 2));
        } catch (error) {
            console.error('Error guardando productos:', error);
            throw error;
        }
    }

    // Obtener todos los productos
    async getProducts() {
        await this.loadProducts();
        return this.products;
    }

    // Obtener producto por ID
    async getProductById(id) {
        await this.loadProducts();
        const product = this.products.find(p => p.id == id);
        return product || null;
    }

    // Agregar un nuevo producto
    async addProduct(productData) {
        await this.loadProducts();

        // Validar campos requeridos
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (productData[field] === undefined || productData[field] === null || productData[field] === '') {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        // Validar que el código no se repita
        const existingProduct = this.products.find(p => p.code === productData.code);
        if (existingProduct) {
            throw new Error(`Ya existe un producto con el código: ${productData.code}`);
        }

        // Crear nuevo producto
        const newProduct = {
            id: ++this.lastId,
            title: productData.title,
            description: productData.description,
            code: productData.code,
            price: Number(productData.price),
            status: productData.status !== undefined ? Boolean(productData.status) : true,
            stock: Number(productData.stock),
            category: productData.category,
            thumbnails: Array.isArray(productData.thumbnails) ? productData.thumbnails : []
        };

        this.products.push(newProduct);
        await this.saveProducts();
        return newProduct;
    }

    // Actualizar producto
    async updateProduct(id, updatedFields) {
        await this.loadProducts();

        const productIndex = this.products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        // No permitir actualizar el ID
        if (updatedFields.id !== undefined) {
            delete updatedFields.id;
        }

        // Validar código único si se está actualizando
        if (updatedFields.code) {
            const existingProduct = this.products.find(p => p.code === updatedFields.code && p.id != id);
            if (existingProduct) {
                throw new Error(`Ya existe otro producto con el código: ${updatedFields.code}`);
            }
        }

        // Actualizar solo los campos proporcionados
        const updatedProduct = { ...this.products[productIndex] };
        
        Object.keys(updatedFields).forEach(key => {
            if (updatedFields[key] !== undefined) {
                updatedProduct[key] = updatedFields[key];
            }
        });

        this.products[productIndex] = updatedProduct;
        await this.saveProducts();
        return updatedProduct;
    }

    // Eliminar producto
    async deleteProduct(id) {
        await this.loadProducts();

        const productIndex = this.products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        const deletedProduct = this.products.splice(productIndex, 1)[0];
        await this.saveProducts();
        return deletedProduct;
    }
}

export default ProductManager;