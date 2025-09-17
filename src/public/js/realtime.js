
const socket = io();


const connectionStatus = document.getElementById('connectionStatus');
const productForm = document.getElementById('productForm');
const productsContainer = document.getElementById('productsContainer');
const productCount = document.getElementById('productCount');
const toast = new bootstrap.Toast(document.getElementById('toast'));


socket.on('connect', () => {
    console.log('🔌 Conectado al servidor');
    updateConnectionStatus(true);
    socket.emit('join-products');
});

socket.on('disconnect', () => {
    console.log('❌ Desconectado del servidor');
    updateConnectionStatus(false);
});


function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatus.textContent = '🟢 Conectado';
        connectionStatus.className = 'connection-status connected';
    } else {
        connectionStatus.textContent = '🔴 Desconectado';
        connectionStatus.className = 'connection-status disconnected';
    }
}


productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productData = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: parseFloat(formData.get('price')),
        stock: parseInt(formData.get('stock')),
        category: formData.get('category'),
        status: formData.get('status') === 'on',
        thumbnails: formData.get('thumbnails') ? 
            formData.get('thumbnails').split(',').map(url => url.trim()) : []
    };


    socket.emit('create-product', productData);
});


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
        const button = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
        const productId = button.getAttribute('data-product-id');
        
        if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            socket.emit('delete-product', productId);
        }
    }
});


socket.on('product-created', (response) => {
    if (response.status === 'success') {
        showToast('✅', 'Éxito', 'Producto creado correctamente', 'success');
        productForm.reset();
    }
});

socket.on('product-deleted', (response) => {
    if (response.status === 'success') {
        showToast('🗑️', 'Eliminado', 'Producto eliminado correctamente', 'success');
    }
});

socket.on('product-error', (response) => {
    showToast('❌', 'Error', response.message, 'danger');
});


socket.on('products-updated', async () => {
    console.log('🔄 Actualizando lista de productos...');
    await loadProducts();
});


async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        
        if (data.status === 'success') {
            renderProducts(data.payload);
            updateProductCount(data.payload.length);
        } else {
            console.error('Error cargando productos:', data.message);
        }
    } catch (error) {
        console.error('Error en la petición:', error);
    }
}


function renderProducts(products) {
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div id="emptyState" class="text-center py-5">
                <div class="mb-4">
                    <span style="font-size: 4rem;">📦</span>
                </div>
                <h3 class="text-muted">No hay productos disponibles</h3>
                <p class="text-muted">Usa el formulario de arriba para crear productos en tiempo real</p>
            </div>
        `;
        return;
    }

    const productsHTML = products.map(product => `
        <div class="col-md-6 col-lg-4 mb-4" data-product-id="${product.id}">
            <div class="card product-card h-100">
                ${product.thumbnails && product.thumbnails.length > 0 ? `
                <div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
                    <span class="text-muted">📷 ${product.thumbnails.length} imagen(es)</span>
                </div>
                ` : ''}
                
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title text-primary">${product.title}</h5>
                        ${product.status ? 
                            '<span class="badge bg-success status-badge">Disponible</span>' : 
                            '<span class="badge bg-danger status-badge">No disponible</span>'
                        }
                    </div>
                    
                    <p class="card-text text-muted">${product.description}</p>
                    
                    <div class="row text-center mb-3">
                        <div class="col-4">
                            <strong class="text-success">$${product.price}</strong>
                            <br><small class="text-muted">Precio</small>
                        </div>
                        <div class="col-4">
                            <strong class="text-info">${product.stock}</strong>
                            <br><small class="text-muted">Stock</small>
                        </div>
                        <div class="col-4">
                            <strong class="text-warning">ID: ${product.id}</strong>
                            <br><small class="text-muted">${product.code}</small>
                        </div>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-secondary">${product.category}</span>
                        <button class="btn btn-danger btn-sm delete-btn" data-product-id="${product.id}">
                            🗑️ Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    productsContainer.innerHTML = `<div class="row" id="productsList">${productsHTML}</div>`;
}


function updateProductCount(count) {
    productCount.textContent = `${count} productos`;
}

function showToast(icon, title, message, type = 'info') {
    const toastIcon = document.getElementById('toastIcon');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const toastElement = document.getElementById('toast');

    toastIcon.textContent = icon;
    toastTitle.textContent = title;
    toastBody.textContent = message;


    toastElement.className = `toast border-${type === 'success' ? 'success' : type === 'danger' ? 'danger' : 'info'}`;

    toast.show();
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Cliente de tiempo real iniciado');
});