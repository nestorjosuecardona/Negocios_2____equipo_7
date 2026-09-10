// Carga de vistas HTML
import { appState, getProductById, saveUser, getCurrentUser, logout, productsData } from '../data/products.js';

// Mapeo de vistas
const views = {
  home: '/src/views/home.html',
  landing: '/src/views/landing.html',
  catalog: '/src/views/catalog.html',
  classes: '/src/views/classes.html',
  product: '/src/views/product-detail.html',
  about: '/src/views/about.html',
  contact: '/src/views/contact-page.html',
  register: '/src/views/register.html',
  login: '/src/views/login.html',
  dashboard: '/src/views/dashboard.html',
  profile: '/src/views/profile.html',
  admin: '/src/views/admin.html',
  promotions: '/src/views/promotions.html',
  showcase: '/src/views/showcase.html',
  community: '/src/views/community.html',
  'publish-product': '/src/views/publish-product.html',
  'my-publications': '/src/views/my-publications.html',
  auction: '/src/views/auction.html',
  receipt: '/src/views/receipt.html',
  'purchase-history': '/src/views/purchase-history.html'
};

// Cargar una vista HTML
export async function loadView(viewName) {
  const viewPath = views[viewName];
  if (!viewPath) {
    console.error(`Vista no encontrada: ${viewName}`);
    return;
  }

  try {
    const response = await fetch(viewPath);
    const html = await response.text();

    const app = document.getElementById('app');

    // Para home, reemplazar todo
    if (viewName === 'home') {
      app.innerHTML = html;
      initializeCarousel();
    } else {
      // Para otras vistas, crear estructura con flex
      app.innerHTML = `<div style="display: flex; flex-direction: column; min-height: 100vh;">${html}</div>`;
      updateHeaderNav();
    }

    appState.currentPage = viewName;
    window.scrollTo(0, 0);
  } catch (error) {
    console.error(`Error cargando vista ${viewName}:`, error);
  }
}

//crear tarjeta de producto
export function createProductCard(product) {
  return `
    <div class="product-card" onclick="app.navigateTo('product', ${product.id})">
      <div class="product-image">${product.emoji}</div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${product.price}</p>
        <p class="product-description">${product.description.substring(0, 80)}...</p>
        <button class="btn btn-small" onclick="event.stopPropagation(); app.navigateTo('product', ${product.id})">Ver Detalle</button>
      </div>
    </div>
  `;
}

// Inicializar carrusel
let currentSlide = 0;
let carouselInterval = null;

export function initializeCarousel() {
  window.currentCarouselIndex = 0; // Exportar el indice global
  renderCarouselDots();
  startCarousel();
}

function renderCarouselDots() {
  const dotsContainer = document.getElementById('carousel-dots');
  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: 4 }, (_, i) => 
      `<div class="dot ${i === 0 ? 'active' : ''}" onclick="app.goToSlide(${i})" id="dot-${i}"></div>`
    ).join('');
  }
}

function startCarousel() {
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % 4;
    window.currentCarouselIndex = currentSlide; // Actualizar el indice global
    updateCarousel();
  }, 4000);
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
  }
}

export function updateCarousel() {
  // Ocultar todos los slides
  for (let i = 1; i <= 4; i++) {
    const slide = document.getElementById(`slide-${i}`);
    if (slide) {
      slide.style.display = 'none';
    }
  }

  // Mostrar el slide actual
  const activeSlide = document.getElementById(`slide-${currentSlide + 1}`);
  if (activeSlide) {
    activeSlide.style.display = 'flex';
  }

  // Actualizar dots
  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  // Animacion
  const slideElement = document.getElementById('carousel-slide');
  if (slideElement) {
    slideElement.style.animation = 'none';
    setTimeout(() => {
      slideElement.style.animation = 'fadeIn 0.5s ease';
    }, 10);
  }
}

export function goToSlide(index) {
  stopCarousel();
  currentSlide = index;
  window.currentCarouselIndex = index;
  updateCarousel();
  startCarousel();
}

// Actualizar header/nav segun el estado
export function updateHeaderNav() {
  const user = getCurrentUser();
  const profileLink = document.getElementById('profile-link');
  
  if (profileLink) {
    if (user) {
      profileLink.textContent = 'Mi Perfil';
      profileLink.onclick = function() { app.navigateTo('profile'); return false; };
    } else {
      profileLink.textContent = 'Iniciar Sesión';
      profileLink.onclick = function() { app.navigateTo('login'); return false; };
    }
  }
}

// Cargar detalle de producto
export function loadProductDetail(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const productImage = document.getElementById('product-image');
  if (productImage) {
    productImage.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
  }

  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-price').textContent = product.price;
  document.getElementById('product-description').textContent = product.description;

  // Mostrar badge si existe
  const badgeElement = document.getElementById('product-badge');
  if (badgeElement && product.badge) {
    badgeElement.textContent = product.badge;
    badgeElement.style.display = 'block';
    badgeElement.style.background = product.badgeType === 'offer' ? '#ff6b6b' : '#4CAF50';
  }

  // El botón siempre agrega al carrito (para todos)
  const addButton = document.getElementById('add-to-cart');
  if (addButton) {
    addButton.textContent = 'Agregar al Carrito';
    addButton.className = 'btn btn-primary';
    addButton.onclick = () => app.addToCartFromDetail();
  }

  // Reiniciar cantidad
  const quantityInput = document.getElementById('detail-quantity');
  if (quantityInput) {
    quantityInput.value = 1;
  }

  appState.selectedProduct = product;

  // Renderizar productos relacionados
  setTimeout(() => {
    app.renderRelatedProducts();
  }, 100);
}

// Cargar perfil
export function loadProfile() {
  const user = getCurrentUser();
  if (user) {
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');

    if (userName) userName.textContent = user.name;
    if (userEmail) userEmail.textContent = user.email;
  }
}

// Cargar dashboard
export function loadDashboard() {
  const user = getCurrentUser();
  if (user) {
    // Actualizar nombre en la bienvenida
    const dashboardUserName = document.getElementById('dashboardUserName');
    if (dashboardUserName) dashboardUserName.textContent = user.name;

    // Actualizar datos personales
    const dashboardName = document.getElementById('dashboardName');
    const dashboardEmail = document.getElementById('dashboardEmail');
    const dashboardPhone = document.getElementById('dashboardPhone');

    if (dashboardName) dashboardName.textContent = user.name;
    if (dashboardEmail) dashboardEmail.textContent = user.email;
    if (dashboardPhone) dashboardPhone.textContent = user.phone || '+52 (449) 123-4567';
  }
}
