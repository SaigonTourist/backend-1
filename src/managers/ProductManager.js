import fs from 'fs/promises';
import path from 'path';

class ProductManager {
    constructor(filePath) {
        this.path = filePath;
        this.products = [];
        this.lastId = 0;
    }

    //---dir--->



    async ensureDirectoryExists() {
        const dir = path.dirname(this.path);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    //---cargar productos--->
    async loadProducts() {
        try {
            await this.ensureDirectoryExists();
            const data = await fs.readFile(this.path, 'utf-8');
            const parsedData = JSON.parse(data);
            this.products = parsedData.products || [];
            this.lastId = parsedData.lastId || 0;
        } catch (error) {
            
            this.products = [];
            this.lastId = 0;
            await this.saveProducts();
        }
    }

    //---graurdar prodctos--->



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

    //---buscar productos--->



    async getProducts() {
        await this.loadProducts();
        return this.products;
    }

    //---por id--->
    async getProductById(id) {
        await this.loadProducts();
        const product = this.products.find(p => p.id == id);
        return product || null;
    }

    //---agregar prod--->



    async addProduct(productData) {
        await this.loadProducts();

        
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        for (const field of requiredFields) {
            if (productData[field] === undefined || productData[field] === null || productData[field] === '') {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        
        const existingProduct = this.products.find(p => p.code === productData.code);
        if (existingProduct) {
            throw new Error(`Ya existe un producto con el código: ${productData.code}`);
        }

        //---crear prod--->
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

    //---actualizar prod--->
    async updateProduct(id, updatedFields) {
        await this.loadProducts();

        const productIndex = this.products.findIndex(p => p.id == id);
        if (productIndex === -1) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        //--bloquear el id--->
        if (updatedFields.id !== undefined) {
            delete updatedFields.id;
        }

        
        if (updatedFields.code) {
            const existingProduct = this.products.find(p => p.code === updatedFields.code && p.id != id);
            if (existingProduct) {
                throw new Error(`Ya existe otro producto con el código: ${updatedFields.code}`);
            }
        }

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

    //---del prod--->
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