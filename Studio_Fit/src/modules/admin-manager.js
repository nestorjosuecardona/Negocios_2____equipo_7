// Módulo de administración de productos
import { productsData } from '../data/products.js';

// Sistema de persistencia en localStorage
const ADMIN_STORAGE_KEY = 'studiofit_admin_products';

// Obtener productos del localStorage o usar los datos por defecto
export function getAdminProducts() {
  const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return productsData;
}

// Guardar productos en localStorage
export function saveAdminProducts(products) {
  localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(products));
}

// Agregar un nuevo producto
export function addProduct(productData) {
  const products = getAdminProducts();
  const newId = Math.max(...products.map(p => p.id), 0) + 1;
  
  const newProduct = {
    id: newId,
    name: productData.name,
    price: `$${productData.price}`,
    emoji: productData.emoji || '📦',
    image: productData.image,
    description: productData.description,
    badge: productData.badge || null,
    badgeType: productData.badgeType || null
  };

  products.push(newProduct);
  saveAdminProducts(products);
  
  // Actualizar también en el estado de la app si es necesario
  if (productsData.length < products.length) {
    products.forEach((p, idx) => {
      if (idx < productsData.length) {
        productsData[idx] = p;
      } else {
        productsData.push(p);
      }
    });
  }
  
  return newProduct;
}

// Actualizar un producto existente
export function updateProduct(productId, productData) {
  const products = getAdminProducts();
  const index = products.findIndex(p => p.id === productId);
  
  if (index === -1) {
    console.error('Producto no encontrado');
    return null;
  }

  products[index] = {
    ...products[index],
    name: productData.name,
    price: `$${productData.price}`,
    emoji: productData.emoji || '📦',
    image: productData.image,
    description: productData.description,
    badge: productData.badge || null,
    badgeType: productData.badgeType || null
  };

  saveAdminProducts(products);
  return products[index];
}

// Eliminar un producto
export function deleteProduct(productId) {
  const products = getAdminProducts();
  const filtered = products.filter(p => p.id !== productId);
  saveAdminProducts(filtered);
  
  // Actualizar también en productsData
  const globalIndex = productsData.findIndex(p => p.id === productId);
  if (globalIndex !== -1) {
    productsData.splice(globalIndex, 1);
  }
  
  return true;
}

// Renderizar la cuadrícula de productos en el panel admin
export function renderAdminProducts() {
  const products = getAdminProducts();
  const grid = document.getElementById('adminProductsGrid');
  
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<div class="empty-products"><p>No hay productos registrados. ¡Agrega uno para comenzar!</p></div>';
    return;
  }

  grid.innerHTML = products.map(product => `
    <div class="admin-product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image-admin" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Imagen'">
      <div class="admin-product-info">
        <div class="admin-product-name">${product.name}</div>
        <div class="admin-product-price">${product.price}</div>
        <div class="admin-product-description">${product.description}</div>
        <div class="admin-product-actions">
          <button class="btn-edit-admin" onclick="app.editProduct(${product.id})">Editar</button>
          <button class="btn-delete-admin" onclick="app.deleteProduct(${product.id})">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Mostrar modal de edición
export function showEditModal(productId) {
  const products = getAdminProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    console.error('Producto no encontrado');
    return;
  }

  const price = product.price.replace('$', '');
  const badgeValue = product.badgeType || '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'editProductModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0;">Editar Producto</h2>
        <button onclick="document.getElementById('editProductModal').remove()" style="background: none; border: none; color: var(--primary-gold, #d4af37); font-size: 1.5rem; cursor: pointer;">✕</button>
      </div>

      <form id="editProductForm" class="product-form" style="margin-bottom: 1.5rem;">
        <div class="form-group">
          <label for="editProductName">Nombre</label>
          <input type="text" id="editProductName" value="${product.name}" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="editProductPrice">Precio ($)</label>
            <input type="number" id="editProductPrice" value="${price}" min="1" required>
          </div>
          <div class="form-group">
            <label for="editProductEmoji">Emoji</label>
            <input type="text" id="editProductEmoji" value="${product.emoji}" maxlength="2">
          </div>
        </div>

        <div class="form-group">
          <label for="editProductImage">URL de Imagen</label>
          <input type="url" id="editProductImage" value="${product.image}" required>
        </div>

        <div class="form-group">
          <label for="editProductDescription">Descripción</label>
          <textarea id="editProductDescription" rows="3" required>${product.description}</textarea>
        </div>

        <div class="form-group">
          <label for="editProductBadge">Badge</label>
          <select id="editProductBadge">
            <option value="">Ninguno</option>
            <option value="offer" ${badgeValue === 'offer' ? 'selected' : ''}>En oferta</option>
            <option value="new" ${badgeValue === 'new' ? 'selected' : ''}>Nuevo</option>
          </select>
        </div>
      </form>

      <div class="modal-buttons" style="flex-direction: row;">
        <button class="btn-confirm" onclick="app.saveProductChanges(${productId})">Guardar</button>
        <button class="btn-cancel" onclick="document.getElementById('editProductModal').remove()">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}
