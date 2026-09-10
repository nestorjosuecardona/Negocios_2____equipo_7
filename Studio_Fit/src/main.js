import { appState, productsData, saveUser, getCurrentUser, logout, addToCart, removeFromCart, updateQuantity, getCartCount, getCartTotal, loadCartFromLocalStorage, clearCart, promotions, communityComments, userPublications, auctionData, featuredProduct } from '../../Neg2/backups/products.js';
import { 
  loadView, 
  loadProductDetail, 
  loadProfile,
  loadDashboard, 
  updateCarousel,
  goToSlide 
} from './modules/views-loader.js';
import { addProduct, updateProduct, deleteProduct, renderAdminProducts, showEditModal, getAdminProducts } from './modules/admin-manager.js';

// Datos del usuario de demostración (simplificado)
const demoUser = {
  id: 1,
  name: 'Juan Martinez',
  email: 'juan@studiofit.com'
};

class App {
  constructor() {
    this.currentCartProductId = null;
    this.currentQuantity = 1;
    this.init();
  }

  init() {
    // Verificar si hay usuario guardado
    getCurrentUser();

    // Cargar carrito desde localStorage
    loadCartFromLocalStorage();

    // Cargar pagina inicial
    this.renderPage('home');
  }

  navigateTo(page, param = null) {
    this.renderPage(page, param);
  }

  async renderPage(page, param = null) {
    // Cargar el HTML de la vista
    await loadView(page);

    // Actualizar página actual
    appState.currentPage = page;

    // Ejecutar logica especifica por pagina
    switch (page) {
      case 'catalog':
        // Los productos ya estan en el HTML
        break;
      case 'product':
        loadProductDetail(param);
        break;
      case 'classes':
        // Las vistas ya estan cargadas
        break;
      case 'profile':
        if (!appState.isLoggedIn) {
          this.renderPage('login');
          return;
        }
        loadProfile();
        break;
      case 'dashboard':
        if (!appState.isLoggedIn) {
          this.renderPage('login');
          return;
        }
        this.loadDashboard();
        break;
      case 'admin':
        this.initAdmin();
        break;
      case 'login':
      case 'register':
        // Las vistas ya estan cargadas
        break;
      case 'promotions':
        this.renderPromotions();
        break;
      case 'showcase':
        this.openShowcaseModal();
        break;
      case 'community':
        this.renderCommunityComments();
        break;
      case 'publish-product':
        // Cargar datos de edición si existen
        if (appState.editingPublication) {
          setTimeout(() => {
            this.loadEditingPublication();
          }, 100);
        }
        break;
      case 'my-publications':
        this.renderMyPublications();
        break;
      case 'auction':
        this.renderAuction();
        break;
      case 'receipt':
        if (!appState.isLoggedIn) {
          this.renderPage('login');
          return;
        }
        this.loadReceipt();
        break;
      case 'purchase-history':
        if (!appState.isLoggedIn) {
          this.renderPage('login');
          return;
        }
        this.loadPurchaseHistory();
        break;
    }

    window.scrollTo(0, 0);
  }

  handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const inputs = form.querySelectorAll('input[type="text"]');
    const name = inputs[0].value;

    this.showAlert('success', `Gracias ${name || 'visitante'}!!! Tu mensaje ha sido enviado.`);

    form.reset();
  }

  handleRegister(event) {
    event.preventDefault();

    // Limpiar campos
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';

    // Guardar usuario demo sin validar
    saveUser(demoUser);
    appState.isLoggedIn = true;

    this.showAlert('success', '¡Registro exitoso! Redirigiendo a iniciar sesión...');
    setTimeout(() => this.navigateTo('login'), 1500);
  }

  handleLogin(event) {
    event.preventDefault();

    // Limpiar campos
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    // Guardar el usuario demo sin validar
    saveUser(demoUser);
    appState.isLoggedIn = true;

    this.showAlert('success', `¡Bienvenido ${demoUser.name}!`);
    setTimeout(() => this.navigateTo('dashboard'), 1500);
  }

  handleLogout() {
    logout();
    this.showAlert('success', 'Sesión cerrada correctamente');
    setTimeout(() => this.navigateTo('home'), 1000);
  }

  showAlert(type, message) {
    let alertsContainer = document.getElementById('alerts');
    if (!alertsContainer) {
      alertsContainer = document.createElement('div');
      alertsContainer.id = 'alerts';
      alertsContainer.style.position = 'fixed';
      alertsContainer.style.top = '80px';
      alertsContainer.style.right = '20px';
      alertsContainer.style.zIndex = '2000';
      alertsContainer.style.display = 'flex';
      alertsContainer.style.flexDirection = 'column';
      alertsContainer.style.gap = '10px';
      document.body.appendChild(alertsContainer);
    }

    const alertId = 'alert-' + Date.now();

    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type}`;
    alert.style.minWidth = '300px';
    alert.style.boxShadow = '0 4px 15px rgba(212, 175, 55, 0.3)';
    alert.style.padding = '1rem';
    alert.style.borderRadius = '8px';
    alert.style.whiteSpace = 'pre-line';

    // Estilos según el tipo de alerta
    if (type === 'success') {
      alert.style.background = '#4CAF50';
      alert.style.color = 'white';
    } else if (type === 'info') {
      alert.style.background = '#2196F3';
      alert.style.color = 'white';
    } else if (type === 'error') {
      alert.style.background = '#f44336';
      alert.style.color = 'white';
    }

    alert.textContent = message;
    alertsContainer.appendChild(alert);

    setTimeout(() => {
      const element = document.getElementById(alertId);
      if (element) {
        element.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => element.remove(), 300);
      }
    }, 3000);
  }

  goToSlide(index) {
    goToSlide(index);
  }

  handleCarouselClick() {
    // Todos los slides redirigen a la página de nosotros
    this.navigateTo('about');
  }

  filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Actualizar botones activos
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
      }
    });

    // Filtrar productos
    products.forEach(product => {
      if (category === 'todos') {
        product.classList.remove('hidden');
      } else {
        const productCategory = product.getAttribute('data-category');
        if (productCategory === category) {
          product.classList.remove('hidden');
        } else {
          product.classList.add('hidden');
        }
      }
    });
  }

  // Métodos para manejar el carrito
  openAddToCartModal(productId, productName) {
    this.currentCartProductId = productId;
    this.currentQuantity = 1;

    const modal = document.getElementById('addToCartModal');
    const nameElement = document.getElementById('modalProductName');
    const quantityDisplay = document.getElementById('quantityDisplay');

    if (modal && nameElement && quantityDisplay) {
      nameElement.textContent = productName;
      quantityDisplay.textContent = '1';
      modal.classList.add('active');
    }
  }

  closeAddToCartModal() {
    const modal = document.getElementById('addToCartModal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.currentCartProductId = null;
    this.currentQuantity = 1;
  }

  increaseQuantity() {
    this.currentQuantity++;
    this.updateQuantityDisplay();
  }

  decreaseQuantity() {
    if (this.currentQuantity > 1) {
      this.currentQuantity--;
      this.updateQuantityDisplay();
    }
  }

  updateQuantityDisplay() {
    const display = document.getElementById('quantityDisplay');
    if (display) {
      display.textContent = this.currentQuantity;
    }
  }

  confirmAddToCart() {
    if (this.currentCartProductId !== null) {
      addToCart(this.currentCartProductId, this.currentQuantity);
      this.showAlert('success', `Producto agregado al carrito (x${this.currentQuantity})`);
      this.closeAddToCartModal();
    }
  }

  showCart() {
    // No abrir carrito en admin
    if (appState.currentPage === 'admin') {
      return;
    }

    const cartCount = getCartCount();
    const cartTotal = getCartTotal();

    if (cartCount === 0) {
      this.showAlert('info', 'Tu carrito está vacío');
      return;
    }

    // Crear modal si no existe
    if (!document.getElementById('cartModal')) {
      this.createCartModalHTML();
    }

    // Abrir modal del carrito
    this.renderCartModal();
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
    }
  }

  createCartModalHTML() {
    // Modal del carrito DESHABILITADO
    return;
  }

  renderCartModal() {
    const itemsList = document.getElementById('cartItemsList');
    const subtotalElement = document.getElementById('cartSubtotal');
    const totalElement = document.getElementById('cartTotal');

    if (!itemsList) return;

    // Si el carrito está vacío
    if (Object.keys(appState.cartItems).length === 0) {
      itemsList.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío</p></div>';
      subtotalElement.textContent = '$0';
      totalElement.textContent = '$0';
      return;
    }

    // Generar HTML de items
    let itemsHTML = '';
    Object.values(appState.cartItems).forEach(item => {
      const itemPrice = parseInt(item.product.price.replace('$', ''));
      const itemSubtotal = itemPrice * item.quantity;

      itemsHTML += `
        <div class="cart-item" style="display: flex; gap: 1.5rem; padding: 1.5rem; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; margin-bottom: 1rem;">
          <!-- Imagen del Producto -->
          <div style="flex-shrink: 0;">
            <img src="${item.product.image}" alt="${item.product.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 6px; border: 1px solid #d4af37;">
          </div>

          <!-- Información del Producto -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <!-- Nombre y Descripción -->
            <div>
              <div class="cart-item-name" style="color: #d4af37; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">${item.product.name}</div>
              <div style="color: #8a8a8a; font-size: 0.85rem; line-height: 1.4; margin-bottom: 1rem;">${item.product.description}</div>
            </div>

            <!-- Precio y Cantidad -->
            <div>
              <div class="cart-item-price" style="color: #e0e0e0; margin-bottom: 0.8rem; font-weight: 600;">
                ${item.product.price} × ${item.quantity} = <span style="color: #d4af37; font-size: 1.1rem;">$${itemSubtotal}</span>
              </div>
            </div>
          </div>

          <!-- Controles -->
          <div class="cart-item-actions" style="display: flex; flex-direction: column; gap: 0.8rem; justify-content: space-between;">
            <!-- Cantidad -->
            <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(212, 175, 55, 0.1); padding: 0.5rem; border-radius: 4px;">
              <button onclick="app.decreaseCartItem(${item.product.id})" style="background: none; border: none; color: #d4af37; font-weight: 600; font-size: 1.2rem; cursor: pointer; width: 30px; height: 30px;">−</button>
              <div class="cart-item-quantity" style="color: #e0e0e0; font-weight: 600; min-width: 30px; text-align: center;">${item.quantity}</div>
              <button onclick="app.increaseCartItem(${item.product.id})" style="background: none; border: none; color: #d4af37; font-weight: 600; font-size: 1.2rem; cursor: pointer; width: 30px; height: 30px;">+</button>
            </div>

            <!-- Eliminar -->
            <button class="cart-item-remove" onclick="app.removeCartItem(${item.product.id})" style="background: #ff6b6b; color: white; border: none; padding: 0.7rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;">Eliminar</button>
          </div>
        </div>
      `;
    });

    itemsList.innerHTML = itemsHTML;

    // Actualizar totales
    const subtotal = getCartTotal();
    let total = subtotal;
    let discountAmount = 0;

    // Aplicar descuento si hay cupón (solo para productos de categorías aplicables)
    if (appState.appliedCoupon) {
      discountAmount = this.calculateDiscountAmount(appState.appliedCoupon);
      total = subtotal - discountAmount;
    }

    subtotalElement.textContent = `$${subtotal}`;
    totalElement.textContent = `$${total}`;

    // Mostrar detalles del descuento si hay cupón
    const discountLabel = document.getElementById('cartDiscountLabel');
    const discountAmountSpan = document.getElementById('cartDiscountAmount');
    const discountInfo = document.getElementById('cartDiscountInfo');

    if (discountLabel && discountAmountSpan) {
      if (appState.appliedCoupon) {
        discountLabel.style.display = 'flex';
        discountAmountSpan.textContent = `-$${discountAmount}`;

        // Mostrar qué categorías aplican para el descuento
        const categoryMap = {
          'suplementos': 'Suplementos',
          'ropa': 'Ropa',
          'equipo': 'Equipo'
        };
        const applicableCategories = appState.appliedCoupon.categories
          .map(cat => categoryMap[cat] || cat)
          .join(', ');

        if (discountInfo) {
          if (appState.appliedCoupon.categories.length < 3) {
            discountInfo.textContent = `(Aplicable a: ${applicableCategories})`;
            discountInfo.style.display = 'block';
          } else {
            discountInfo.style.display = 'none';
          }
        }
      } else {
        discountLabel.style.display = 'none';
        discountAmountSpan.textContent = '-$0';
        if (discountInfo) {
          discountInfo.style.display = 'none';
        }
      }
    }
  }

  closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  }

  increaseCartItem(productId) {
    const item = appState.cartItems[productId];
    if (item) {
      item.quantity++;
      updateQuantity(productId, item.quantity);
      this.renderCartModal();
    }
  }

  decreaseCartItem(productId) {
    const item = appState.cartItems[productId];
    if (item && item.quantity > 1) {
      item.quantity--;
      updateQuantity(productId, item.quantity);
      this.renderCartModal();
    }
  }

  removeCartItem(productId) {
    removeFromCart(productId);
    this.renderCartModal();

    // Si el carrito está vacío, cerrar modal
    if (getCartCount() === 0) {
      this.closeCartModal();
      this.showAlert('info', 'Producto eliminado del carrito');
    }
  }

  proceedToCheckout() {
    if (getCartCount() === 0) {
      this.showAlert('error', 'Tu carrito está vacío');
      return;
    }

    // Inicializar estado del checkout
    appState.checkoutStep = 1;
    appState.checkoutData = {
      address: {},
      paymentMethod: null,
      cardDetails: {}
    };

    // Cerrar carrito y abrir checkout
    this.closeCartModal();
    this.openCheckout();
  }

  openCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'flex';
    this.goToCheckoutStep(1);
  }

  closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.style.display = 'none';

    // Limpiar datos
    appState.checkoutStep = 1;
    appState.checkoutData = {};
  }

  goToCheckoutStep(step) {
    appState.checkoutStep = step;

    // Ocultar todos los pasos
    document.getElementById('step1-content').style.display = 'none';
    document.getElementById('step2-content').style.display = 'none';
    document.getElementById('step3-content').style.display = 'none';

    // Resetear indicadores
    document.getElementById('step1-indicator').style.background = 'rgba(212, 175, 55, 0.3)';
    document.getElementById('step1-indicator').style.color = '#aaa';
    document.getElementById('step2-indicator').style.background = 'rgba(212, 175, 55, 0.3)';
    document.getElementById('step2-indicator').style.color = '#aaa';
    document.getElementById('step3-indicator').style.background = 'rgba(212, 175, 55, 0.3)';
    document.getElementById('step3-indicator').style.color = '#aaa';

    // Mostrar paso actual
    if (step === 1) {
      document.getElementById('step1-content').style.display = 'block';
      document.getElementById('step1-indicator').style.background = '#d4af37';
      document.getElementById('step1-indicator').style.color = '#050813';
      document.getElementById('prevBtn').style.display = 'none';
      document.getElementById('nextBtn').textContent = 'Siguiente →';
    } else if (step === 2) {
      document.getElementById('step2-content').style.display = 'block';
      document.getElementById('step1-indicator').style.background = '#4CAF50';
      document.getElementById('step1-indicator').style.color = '#fff';
      document.getElementById('step2-indicator').style.background = '#d4af37';
      document.getElementById('step2-indicator').style.color = '#050813';
      document.getElementById('prevBtn').style.display = 'block';
      document.getElementById('nextBtn').textContent = 'Siguiente →';
    } else if (step === 3) {
      document.getElementById('step3-content').style.display = 'block';
      document.getElementById('step1-indicator').style.background = '#4CAF50';
      document.getElementById('step1-indicator').style.color = '#fff';
      document.getElementById('step2-indicator').style.background = '#4CAF50';
      document.getElementById('step2-indicator').style.color = '#fff';
      document.getElementById('step3-indicator').style.background = '#d4af37';
      document.getElementById('step3-indicator').style.color = '#050813';
      document.getElementById('prevBtn').style.display = 'block';
      document.getElementById('nextBtn').textContent = '✓ Confirmar Pedido';
      this.renderConfirmationStep();
    }
  }

  nextCheckoutStep() {
    if (appState.checkoutStep === 1) {
      this.saveAddressForm();
      this.goToCheckoutStep(2);
    } else if (appState.checkoutStep === 2) {
      this.savePaymentMethod();
      this.goToCheckoutStep(3);
    } else if (appState.checkoutStep === 3) {
      this.confirmOrder();
    }
  }

  previousCheckoutStep() {
    if (appState.checkoutStep > 1) {
      this.goToCheckoutStep(appState.checkoutStep - 1);
    }
  }

  saveAddressForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const street = document.getElementById('street').value.trim();
    const city = document.getElementById('city').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value.trim();

    // Guardar datos (sin validación obligatoria)
    appState.checkoutData.address = {
      fullName,
      email,
      phone,
      street,
      city,
      zipCode,
      country
    };
  }

  selectPaymentMethod(method, element) {
    appState.checkoutData.paymentMethod = method;

    // Actualizar estilos
    document.querySelectorAll('label[onclick*="selectPaymentMethod"]').forEach(label => {
      label.style.borderColor = '#555';
    });
    element.style.borderColor = '#d4af37';

    // Mostrar/ocultar campos según método de pago
    const cardDetailsDiv = document.getElementById('cardDetailsDiv');
    const paypalDetailsDiv = document.getElementById('paypalDetailsDiv');
    const bankTransferDetailsDiv = document.getElementById('bankTransferDetailsDiv');
    const digitalWalletDetailsDiv = document.getElementById('digitalWalletDetailsDiv');

    if (method === 'credit-card' || method === 'debit-card') {
      cardDetailsDiv.style.display = 'block';
      paypalDetailsDiv.style.display = 'none';
      bankTransferDetailsDiv.style.display = 'none';
      digitalWalletDetailsDiv.style.display = 'none';
    } else if (method === 'paypal') {
      cardDetailsDiv.style.display = 'none';
      paypalDetailsDiv.style.display = 'block';
      bankTransferDetailsDiv.style.display = 'none';
      digitalWalletDetailsDiv.style.display = 'none';
    } else if (method === 'bank-transfer') {
      cardDetailsDiv.style.display = 'none';
      paypalDetailsDiv.style.display = 'none';
      bankTransferDetailsDiv.style.display = 'block';
      digitalWalletDetailsDiv.style.display = 'none';
      this.generateBankReference();
    } else if (method === 'digital-wallet') {
      cardDetailsDiv.style.display = 'none';
      paypalDetailsDiv.style.display = 'none';
      bankTransferDetailsDiv.style.display = 'none';
      digitalWalletDetailsDiv.style.display = 'block';
      this.updateWalletDisplay();
    } else {
      cardDetailsDiv.style.display = 'none';
      paypalDetailsDiv.style.display = 'none';
      bankTransferDetailsDiv.style.display = 'none';
      digitalWalletDetailsDiv.style.display = 'none';
    }
  }

  generateBankReference() {
    // Generar referencia única basada en timestamp y número aleatorio
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const reference = `ORD-${timestamp}-${random}`;

    const bankRefElement = document.getElementById('bankReference');
    if (bankRefElement) {
      bankRefElement.textContent = reference;
      // Guardar la referencia en el estado del checkout
      appState.checkoutData.bankReference = reference;
    }
  }

  updateWalletDisplay() {
    // Saldo simulado de la cartera electrónica
    const initialBalance = 5000.00;
    const cartTotal = getCartTotal();
    const balanceAfter = initialBalance - cartTotal;

    // Actualizar elementos del DOM
    const walletBalance = document.getElementById('walletBalance');
    const walletPaymentAmount = document.getElementById('walletPaymentAmount');
    const walletBalanceAfter = document.getElementById('walletBalanceAfter');
    const insufficientFundsAlert = document.getElementById('insufficientFundsAlert');
    const nextButton = document.querySelector('[onclick="app.nextCheckoutStep()"]');

    if (walletBalance) walletBalance.textContent = initialBalance.toFixed(2);
    if (walletPaymentAmount) walletPaymentAmount.textContent = cartTotal.toFixed(2);
    if (walletBalanceAfter) walletBalanceAfter.textContent = Math.max(0, balanceAfter).toFixed(2);

    // Validar si hay saldo suficiente
    if (balanceAfter < 0) {
      if (insufficientFundsAlert) {
        insufficientFundsAlert.style.display = 'block';
      }
      if (nextButton) {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
        nextButton.style.cursor = 'not-allowed';
      }
      // Guardar en state que no hay saldo suficiente
      appState.checkoutData.insufficientFunds = true;
    } else {
      if (insufficientFundsAlert) {
        insufficientFundsAlert.style.display = 'none';
      }
      if (nextButton) {
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
        nextButton.style.cursor = 'pointer';
      }
      // Guardar en state el saldo final
      appState.checkoutData.insufficientFunds = false;
      appState.checkoutData.walletBalance = balanceAfter;
    }
  }

  savePaymentMethod() {
    const method = appState.checkoutData.paymentMethod;

    // Guardar campos de tarjeta si es tarjeta (sin validación obligatoria)
    if (method === 'credit-card' || method === 'debit-card') {
      const cardNumber = document.getElementById('cardNumber').value.trim();
      const cardExpiry = document.getElementById('cardExpiry').value.trim();
      const cardCvv = document.getElementById('cardCvv').value.trim();
      const cardName = document.getElementById('cardName').value.trim();

      const cardNumberClean = cardNumber.replace(/\s/g, '');
      appState.checkoutData.cardDetails = {
        cardNumber: cardNumberClean.slice(-4) || '', // Guardar solo últimos 4 dígitos
        cardExpiry,
        cardName
      };
    }
  }

  validatePaymentMethod() {
    if (!appState.checkoutData.paymentMethod) {
      this.showAlert('error', 'Por favor selecciona un método de pago');
      return false;
    }

    const method = appState.checkoutData.paymentMethod;

    // Validar campos de tarjeta si es tarjeta
    if (method === 'credit-card' || method === 'debit-card') {
      const cardNumber = document.getElementById('cardNumber').value.trim();
      const cardExpiry = document.getElementById('cardExpiry').value.trim();
      const cardCvv = document.getElementById('cardCvv').value.trim();
      const cardName = document.getElementById('cardName').value.trim();

      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        this.showAlert('error', 'Por favor completa todos los datos de la tarjeta');
        return false;
      }

      // Validar número de tarjeta (Luhn check simple)
      const cardNumberClean = cardNumber.replace(/\s/g, '');
      if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
        this.showAlert('error', 'El número de tarjeta no es válido');
        return false;
      }

      // Validar CVV
      if (cardCvv.length < 3 || cardCvv.length > 4) {
        this.showAlert('error', 'El CVV debe tener 3 o 4 dígitos');
        return false;
      }

      appState.checkoutData.cardDetails = {
        cardNumber: cardNumberClean.slice(-4), // Guardar solo últimos 4 dígitos
        cardExpiry,
        cardName
      };
    }

    return true;
  }

  renderConfirmationStep() {
    // Renderizar items del carrito
    let itemsHtml = '';
    Object.values(appState.cartItems).forEach(item => {
      const itemPrice = parseInt(item.product.price.replace('$', ''));
      const itemTotal = itemPrice * item.quantity;
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #ddd;">
          <div>
            <div style="font-weight: 600;">${item.product.name}</div>
            <div style="font-size: 0.85rem; color: #aaa;">x${item.quantity}</div>
          </div>
          <span style="color: #d4af37; font-weight: 600;">$${itemTotal}</span>
        </div>
      `;
    });
    document.getElementById('confirmationItemsList').innerHTML = itemsHtml;

    // Calcular totales
    const subtotal = getCartTotal();
    let discountAmount = 0;
    let discountInfo = '';

    if (appState.appliedCoupon) {
      discountAmount = this.calculateDiscountAmount(appState.appliedCoupon);
      const discountPercent = appState.appliedCoupon.discount;
      const categories = appState.appliedCoupon.categories.join(', ');
      discountInfo = `Cupón ${appState.appliedCoupon.code}: ${discountPercent} en ${categories}`;
    }

    const total = subtotal - discountAmount;

    // Actualizar totales
    document.getElementById('confirmationSubtotal').textContent = `$${subtotal}`;
    document.getElementById('confirmationTotal').textContent = `$${total}`;

    if (discountAmount > 0) {
      document.getElementById('confirmationDiscountDiv').style.display = 'flex';
      document.getElementById('confirmationDiscount').textContent = `-$${discountAmount}`;
      document.getElementById('confirmationDiscountInfo').textContent = discountInfo;
    } else {
      document.getElementById('confirmationDiscountDiv').style.display = 'none';
    }

    // DATOS HARDCODEADOS DE DIRECCIÓN (SIEMPRE LOS MISMOS)
    const hardcodedAddress = {
      fullName: 'Juan Martinez',
      email: 'juan@studiofit.com',
      phone: '+52 (449) 123-4567',
      street: 'Avenida Principal 123, Apartamento 4B',
      city: 'Ciudad de México',
      zipCode: '28000',
      country: 'México'
    };

    let addressHtml = `
      <div style="font-weight: 600; margin-bottom: 0.5rem;">${hardcodedAddress.fullName}</div>
      <div>${hardcodedAddress.street}</div>
      <div>${hardcodedAddress.city}, ${hardcodedAddress.zipCode}</div>
      <div>${hardcodedAddress.country}</div>
      <div style="margin-top: 0.8rem; color: #aaa; font-size: 0.9rem;">
        Email: ${hardcodedAddress.email}<br>
        Teléfono: ${hardcodedAddress.phone}
      </div>
    `;
    document.getElementById('confirmationAddressDisplay').innerHTML = addressHtml;

    // MÉTODO DE PAGO PREDETERMINADO
    if (!appState.checkoutData.paymentMethod) {
      appState.checkoutData.paymentMethod = 'credit-card'; // Tarjeta de Crédito como predeterminado
    }

    // Renderizar método de pago CON DETALLES
    const paymentMethod = appState.checkoutData.paymentMethod;
    const paymentLabels = {
      'credit-card': '💳 Tarjeta de Crédito',
      'debit-card': '💰 Tarjeta de Débito',
      'bank-transfer': '🏦 Transferencia Bancaria',
      'paypal': '🅿️ PayPal',
      'digital-wallet': '💻 Cartera Electrónica'
    };

    let paymentHtml = paymentLabels[paymentMethod] || 'Método de pago no especificado';

    // Agregar detalles según el método de pago
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      const cardNumber = appState.checkoutData.cardDetails?.cardNumber || '1234';
      const cardName = appState.checkoutData.cardDetails?.cardName || 'JUAN MARTINEZ';
      const cardExpiry = appState.checkoutData.cardDetails?.cardExpiry || '12/26';

      paymentHtml += `
        <div style="margin-top: 0.8rem; color: #aaa; font-size: 0.85rem; line-height: 1.8;">
          <div><strong>Número:</strong> ••••••••••••${cardNumber}</div>
          <div><strong>Titular:</strong> ${cardName}</div>
          <div><strong>Vencimiento:</strong> ${cardExpiry}</div>
        </div>
      `;
    } else if (paymentMethod === 'bank-transfer') {
      const reference = appState.checkoutData.bankReference || 'ORD-1234567890-5432';
      paymentHtml += `
        <div style="margin-top: 0.8rem; color: #aaa; font-size: 0.85rem; line-height: 1.8;">
          <div><strong>Banco:</strong> Banco Nacional</div>
          <div><strong>Cuenta:</strong> •••••••••9876</div>
          <div><strong>Referencia:</strong> <strong style="color: #d4af37;">${reference}</strong></div>
        </div>
      `;
    } else if (paymentMethod === 'paypal') {
      paymentHtml += `
        <div style="margin-top: 0.8rem; color: #aaa; font-size: 0.85rem; line-height: 1.8;">
          <div><strong>Email:</strong> juan.martinez@email.com</div>
          <div><strong>Estado:</strong> <span style="color: #4CAF50;">✓ Verificado</span></div>
        </div>
      `;
    } else if (paymentMethod === 'digital-wallet') {
      const walletBalance = appState.checkoutData.walletBalance || 4543.50;
      paymentHtml += `
        <div style="margin-top: 0.8rem; color: #aaa; font-size: 0.85rem; line-height: 1.8;">
          <div><strong>ID Cartera:</strong> WLT-JM-2024</div>
          <div><strong>Saldo Disponible:</strong> $5000.00</div>
          <div><strong>Saldo Final:</strong> <span style="color: #4CAF50; font-weight: 600;">$${walletBalance.toFixed(2)}</span></div>
        </div>
      `;
    }

    document.getElementById('confirmationPaymentDisplay').innerHTML = paymentHtml;
  }

  confirmOrder() {
    // Simular procesamiento de pago
    this.showAlert('success', '⏳ Procesando tu pedido...');

    setTimeout(() => {
      // Generar número de orden
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      appState.lastOrderNumber = orderNumber;

      // Guardar datos del carrito para la factura
      appState.lastOrderItems = Object.values(appState.cartItems);
      appState.lastOrderSubtotal = getCartTotal();
      appState.lastOrderDiscount = 0;

      if (appState.appliedCoupon) {
        appState.lastOrderDiscount = this.calculateDiscountAmount(appState.appliedCoupon);
      }

      // GUARDAR DATOS DE PAGO ANTES DE LIMPIAR
      appState.lastOrderPaymentMethod = appState.checkoutData.paymentMethod || 'credit-card';
      appState.lastOrderCardDetails = { ...appState.checkoutData.cardDetails };
      appState.lastOrderBankReference = appState.checkoutData.bankReference;
      appState.lastOrderWalletBalance = appState.checkoutData.walletBalance;

      // Limpiar carrito
      clearCart();

      // Cerrar checkout
      this.closeCheckout();

      // Mostrar confirmación
      this.showAlert('success', `¡Pedido realizado exitosamente!\n\nNúmero de orden: ${orderNumber}`);

      // Limpiar datos del checkout
      appState.checkoutStep = 1;
      appState.checkoutData = {};

      // Navegar a receipt (factura)
      setTimeout(() => {
        this.navigateTo('receipt');
      }, 500);
    }, 1500);
  }

  clearAllCart() {
    if (getCartCount() === 0) {
      this.showAlert('info', 'El carrito ya está vacío');
      return;
    }

    // Confirmar antes de limpiar
    if (confirm('¿Estás seguro de que deseas vaciar el carrito completamente?')) {
      clearCart();
      this.renderCartModal();
      this.showAlert('success', 'Carrito vaciado correctamente');

      // Cerrar modal si el carrito está vacío
      if (getCartCount() === 0) {
        setTimeout(() => this.closeCartModal(), 500);
      }
    }
  }

  // ============== MÉTODOS DEL PANEL ADMINISTRATIVO ==============
  initAdmin() {
    // Mostrar modal de login
    setTimeout(() => {
      this.showAdminLoginModal();
    }, 100);
  }

  handleAddProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value || 'Producto sin nombre';

    // Solo mostrar mensaje sin validar ni guardar nada
    this.showAlert('success', `¡Se ha agregado "${name}" al sistema!`);

    // Limpiar formulario
    document.getElementById('addProductForm').reset();
  }

  editProduct(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) {
      this.showAlert('error', 'Producto no encontrado');
      return;
    }

    const price = product.price.replace('$', '');

    document.getElementById('productFormModal').style.display = 'flex';
    document.getElementById('formTitle').textContent = 'Editar Producto';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;

    document.getElementById('addProductForm').dataset.editMode = 'true';
    document.getElementById('addProductForm').dataset.productId = productId;
  }

  deleteProduct(productId) {
    // Solo mostrar mensaje sin eliminar realmente
    this.showAlert('success', `¡Producto #${productId} ha sido eliminado!`);
  }

  // ============== PANEL ADMINISTRATIVO ==============
  adminLogin() {
    const username = document.getElementById('adminUsername').value.trim() || 'Admin';
    const password = document.getElementById('adminPassword').value.trim();

    appState.currentPage = 'admin';

    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
      cartModal.style.display = 'none';
      cartModal.classList.remove('active');
    }

    this.hideAdminLoginModal();
    this.showAlert('success', `¡Bienvenido ${username}!\nAcceso al panel otorgado`);

    setTimeout(() => {
      this.switchAdminTab('dashboard');
    }, 500);
  }

  hideAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const username = document.getElementById('adminUsername');
      const password = document.getElementById('adminPassword');
      if (username) username.value = '';
      if (password) password.value = '';
      if (username) username.focus();
    }
  }

  switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) {
      tabElement.classList.add('active');
    }

    const navItem = document.querySelector(`[onclick*="switchAdminTab('${tabName}')"]`);
    if (navItem) {
      navItem.classList.add('active');
    }

    if (tabName === 'productos') {
      this.renderProductsTable();
    }
  }

  openProductForm() {
    document.getElementById('productFormModal').style.display = 'flex';
    document.getElementById('formTitle').textContent = 'Agregar Producto';
    document.getElementById('addProductForm').reset();
  }

  closeProductForm() {
    document.getElementById('productFormModal').style.display = 'none';
  }

  renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const html = productsData.map(product => `
      <tr>
        <td><img src="${product.image}" alt="${product.name}" class="table-image"></td>
        <td><strong>${product.name}</strong></td>
        <td><strong style="color: #d4af37;">${product.price}</strong></td>
        <td style="text-transform: capitalize;">${product.category}</td>
        <td><span style="background: rgba(212, 175, 55, 0.2); padding: 0.3rem 0.8rem; border-radius: 4px; color: #d4af37;">25</span></td>
        <td>
          <div class="table-actions">
            <button class="btn-table btn-edit" onclick="app.editProduct(${product.id})">Editar</button>
            <button class="btn-table btn-delete" onclick="app.confirmDelete(${product.id}, '${product.name}')">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');

    tbody.innerHTML = html;
  }

  confirmDelete(productId, productName) {
    if (confirm(`¿Estás seguro de que deseas eliminar "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
      this.showAlert('success', `¡"${productName}" ha sido eliminado del inventario!`);
    }
  }

  // ============== MÉTODOS DE DETALLE DE PRODUCTO ==============
  increaseDetailQuantity() {
    const input = document.getElementById('detail-quantity');
    if (input) {
      input.value = parseInt(input.value || 1) + 1;
    }
  }

  decreaseDetailQuantity() {
    const input = document.getElementById('detail-quantity');
    if (input && parseInt(input.value) > 1) {
      input.value = parseInt(input.value) - 1;
    }
  }

  addToCartFromDetail() {
    const quantity = parseInt(document.getElementById('detail-quantity').value || 1);
    const productId = appState.selectedProduct?.id;
    const productName = appState.selectedProduct?.name || 'Producto';

    if (!productId) {
      this.showAlert('error', 'Producto no encontrado');
      return;
    }

    // Agregar al carrito
    addToCart(productId, quantity);

    // Mostrar mensaje de éxito
    this.showAlert('success', `¡Se agregaron ${quantity} unidad(es) de "${productName}" al carrito!`);

    // Reiniciar cantidad
    document.getElementById('detail-quantity').value = 1;
  }

  renderRelatedProducts() {
    const grid = document.getElementById('related-products-grid');
    if (!grid) {
      console.error('Grid de productos relacionados no encontrado');
      return;
    }

    const currentProduct = appState.selectedProduct;
    if (!currentProduct) {
      console.error('Producto actual no definido');
      grid.innerHTML = '<p style="color: #8a8a8a; text-align: center; padding: 2rem;">Cargando productos relacionados...</p>';
      return;
    }

    console.log('Producto actual:', currentProduct.name, 'Categoría:', currentProduct.category);

    // Obtener productos de la misma categoría, excluir el actual
    const relatedProducts = productsData
      .filter(p => {
        const sameCategory = p.category === currentProduct.category;
        const notSame = p.id !== currentProduct.id;
        return sameCategory && notSame;
      })
      .slice(0, 4); // Mostrar máximo 4 productos

    console.log('Productos encontrados:', relatedProducts.length);

    if (relatedProducts.length === 0) {
      grid.innerHTML = '<p style="color: #8a8a8a; text-align: center; padding: 2rem;">No hay productos relacionados en esta categoría</p>';
      return;
    }

    grid.innerHTML = relatedProducts.map(product => `
      <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid #d4af37; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.3s ease;" 
           onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(212, 175, 55, 0.3)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
           onclick="app.navigateTo('product', ${product.id})">
        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; margin-bottom: 0.8rem;">
        <h3 style="color: #d4af37; margin: 0.5rem 0; font-size: 1rem;">${product.name}</h3>
        <p style="color: #e0e0e0; margin: 0.5rem 0; font-weight: 600;">${product.price}</p>
        <p style="color: #8a8a8a; font-size: 0.85rem; margin: 0;">Ver detalles</p>
      </div>
    `).join('');
  }

  // ============== BLOQUE 3: MARKETING ==============
  // Promociones
  renderPromotions() {
    const grid = document.querySelector('.promo-grid');
    if (!grid) return;

    grid.innerHTML = promotions.map(promo => `
      <div class="promo-card">
        <div class="promo-badge">${promo.badge}</div>
        <div class="promo-discount">${promo.discount}</div>
        <div class="promo-description">${promo.description}</div>
        <div class="promo-expiry">Válido hasta: ${promo.expiry}</div>
        <div class="promo-code">${promo.code}</div>
      </div>
    `).join('');
  }

  applyPromoCode() {
    const codeInput = document.getElementById('promoCode');
    const code = codeInput.value.trim().toUpperCase();
    const resultDiv = document.getElementById('promoResult');

    if (!code) {
      this.showAlert('error', 'Ingresa un código de descuento');
      return;
    }

    const promo = promotions.find(p => p.code === code && p.active);

    if (promo) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `✅ ¡Descuento ${promo.discount} aplicado! (Simulado)`;
      resultDiv.style.background = 'rgba(76, 175, 80, 0.2)';
      resultDiv.style.color = '#4CAF50';
      resultDiv.style.borderColor = '#4CAF50';
      this.showAlert('success', `Descuento ${promo.discount} aplicado exitosamente`);
    } else {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `❌ Código inválido o expirado`;
      resultDiv.style.background = 'rgba(244, 67, 54, 0.2)';
      resultDiv.style.color = '#f44336';
      resultDiv.style.borderColor = '#f44336';
      this.showAlert('error', 'Código de descuento inválido o expirado');
    }

    codeInput.value = '';
  }

  // Escaparate - Abrir Modal
  openShowcaseModal() {
    const modal = document.getElementById('showcaseModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.style.flexDirection = 'column';

      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(() => {
        this.loadShowcaseData();
      }, 100);

      window.scrollTo(0, 0);
    }
  }

  closeShowcaseModal() {
    const modal = document.getElementById('showcaseModal');
    if (modal) {
      modal.style.display = 'none';
    }
    document.getElementById('showcaseQuantity').value = 1;

    // Limpiar cupón aplicado al cerrar
    appState.appliedCoupon = null;
    const appliedCouponDiv = document.getElementById('showcaseAppliedCouponDiv');
    if (appliedCouponDiv) {
      appliedCouponDiv.style.display = 'none';
    }

    // Cerrar panel de cupones
    const couponsPanel = document.getElementById('showcaseCouponsPanel');
    if (couponsPanel) {
      couponsPanel.style.display = 'none';
    }

    // Regresar al catálogo
    this.navigateTo('catalog');
  }

  loadShowcaseData() {
    // Limpiar cupón anterior
    appState.appliedCoupon = null;
    const appliedCouponDiv = document.getElementById('showcaseAppliedCouponDiv');
    if (appliedCouponDiv) {
      appliedCouponDiv.style.display = 'none';
    }

    // Cerrar panel de cupones
    const couponsPanel = document.getElementById('showcaseCouponsPanel');
    if (couponsPanel) {
      couponsPanel.style.display = 'none';
    }

    const showcaseImageContainer = document.getElementById('showcaseImageContainer');
    const showcaseName = document.getElementById('showcaseName');
    const showcasePrice = document.getElementById('showcasePrice');
    const showcaseDescription = document.getElementById('showcaseDescription');
    const showcaseDiscount2 = document.getElementById('showcaseDiscount2');
    const testimonialsGrid = document.getElementById('testimonialsGrid');

    if (!showcaseImageContainer) {
      console.error('showcaseImageContainer no encontrado');
      return;
    }

    console.log('Cargando imagen:', featuredProduct.image);

    // Cargar imagen usando innerHTML (mismo método que product-detail)
    showcaseImageContainer.innerHTML = `<img src="${featuredProduct.image}" alt="${featuredProduct.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;

    console.log('Imagen inyectada en el contenedor');

    showcaseName.textContent = featuredProduct.name;

    // Extraer precio sin símbolo
    const priceNumber = parseInt(featuredProduct.price.replace('$', ''));

    // Calcular descuento (ejemplo: 20% OFF)
    const discountPercent = 20;
    const discountAmount = Math.round(priceNumber * (discountPercent / 100));
    const finalPrice = priceNumber - discountAmount;

    showcasePrice.textContent = `$${finalPrice}`;
    showcaseDiscount2.textContent = `$${priceNumber}`;
    showcaseDiscount2.style.display = 'inline';

    showcaseDescription.textContent = featuredProduct.description;

    testimonialsGrid.innerHTML = featuredProduct.testimonials.map(test => `
      <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 8px; padding: 1.5rem; text-align: center;">
        <div style="font-size: 1.2rem; margin-bottom: 1rem; color: #d4af37;">${test.rating}</div>
        <div style="color: #e0e0e0; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; font-style: italic;">"${test.text}"</div>
        <div style="color: #d4af37; font-weight: 700;">- ${test.name}</div>
      </div>
    `).join('');

    // Inicializar subtotal
    this.updateShowcaseSubtotal();
  }

  updateShowcaseSubtotal() {
    const quantity = parseInt(document.getElementById('showcaseQuantity').value || 1);
    const priceNumber = parseInt(featuredProduct.price.replace('$', ''));

    // Descuento base: 20%
    let discountPercent = 20;

    // Si hay cupón aplicado, usar el descuento del cupón
    if (appState.appliedCoupon) {
      discountPercent = appState.appliedCoupon.discount;
    }

    const discountAmount = Math.round(priceNumber * (discountPercent / 100));
    const finalPrice = priceNumber - discountAmount;

    // Cálculos
    const subtotal = priceNumber * quantity;
    const totalDiscount = discountAmount * quantity;
    const total = finalPrice * quantity;

    // Actualizar etiqueta de descuento
    const discountLabel = document.getElementById('showcaseDiscountLabel');
    if (discountLabel) {
      discountLabel.textContent = `Descuento (${discountPercent}%):`;
    }

    // Actualizar elementos
    document.getElementById('showcaseSubtotal').textContent = `$${subtotal}`;
    document.getElementById('showcaseDiscountAmount').textContent = `-$${totalDiscount}`;
    document.getElementById('showcaseTotalPrice').textContent = `$${total}`;
  }

  addShowcaseToCart() {
    const quantity = parseInt(document.getElementById('showcaseQuantity').value || 1);
    addToCart(featuredProduct.id, quantity);
    this.showAlert('success', `¡Se agregaron ${quantity} unidad(es) al carrito!`);
    document.getElementById('showcaseQuantity').value = 1;
    this.updateShowcaseSubtotal();
  }

  toggleShowcaseCouponsPanel() {
    const panel = document.getElementById('showcaseCouponsPanel');
    const button = event.target;

    if (panel.style.display === 'none' || panel.style.display === '') {
      panel.style.display = 'block';
      panel.style.maxHeight = '300px';
      this.loadCouponsInShowcase();
      button.style.background = 'rgba(212, 175, 55, 0.3)';
    } else {
      panel.style.display = 'none';
      panel.style.maxHeight = '0';
      button.style.background = 'rgba(212, 175, 55, 0.2)';
    }
  }

  loadCouponsInShowcase() {
    const couponsList = document.getElementById('showcaseCouponsList');
    if (!couponsList) return;

    couponsList.innerHTML = promotions.map(promo => `
      <button onclick="app.applyShowcaseCoupon('${promo.code}', ${promo.discount})" style="
        padding: 0.8rem;
        background: rgba(212, 175, 55, 0.15);
        border: 1px solid #d4af37;
        color: #d4af37;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        text-align: left;
      " onmouseover="this.style.background='rgba(212, 175, 55, 0.25)'" onmouseout="this.style.background='rgba(212, 175, 55, 0.15)'">
        ${promo.code} - ${promo.discount}% OFF
      </button>
    `).join('');
  }

  applyShowcaseCoupon(code, discount) {
    appState.appliedCoupon = { code, discount };

    // Mostrar cupón aplicado
    document.getElementById('showcaseAppliedCouponName').textContent = `${code} (${discount}%)`;
    document.getElementById('showcaseAppliedCouponDiv').style.display = 'block';

    // Cerrar panel
    const panel = document.getElementById('showcaseCouponsPanel');
    panel.style.display = 'none';
    panel.style.maxHeight = '0';

    // Actualizar subtotal con nuevo descuento
    this.updateShowcaseSubtotal();

    this.showAlert('success', `✓ Cupón ${code} aplicado con ${discount}% de descuento`);
  }

  // Dashboard
  loadDashboard() {
    loadDashboard();
  }

  // Factura/Receipt
  loadReceipt() {
    // Datos hardcodeados del cliente
    const customer = {
      name: 'Juan Martinez',
      email: 'juan@studiofit.com',
      phone: '+52 (449) 123-4567',
      address: 'Avenida Principal 123, Apartamento 4B',
      city: 'Ciudad de México',
      zipCode: '28000',
      country: 'México'
    };

    // Obtener datos de la orden
    const orderNumber = appState.lastOrderNumber || 'ORD-' + Date.now();
    const items = appState.lastOrderItems || [];
    const subtotal = appState.lastOrderSubtotal || 0;
    const discount = appState.lastOrderDiscount || 0;
    const total = subtotal - discount;

    // Actualizar número de orden
    const orderNumberEl = document.getElementById('receiptOrderNumber');
    if (orderNumberEl) orderNumberEl.textContent = `Pedido: ${orderNumber}`;

    // Actualizar datos del cliente
    document.getElementById('receiptName').textContent = customer.name;
    document.getElementById('receiptEmail').textContent = customer.email;
    document.getElementById('receiptPhone').textContent = customer.phone;
    document.getElementById('receiptAddress').textContent = customer.address;
    document.getElementById('receiptCity').textContent = `${customer.city}, CP ${customer.zipCode}`;
    document.getElementById('receiptCountry').textContent = customer.country;

    // Renderizar items
    let itemsHtml = '';
    items.forEach(item => {
      const itemPrice = parseInt(item.product.price.replace('$', ''));
      const itemTotal = itemPrice * item.quantity;
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #ddd;">
          <div>
            <p style="margin: 0; font-weight: 600;">${item.product.name}</p>
            <p style="margin: 0.3rem 0 0 0; font-size: 0.85rem; color: #888;">Cantidad: ${item.quantity} x $${itemPrice}</p>
          </div>
          <p style="margin: 0; font-weight: 600; color: #d4af37;">$${itemTotal}</p>
        </div>
      `;
    });
    document.getElementById('receiptItems').innerHTML = itemsHtml;

    // Actualizar totales
    document.getElementById('receiptSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('receiptTotal').textContent = `$${total.toFixed(2)}`;

    // Mostrar descuento si existe
    if (discount > 0 && appState.appliedCoupon) {
      const discountSection = document.getElementById('receiptDiscountSection');
      if (discountSection) {
        discountSection.style.display = 'flex';
        document.getElementById('receiptDiscount').textContent = `-$${discount.toFixed(2)}`;
        document.getElementById('receiptDiscountInfo').textContent = `Cupón ${appState.appliedCoupon.code} aplicado`;
      }
    }

    // Obtener método de pago guardado (usar el guardado en confirmOrder)
    const paymentMethod = appState.lastOrderPaymentMethod || 'credit-card';
    const cardDetails = appState.lastOrderCardDetails || {};
    const bankReference = appState.lastOrderBankReference;

    // Construir detalles del pago con datos simulados
    let paymentDetailsHtml = '';

    if (paymentMethod === 'credit-card') {
      const cardNumber = cardDetails.cardNumber || '1234';
      const cardName = cardDetails.cardName || 'JUAN MARTINEZ';
      const cardExpiry = cardDetails.cardExpiry || '12/26';

      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💳 Tarjeta de Crédito</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Número:</strong> ••••••••••••${cardNumber}</div>
            <div><strong>Titular:</strong> ${cardName}</div>
            <div><strong>Vencimiento:</strong> ${cardExpiry}</div>
          </div>
        </div>
      `;
    } else if (paymentMethod === 'debit-card') {
      const cardNumber = cardDetails.cardNumber || '5678';
      const cardName = cardDetails.cardName || 'JUAN MARTINEZ';
      const cardExpiry = cardDetails.cardExpiry || '09/25';

      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💰 Tarjeta de Débito</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Número:</strong> ••••••••••••${cardNumber}</div>
            <div><strong>Titular:</strong> ${cardName}</div>
            <div><strong>Vencimiento:</strong> ${cardExpiry}</div>
          </div>
        </div>
      `;
    } else if (paymentMethod === 'bank-transfer') {
      const reference = bankReference || 'ORD-1234567890-5432';
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>🏦 Transferencia Bancaria</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Banco:</strong> Banco Nacional</div>
            <div><strong>Cuenta:</strong> •••••••••9876</div>
            <div><strong>Referencia:</strong> <span style="color: #d4af37; font-weight: 600;">${reference}</span></div>
          </div>
        </div>
      `;
    } else if (paymentMethod === 'paypal') {
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>🅿️ PayPal</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Email:</strong> juan.martinez@email.com</div>
            <div><strong>Verificado:</strong> <span style="color: #4CAF50;">✓ Sí</span></div>
            <div><strong>Estado:</strong> Procesado</div>
          </div>
        </div>
      `;
    } else if (paymentMethod === 'digital-wallet') {
      const walletBalance = appState.lastOrderWalletBalance || 4543.50;
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💻 Cartera Electrónica</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>ID Cartera:</strong> WLT-JM-2024</div>
            <div><strong>Saldo Inicial:</strong> $5000.00</div>
            <div><strong>Saldo Final:</strong> <span style="color: #4CAF50; font-weight: 600;">$${walletBalance.toFixed(2)}</span></div>
          </div>
        </div>
      `;
    }

    document.getElementById('receiptPaymentMethod').innerHTML = paymentDetailsHtml;

    // Actualizar fecha
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    document.getElementById('receiptDate').textContent = dateStr;
  }

  printReceipt() {
    // Botón simulado - solo muestra alerta (no abre verdadero dialog de impresión)
    this.showAlert('success', '🖨️ Imprimiendo factura...');
  }

  // Comunidad
  renderCommunityComments() {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    commentsList.innerHTML = communityComments.map(comment => `
      <div class="comment-card">
        <div class="comment-header">
          <div class="comment-avatar">${comment.avatar}</div>
          <div class="comment-meta">
            <p class="comment-author">${comment.author}</p>
            <p class="comment-date">${comment.date}</p>
          </div>
        </div>
        <p class="comment-text">${comment.comment}</p>
        <div class="comment-footer">
          <button class="comment-like-btn" onclick="app.likeComment(this)">👍</button>
          <span class="comment-likes">${comment.likes} personas lo recomiendan</span>
        </div>
      </div>
    `).join('');
  }

  postCommunityComment(event) {
    event.preventDefault();

    const author = document.getElementById('commentAuthor').value;
    const text = document.getElementById('commentText').value;

    if (!author.trim() || !text.trim()) {
      this.showAlert('error', 'Completa todos los campos');
      return;
    }

    const newComment = {
      id: communityComments.length + 1,
      author: author,
      avatar: '👤',
      comment: text,
      date: 'ahora',
      likes: 0
    };

    communityComments.unshift(newComment);
    this.renderCommunityComments();
    this.showAlert('success', '¡Comentario publicado!');

    document.getElementById('commentAuthor').value = '';
    document.getElementById('commentText').value = '';
  }

  likeComment(button) {
    button.style.transform = 'scale(1.3)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
  }

  // ============== BLOQUE 3: MODELOS DE NEGOCIO ==============
  // C2C - Publicar producto
  publishUserProduct(event) {
    event.preventDefault();

    const title = document.getElementById('pubTitle').value;
    const price = document.getElementById('pubPrice').value;
    const category = document.getElementById('pubCategory').value;
    const image = document.getElementById('pubImage').value || 'https://via.placeholder.com/300x300?text=Sin+Imagen';
    const description = document.getElementById('pubDescription').value;
    const submitBtn = document.getElementById('pubSubmitBtn');

    if (!title || !price || !category || !description) {
      this.showAlert('error', 'Completa todos los campos requeridos');
      return;
    }

    // Verificar si estamos en modo edición
    const isEditMode = submitBtn.dataset.editMode === 'true';
    const pubId = submitBtn.dataset.pubId;

    if (isEditMode && pubId) {
      // Modo edición: actualizar publicación existente
      const pubIndex = userPublications.findIndex(p => p.id === parseInt(pubId));
      if (pubIndex > -1) {
        userPublications[pubIndex].title = title;
        userPublications[pubIndex].price = `$${price}`;
        userPublications[pubIndex].category = category;
        userPublications[pubIndex].image = image;
        userPublications[pubIndex].description = description;
        userPublications[pubIndex].date = 'editado recientemente';
      }
      this.showAlert('success', `¡"${title}" actualizado exitosamente!`);
    } else {
      // Modo creación: agregar nueva publicación
      const newPublication = {
        id: userPublications.length + 1,
        author: 'Juan Martinez',
        title: title,
        price: `$${price}`,
        category: category,
        image: image,
        description: description,
        date: 'hace unos minutos',
        status: 'active'
      };
      userPublications.unshift(newPublication);
      this.showAlert('success', `¡"${title}" publicado exitosamente!`);
    }

    // Limpiar formulario y restaurar botón
    document.getElementById('pubTitle').value = '';
    document.getElementById('pubPrice').value = '';
    document.getElementById('pubCategory').value = '';
    document.getElementById('pubImage').value = '';
    document.getElementById('pubDescription').value = '';
    submitBtn.dataset.editMode = 'false';
    submitBtn.dataset.pubId = '';
    submitBtn.textContent = 'Publicar Producto';

    // Limpiar estado de edición
    appState.editingPublication = null;

    setTimeout(() => this.navigateTo('my-publications'), 1500);
  }

  // Mis publicaciones
  renderMyPublications() {
    const content = document.getElementById('myPublicationsContent');
    if (!content) return;

    if (userPublications.length === 0) {
      content.innerHTML = `
        <div class="empty-publications">
          <div class="empty-publications-icon">📭</div>
          <div class="empty-publications-text">Aún no has publicado ningún producto</div>
          <button onclick="app.navigateTo('publish-product')" class="empty-publications-btn">Publica tu Primer Producto</button>
        </div>
      `;
      return;
    }

    content.innerHTML = userPublications.map(pub => `
      <div class="publication-card">
        <img src="${pub.image}" alt="${pub.title}" class="publication-image">
        <div class="publication-body">
          <span class="publication-status status-${pub.status}">${pub.status === 'active' ? '✓ Activo' : '✓ Vendido'}</span>
          <h3 class="publication-title">${pub.title}</h3>
          <p class="publication-price">${pub.price}</p>
          <p class="publication-category">${pub.category}</p>
          <div class="publication-actions">
            <button class="btn-pub-edit" onclick="app.editPublication(${pub.id})">Editar</button>
            <button class="btn-pub-delete" onclick="app.deletePublication(${pub.id}, '${pub.title}')">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  editPublication(pubId) {
    const publication = userPublications.find(p => p.id === pubId);
    if (!publication) {
      this.showAlert('error', 'Publicación no encontrada');
      return;
    }

    // Guardar en el estado para recuperar después de navegar
    appState.editingPublication = {
      id: pubId,
      title: publication.title,
      price: publication.price.replace('$', ''),
      category: publication.category,
      image: publication.image,
      description: publication.description
    };

    // Navegar a la página de edición
    this.navigateTo('publish-product');
  }

  loadEditingPublication() {
    if (!appState.editingPublication) return;

    const pub = appState.editingPublication;

    // Cargar datos en el formulario
    document.getElementById('pubTitle').value = pub.title;
    document.getElementById('pubPrice').value = pub.price;
    document.getElementById('pubCategory').value = pub.category;
    document.getElementById('pubImage').value = pub.image;
    document.getElementById('pubDescription').value = pub.description;

    // Marcar como modo edición
    const submitBtn = document.getElementById('pubSubmitBtn');
    if (submitBtn) {
      submitBtn.dataset.editMode = 'true';
      submitBtn.dataset.pubId = pub.id;
      submitBtn.textContent = 'Guardar Cambios';
    }
  }

  deletePublication(pubId, title) {
    if (confirm(`¿Deseas eliminar "${title}"?`)) {
      const index = userPublications.findIndex(p => p.id === pubId);
      if (index > -1) {
        userPublications.splice(index, 1);
      }
      this.renderMyPublications();
      this.showAlert('success', `"${title}" ha sido eliminada`);
    }
  }

  // Subasta
  renderAuction() {
    const auctionImage = document.getElementById('auctionImage');
    const auctionProductName = document.getElementById('auctionProductName');
    const auctionDescription = document.getElementById('auctionDescription');
    const currentBidAmount = document.getElementById('currentBidAmount');
    const bidsCountDisplay = document.getElementById('bidsCountDisplay');
    const bidsList = document.getElementById('bidsList');

    if (!auctionImage) return;

    auctionImage.src = auctionData.image;
    auctionProductName.textContent = auctionData.productName;
    auctionDescription.textContent = auctionData.description;
    currentBidAmount.textContent = auctionData.currentBid;
    bidsCountDisplay.textContent = `${auctionData.bidsCount} pujas registradas`;

    bidsList.innerHTML = auctionData.bids.map(bid => `
      <div class="bid-item">
        <div class="bid-item-amount">${bid.amount}</div>
        <div class="bid-item-bidder">👤 ${bid.bidder}</div>
        <div class="bid-item-time">${bid.time}</div>
      </div>
    `).join('');

    // Simulación del temporizador
    this.startAuctionTimer();
  }

  startAuctionTimer() {
    let timeLeft = 9154; // 2h 34m en segundos
    const timerElement = document.getElementById('auctionTimer');

    const interval = setInterval(() => {
      timeLeft--;
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);

      if (timerElement) {
        timerElement.textContent = `${hours}h ${minutes}m`;
      }

      if (timeLeft <= 0) {
        clearInterval(interval);
        if (timerElement) {
          timerElement.innerHTML = '⏰ Subasta Finalizada';
        }
      }
    }, 1000);
  }

  placeBid() {
    const bidAmount = document.getElementById('bidAmount').value;
    const currentBid = parseInt(auctionData.currentBid.replace('$', ''));

    if (!bidAmount || parseInt(bidAmount) <= currentBid) {
      this.showAlert('error', `Tu puja debe ser mayor a ${auctionData.currentBid}`);
      return;
    }

    auctionData.currentBid = `$${bidAmount}`;
    auctionData.bidsCount++;

    const newBid = {
      bidder: 'Tu nombre',
      amount: `$${bidAmount}`,
      time: 'hace unos segundos'
    };

    auctionData.bids.unshift(newBid);
    this.renderAuction();
    this.showAlert('success', `¡Puja registrada por $${bidAmount}! (Simulada)`);

    document.getElementById('bidAmount').value = '';
  }
  // ============== CUPONES EN EL CARRITO ==============
  toggleCouponsPanel() {
    const panel = document.getElementById('couponsPanel');
    if (panel) {
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        this.loadCouponsInCart();
        // Animar la apertura
        setTimeout(() => {
          panel.style.maxHeight = '300px';
        }, 10);
      } else {
        panel.style.maxHeight = '0';
        setTimeout(() => {
          panel.style.display = 'none';
        }, 300);
      }
    }
  }

  loadCouponsInCart() {
    const list = document.getElementById('couponsList');
    if (!list) return;

    list.innerHTML = promotions.filter(promo => promo.active).map(promo => {
      const isApplied = appState.appliedCoupon && appState.appliedCoupon.code === promo.code;
      const isDisabled = appState.appliedCoupon && !isApplied; // Si hay otro cupón aplicado

      return `
        <button onclick="app.applyCouponFromCart('${promo.code}', '${promo.discount}', '${JSON.stringify(promo.categories).replace(/"/g, '&quot;')}')" 
          style="
            padding: 0.8rem;
            background: ${isApplied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
            border: 2px solid ${isApplied ? '#4CAF50' : 'rgba(212, 175, 55, 0.5)'};
            border-radius: 6px;
            color: ${isDisabled ? '#888' : '#d4af37'};
            cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
            text-align: left;
            transition: all 0.3s ease;
            font-weight: 600;
            width: 100%;
            opacity: ${isDisabled ? '0.5' : '1'};
          " 
          ${isDisabled ? 'disabled' : ''}
          onmouseover="if(!${isDisabled}) { this.style.background='rgba(212, 175, 55, 0.2)'; this.style.borderColor='#d4af37'; }" 
          onmouseout="this.style.background='${isApplied ? 'rgba(76, 175, 80, 0.3)' : 'rgba(0, 0, 0, 0.3)'}'; this.style.borderColor='${isApplied ? '#4CAF50' : 'rgba(212, 175, 55, 0.5)'}'">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 700;">${promo.code} ${isApplied ? '✓' : ''}</div>
              <div style="font-size: 0.8rem; color: #e0e0e0;">${promo.description}</div>
            </div>
            <div style="font-size: 1.2rem; color: ${isApplied ? '#4CAF50' : '#ff9800'}; font-weight: 700;">${promo.discount}</div>
          </div>
        </button>
      `;
    }).join('');
  }

  applyCouponFromCart(code, discount, categoriesJson) {
    // Parsear las categorías del cupón
    const categories = JSON.parse(categoriesJson);

    appState.appliedCoupon = { code, discount, categories };

    // Mostrar cupón aplicado
    const appliedDiv = document.getElementById('appliedCouponDiv');
    const appliedName = document.getElementById('appliedCouponName');

    appliedDiv.style.display = 'flex';
    appliedName.textContent = `${code} (${discount})`;

    // Re-renderizar el carrito para actualizar totales
    this.renderCartModal();

    // Cerrar panel
    const panel = document.getElementById('couponsPanel');
    if (panel) {
      panel.style.maxHeight = '0';
      setTimeout(() => {
        panel.style.display = 'none';
      }, 300);
    }

    this.showAlert('success', `¡Cupón ${code} aplicado! Descuento: ${discount}`);
  }

  // Función para calcular el descuento solo para productos de categorías específicas
  calculateDiscountAmount(coupon) {
    if (!coupon || !coupon.categories) return 0;

    const discountPercent = parseInt(coupon.discount.replace('%', ''));
    let applicableTotal = 0;

    // Sumar solo los precios de productos que aplican para este cupón
    Object.values(appState.cartItems).forEach(item => {
      if (coupon.categories.includes(item.product.category)) {
        const itemPrice = parseInt(item.product.price.replace('$', ''));
        applicableTotal += itemPrice * item.quantity;
      }
    });

    return Math.round((applicableTotal * discountPercent) / 100);
  }

  removeCoupon() {
    appState.appliedCoupon = null;

    // Ocultar cupón aplicado
    const appliedDiv = document.getElementById('appliedCouponDiv');
    if (appliedDiv) {
      appliedDiv.style.display = 'none';
    }

    // Re-renderizar el carrito para actualizar totales
    this.renderCartModal();

    this.showAlert('success', '✓ Cupón eliminado');
  }

  // ============== HISTORIAL DE COMPRAS ==============
  showPurchaseHistory() {
    this.navigateTo('purchase-history');
  }

  loadPurchaseHistory() {
    const purchaseHistoryList = document.getElementById('purchaseHistoryList');
    if (!purchaseHistoryList) return;

    // Datos simulados de compras
    const purchaseHistory = [
      {
        id: 1,
        orderNumber: 'ORD-1704067200001-5432',
        date: '15/11/2024',
        total: 1456.50,
        status: 'Entregado',
        items: [
          { name: 'Creatina Birdman', quantity: 2, price: 349 },
          { name: 'Whey Protein Premium', quantity: 1, price: 289 }
        ],
        paymentMethod: 'credit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 1287.00,
        discount: 0,
        cardDetails: { cardNumber: '1234', cardName: 'JUAN MARTINEZ', cardExpiry: '12/26' }
      },
      {
        id: 2,
        orderNumber: 'ORD-1704067200002-5432',
        date: '03/11/2024',
        total: 899.99,
        status: 'Entregado',
        items: [
          { name: 'Barra Olímpica PRO', quantity: 1, price: 899.99 }
        ],
        paymentMethod: 'debit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 899.99,
        discount: 0,
        cardDetails: { cardNumber: '5678', cardName: 'JUAN MARTINEZ', cardExpiry: '09/25' }
      },
      {
        id: 3,
        orderNumber: 'ORD-1704067200003-5432',
        date: '18/10/2024',
        total: 2145.75,
        status: 'Entregado',
        items: [
          { name: 'Multivitamínico Complete', quantity: 3, price: 145.25 },
          { name: 'BCAA Elite', quantity: 2, price: 189.99 },
          { name: 'Mancuernas Ajustables', quantity: 1, price: 1575 }
        ],
        paymentMethod: 'bank-transfer',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 2145.75,
        discount: 0,
        bankReference: 'ORD-1704067200003-5432'
      },
      {
        id: 4,
        orderNumber: 'ORD-1704067200004-5432',
        date: '25/09/2024',
        total: 654.50,
        status: 'Entregado',
        items: [
          { name: 'Botella Fitness 1L', quantity: 2, price: 89.99 },
          { name: 'Cinturón de Levantamiento', quantity: 1, price: 184.52 }
        ],
        paymentMethod: 'paypal',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 654.50,
        discount: 0
      },
      {
        id: 5,
        orderNumber: 'ORD-1704067200005-5432',
        date: '08/09/2024',
        total: 1789.99,
        status: 'Entregado',
        items: [
          { name: 'Banca Ajustable Premium', quantity: 1, price: 749.99 },
          { name: 'Juego de Mancuernas', quantity: 1, price: 1040 }
        ],
        paymentMethod: 'credit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 1789.99,
        discount: 0,
        cardDetails: { cardNumber: '1234', cardName: 'JUAN MARTINEZ', cardExpiry: '12/26' }
      },
      {
        id: 6,
        orderNumber: 'ORD-1704067200006-5432',
        date: '22/08/2024',
        total: 425.50,
        status: 'Entregado',
        items: [
          { name: 'Pre-entreno Explosión', quantity: 2, price: 189.99 },
          { name: 'Shaker Proteico', quantity: 1, price: 45.52 }
        ],
        paymentMethod: 'digital-wallet',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 425.50,
        discount: 0,
        walletBalance: 4574.50
      }
    ];

    // Renderizar tabla
    purchaseHistoryList.innerHTML = purchaseHistory.map(purchase => `
      <tr style="border-bottom: 1px solid rgba(212, 175, 55, 0.2); hover-background: rgba(212, 175, 55, 0.05);">
        <td style="padding: 1rem; color: #d4af37; font-weight: 700;">${purchase.orderNumber}</td>
        <td style="padding: 1rem; color: #ddd;">${purchase.date}</td>
        <td style="padding: 1rem; color: #4CAF50; font-weight: 700;">$${purchase.total.toFixed(2)}</td>
        <td style="padding: 1rem; color: #2196F3; font-weight: 600;">
          <span style="background: rgba(33, 150, 243, 0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem;">
            ${purchase.status}
          </span>
        </td>
        <td style="padding: 1rem; text-align: center;">
          <button onclick="app.showPurchaseDetails(${purchase.id})" style="padding: 0.5rem 1rem; background: rgba(212, 175, 55, 0.2); border: 1px solid #d4af37; color: #d4af37; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.3s;" 
                  onmouseover="this.style.background='rgba(212, 175, 55, 0.3)'" 
                  onmouseout="this.style.background='rgba(212, 175, 55, 0.2)'">
            Ver Detalles
          </button>
        </td>
      </tr>
    `).join('');
  }

  showPurchaseDetails(purchaseId) {
    // Datos de compras (igual al del loadPurchaseHistory)
    const purchaseHistory = [
      {
        id: 1,
        orderNumber: 'ORD-1704067200001-5432',
        date: '15/11/2024',
        total: 1456.50,
        status: 'Entregado',
        items: [
          { name: 'Creatina Birdman', quantity: 2, price: 349 },
          { name: 'Whey Protein Premium', quantity: 1, price: 289 }
        ],
        paymentMethod: 'credit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 1287.00,
        discount: 0,
        cardDetails: { cardNumber: '1234', cardName: 'JUAN MARTINEZ', cardExpiry: '12/26' }
      },
      {
        id: 2,
        orderNumber: 'ORD-1704067200002-5432',
        date: '03/11/2024',
        total: 899.99,
        status: 'Entregado',
        items: [
          { name: 'Barra Olímpica PRO', quantity: 1, price: 899.99 }
        ],
        paymentMethod: 'debit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 899.99,
        discount: 0,
        cardDetails: { cardNumber: '5678', cardName: 'JUAN MARTINEZ', cardExpiry: '09/25' }
      },
      {
        id: 3,
        orderNumber: 'ORD-1704067200003-5432',
        date: '18/10/2024',
        total: 2145.75,
        status: 'Entregado',
        items: [
          { name: 'Multivitamínico Complete', quantity: 3, price: 145.25 },
          { name: 'BCAA Elite', quantity: 2, price: 189.99 },
          { name: 'Mancuernas Ajustables', quantity: 1, price: 1575 }
        ],
        paymentMethod: 'bank-transfer',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 2145.75,
        discount: 0,
        bankReference: 'ORD-1704067200003-5432'
      },
      {
        id: 4,
        orderNumber: 'ORD-1704067200004-5432',
        date: '25/09/2024',
        total: 654.50,
        status: 'Entregado',
        items: [
          { name: 'Botella Fitness 1L', quantity: 2, price: 89.99 },
          { name: 'Cinturón de Levantamiento', quantity: 1, price: 184.52 }
        ],
        paymentMethod: 'paypal',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 654.50,
        discount: 0
      },
      {
        id: 5,
        orderNumber: 'ORD-1704067200005-5432',
        date: '08/09/2024',
        total: 1789.99,
        status: 'Entregado',
        items: [
          { name: 'Banca Ajustable Premium', quantity: 1, price: 749.99 },
          { name: 'Juego de Mancuernas', quantity: 1, price: 1040 }
        ],
        paymentMethod: 'credit-card',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 1789.99,
        discount: 0,
        cardDetails: { cardNumber: '1234', cardName: 'JUAN MARTINEZ', cardExpiry: '12/26' }
      },
      {
        id: 6,
        orderNumber: 'ORD-1704067200006-5432',
        date: '22/08/2024',
        total: 425.50,
        status: 'Entregado',
        items: [
          { name: 'Pre-entreno Explosión', quantity: 2, price: 189.99 },
          { name: 'Shaker Proteico', quantity: 1, price: 45.52 }
        ],
        paymentMethod: 'digital-wallet',
        customer: {
          name: 'Juan Martinez',
          email: 'juan@studiofit.com',
          phone: '+52 (449) 123-4567',
          address: 'Avenida Principal 123, Apartamento 4B',
          city: 'Ciudad de México, CP 28000',
          country: 'México'
        },
        subtotal: 425.50,
        discount: 0,
        walletBalance: 4574.50
      }
    ];

    const purchase = purchaseHistory.find(p => p.id === purchaseId);
    if (!purchase) return;

    // Crear modal con los detalles de la factura
    const modalId = 'purchaseDetailModal-' + purchaseId;
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 3000;
      overflow-y: auto;
      padding: 2rem;
    `;

    // Construir HTML de detalles de pago
    let paymentDetailsHtml = '';
    if (purchase.paymentMethod === 'credit-card') {
      const cardDetails = purchase.cardDetails || {};
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💳 Tarjeta de Crédito</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Número:</strong> ••••••••••••${cardDetails.cardNumber || '1234'}</div>
            <div><strong>Titular:</strong> ${cardDetails.cardName || 'JUAN MARTINEZ'}</div>
            <div><strong>Vencimiento:</strong> ${cardDetails.cardExpiry || '12/26'}</div>
          </div>
        </div>
      `;
    } else if (purchase.paymentMethod === 'debit-card') {
      const cardDetails = purchase.cardDetails || {};
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💰 Tarjeta de Débito</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Número:</strong> ••••••••••••${cardDetails.cardNumber || '5678'}</div>
            <div><strong>Titular:</strong> ${cardDetails.cardName || 'JUAN MARTINEZ'}</div>
            <div><strong>Vencimiento:</strong> ${cardDetails.cardExpiry || '09/25'}</div>
          </div>
        </div>
      `;
    } else if (purchase.paymentMethod === 'bank-transfer') {
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>🏦 Transferencia Bancaria</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Banco:</strong> Banco Nacional</div>
            <div><strong>Cuenta:</strong> •••••••••9876</div>
            <div><strong>Referencia:</strong> <span style="color: #d4af37; font-weight: 600;">${purchase.bankReference || 'ORD-1234567890-5432'}</span></div>
          </div>
        </div>
      `;
    } else if (purchase.paymentMethod === 'paypal') {
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>🅿️ PayPal</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>Email:</strong> juan.martinez@email.com</div>
            <div><strong>Verificado:</strong> <span style="color: #4CAF50;">✓ Sí</span></div>
            <div><strong>Estado:</strong> Procesado</div>
          </div>
        </div>
      `;
    } else if (purchase.paymentMethod === 'digital-wallet') {
      const walletBalance = purchase.walletBalance || 4574.50;
      paymentDetailsHtml = `
        <div style="font-size: 0.9rem; line-height: 1.8;">
          <div><strong>💻 Cartera Electrónica</strong></div>
          <div style="margin-top: 0.6rem;">
            <div><strong>ID Cartera:</strong> WLT-JM-2024</div>
            <div><strong>Saldo Inicial:</strong> $5000.00</div>
            <div><strong>Saldo Final:</strong> <span style="color: #4CAF50; font-weight: 600;">$${walletBalance.toFixed(2)}</span></div>
          </div>
        </div>
      `;
    }

    // Renderizar items
    let itemsHtml = '';
    purchase.items.forEach(item => {
      const itemPrice = typeof item.price === 'number' ? item.price : parseInt(item.price.replace('$', ''));
      const itemTotal = itemPrice * item.quantity;
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #ddd;">
          <div>
            <p style="margin: 0; font-weight: 600;">${item.name}</p>
            <p style="margin: 0.3rem 0 0 0; font-size: 0.85rem; color: #888;">Cantidad: ${item.quantity} x $${itemPrice}</p>
          </div>
          <p style="margin: 0; font-weight: 600; color: #d4af37;">$${itemTotal}</p>
        </div>
      `;
    });

    modal.innerHTML = `
      <div style="background: #0a0e27; border: 2px solid #d4af37; border-radius: 10px; padding: 2rem; max-width: 800px; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);">
        <!-- Header de la Factura -->
        <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 style="color: #d4af37; font-size: 1.5rem; margin: 0 0 0.5rem 0; font-weight: 900;">FACTURA DE COMPRA</h2>
          <p style="color: #888; margin: 0 0 0.3rem 0; font-size: 0.85rem;">Studio Fit - Tienda Digital</p>
          <p style="color: #d4af37; font-weight: 700; margin: 0; font-size: 1rem;">Pedido: ${purchase.orderNumber}</p>
        </div>

        <!-- Datos del Cliente -->
        <div style="margin-bottom: 1rem;">
          <h3 style="color: #d4af37; margin: 0 0 0.5rem 0; font-size: 0.95rem; font-weight: 700; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 0.3rem;">DATOS DE CLIENTE</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; color: #ddd; font-size: 0.9rem;">
            <div>
              <p style="color: #888; font-size: 0.75rem; margin: 0 0 0.15rem 0; font-weight: 600;">NOMBRE</p>
              <p style="margin: 0; font-weight: 600;">${purchase.customer.name}</p>
            </div>
            <div>
              <p style="color: #888; font-size: 0.75rem; margin: 0 0 0.15rem 0; font-weight: 600;">EMAIL</p>
              <p style="margin: 0; font-weight: 600;">${purchase.customer.email}</p>
            </div>
            <div style="grid-column: 1 / -1;">
              <p style="color: #888; font-size: 0.75rem; margin: 0 0 0.15rem 0; font-weight: 600;">TELÉFONO</p>
              <p style="margin: 0; font-weight: 600;">${purchase.customer.phone}</p>
            </div>
          </div>
        </div>

        <!-- Dirección de Envío -->
        <div style="margin-bottom: 1rem;">
          <h3 style="color: #d4af37; margin: 0 0 0.5rem 0; font-size: 0.95rem; font-weight: 700; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 0.3rem;">DIRECCIÓN</h3>
          <div style="color: #ddd; line-height: 1.4; font-size: 0.9rem;">
            <p style="margin: 0; font-weight: 600;">${purchase.customer.address}</p>
            <p style="margin: 0;">${purchase.customer.city}</p>
            <p style="margin: 0;">${purchase.customer.country}</p>
          </div>
        </div>

        <!-- Artículos -->
        <div style="margin-bottom: 1rem;">
          <h3 style="color: #d4af37; margin: 0 0 0.5rem 0; font-size: 0.95rem; font-weight: 700; border-bottom: 1px solid rgba(212, 175, 55, 0.3); padding-bottom: 0.3rem;">ARTÍCULOS</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
            ${itemsHtml}
          </div>
        </div>

        <!-- Resumen de Pago -->
        <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 6px; padding: 1rem; margin-bottom: 1rem; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #ddd;">
            <span>Subtotal:</span>
            <span style="font-weight: 600;">$${purchase.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; color: #d4af37;">
            <span>TOTAL:</span>
            <span>$${purchase.total.toFixed(2)}</span>
          </div>
        </div>

        <!-- Método de Pago -->
        <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 6px; padding: 1rem; margin-bottom: 1rem; font-size: 0.9rem;">
          <h3 style="color: #ffc107; margin: 0 0 0.4rem 0; font-size: 0.95rem; font-weight: 700;">PAGO</h3>
          <div style="color: #ddd;">
            ${paymentDetailsHtml}
          </div>
        </div>

        <!-- Pie de Factura -->
        <div style="text-align: center; border-top: 1px solid #d4af37; padding-top: 0.8rem; margin-bottom: 1.5rem; color: #888; font-size: 0.85rem;">
          <p style="margin: 0 0 0.3rem 0;">Fecha: <strong style="color: #d4af37;">${purchase.date}</strong></p>
          <p style="margin: 0;">Estado: <strong style="color: #2196F3;">${purchase.status}</strong></p>
          <p style="margin-top: 0.3rem;">Gracias por tu compra</p>
        </div>

        <!-- Botones -->
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="document.getElementById('${modalId}').remove()" style="padding: 0.7rem 1.5rem; background: rgba(212, 175, 55, 0.2); border: 2px solid #d4af37; color: #d4af37; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: 0.3s;" 
                  onmouseover="this.style.background='rgba(212, 175, 55, 0.3)'" 
                  onmouseout="this.style.background='rgba(212, 175, 55, 0.2)'">
            ← Volver
          </button>
          <button onclick="alert('🖨️ Imprimiendo factura...'); document.getElementById('${modalId}').remove();" style="padding: 0.7rem 1.5rem; background: linear-gradient(135deg, #d4af37 0%, #f0c060 100%); color: #050813; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.9rem; transition: 0.3s;" 
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(212, 175, 55, 0.4)'" 
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            🖨️ Imprimir
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}

// Inicializar la aplicacion
const app = new App();
window.app = app;
window.filterProducts = (category) => app.filterProducts(category);
