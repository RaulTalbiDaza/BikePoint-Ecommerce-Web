// --- DATOS AMPLIADOS DE LOS PRODUCTOS (BikePoint) ---
const products = [
    { id: 1, name: 'Mountain Pro XT', price: 899, category: 'montaña', img: 'https://images.unsplash.com/photo-1576435728678-68ce0f6eb294?auto=format&fit=crop&w=600&q=80', rating: 4.8, reviews: 124 },
    { id: 2, name: 'Aero Speed Carbon', price: 1250, category: 'ruta', img: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=600&q=80', rating: 4.9, reviews: 89 },
    { id: 3, name: 'City Cruiser Elegance', price: 450, category: 'urbana', img: 'https://images.unsplash.com/photo-1528629297340-d1d466945cb5?auto=format&fit=crop&w=600&q=80', rating: 4.5, reviews: 210 },
    { id: 4, name: 'Trail Blazer 500', price: 750, category: 'montaña', img: 'https://images.unsplash.com/photo-1560790671-b76ca4de55ef?auto=format&fit=crop&w=600&q=80', rating: 4.7, reviews: 56 },
    { id: 5, name: 'Endurance Road 105', price: 980, category: 'ruta', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80', rating: 4.6, reviews: 72 },
    { id: 6, name: 'Urban Foldable X', price: 520, category: 'urbana', img: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&w=600&q=80', rating: 4.4, reviews: 118 },
];

let currentProducts = [...products];
let cart = []; 
let favorites = []; // Array para IDs de productos favoritos

// --- GESTIÓN DEL CARRITO (Con animación) ---
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    updateCartUI();
    
    // Animación del carrito
    const cartIcon = document.getElementById('cart-icon-container');
    cartIcon.classList.remove('animate-cart');
    void cartIcon.offsetWidth; // Trigger reflow (reiniciar animación)
    cartIcon.classList.add('animate-cart');
    
    // Feedback visual en el botón
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "¡Añadido!";
    btn.style.backgroundColor = "var(--color-black)";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "";
    }, 1000);
}

// --- FAVORITOS ---
function toggleFavorite(productId, event) {
    event.stopPropagation(); // Evitar otros clics o burbujeos
    const icon = event.target;
    // Si se hizo click directamente en la ruta del SVG en fontawesome, cogemos el padre
    const targetElement = icon.tagName === 'path' ? icon.parentElement : icon;
    const btnContainer = targetElement.parentElement;
    
    const index = favorites.indexOf(productId);
    
    if (index === -1) {
        favorites.push(productId);
        targetElement.classList.remove('fa-regular');
        targetElement.classList.add('fa-solid');
        btnContainer.classList.add('active');
    } else {
        favorites.splice(index, 1);
        targetElement.classList.remove('fa-solid');
        targetElement.classList.add('fa-regular');
        btnContainer.classList.remove('active');
    }
}

// --- CÁLCULO TOTAL Y ENVÍO ---
function calculateTotal() {
    let subtotal = 0;
    for (let item of cart) {
        const product = products.find(p => p.id === item.id);
        if (product) subtotal += product.price * item.quantity;
    }
    
    let shipping = 0;
    if (subtotal > 0 && subtotal < 1000) {
        shipping = 50; // Envío por defecto
    }
    // Si subtotal > 1000, envío = 0
    
    return { subtotal, shipping, total: subtotal + shipping };
}

// --- FILTROS Y BÚSQUEDA ---
function renderProducts(category = 'todas') {
    if (category === 'todas') {
        currentProducts = [...products];
    } else {
        currentProducts = products.filter(product => product.category === category);
    }
    // Aplicar ordenación actual si existe
    sortProducts(); 
}

function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        currentProducts = [...products]; // Restablecer si está vacío
    } else {
        currentProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
    }
    sortProducts();
}

// --- ORDENACIÓN ---
function sortProducts() {
    const sortType = document.getElementById('sort-select').value;
    
    if (sortType === 'asc') {
        currentProducts.sort((a, b) => a.price - b.price);
    } else if (sortType === 'desc') {
        currentProducts.sort((a, b) => b.price - a.price);
    }
    // 'default' no hace nada, mantiene el orden actual
    
    displayProducts(currentProducts);
}

// --- SESIÓN ---
let userSession = { loggedIn: false, username: '' };

function login() {
    const sessionDiv = document.getElementById('session-info');
    if (userSession.loggedIn) {
        userSession.loggedIn = false;
        userSession.username = '';
        sessionDiv.innerHTML = `<button class="btn-outline" onclick="login()">Iniciar Sesión</button>`;
    } else {
        const name = prompt('Introduce tu nombre para iniciar sesión:');
        if (name && name.trim() !== '') {
            userSession.loggedIn = true;
            userSession.username = name;
            sessionDiv.innerHTML = `
                <span style="font-weight: 600; margin-right: 1rem; color: var(--color-black);"><i class="fa-regular fa-user"></i> ${name}</span>
                <button class="btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="login()">Salir</button>
            `;
        }
    }
}

// --- UI HELPERS ---
function displayProducts(productsToShow) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = ''; 
    
    if (productsToShow.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: #7f8c8d;">No se encontraron productos que coincidan con tu búsqueda.</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const isFav = favorites.includes(product.id);
        const heartClass = isFav ? 'fa-solid' : 'fa-regular';
        const activeClass = isFav ? 'active' : '';
        
        // Generar Estrellas HTML
        const stars = Array(5).fill(0).map((_, i) => {
            if (i < Math.floor(product.rating)) return '<i class="fa-solid fa-star"></i>';
            if (i < product.rating) return '<i class="fa-solid fa-star-half-stroke"></i>';
            return '<i class="fa-regular fa-star"></i>';
        }).join('');

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="favorite-btn ${activeClass}" onclick="toggleFavorite(${product.id}, event)">
                <i class="${heartClass} fa-heart"></i>
            </div>
            <div class="product-image-container">
                <img src="${product.img}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-rating">
                    ${stars} <span>(${product.reviews})</span>
                </div>
                <div class="product-price">$${product.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Añadir al Carrito</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItems;
    
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align: center; color: var(--color-gray-dark); margin-top: 2rem;">
                <i class="fa-solid fa-basket-shopping" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Tu carrito está vacío</p>
            </div>`;
    } else {
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${product.name}</h4>
                        <p style="font-size: 0.8rem; color: var(--color-gray-dark);">Cantidad: ${item.quantity}</p>
                    </div>
                    <div style="font-weight: 700; font-family: var(--font-title);">$${product.price * item.quantity}</div>
                `;
                cartItemsContainer.appendChild(div);
            }
        });
    }
    
    const { subtotal, shipping, total } = calculateTotal();
    
    document.getElementById('cart-subtotal').innerText = subtotal;
    // Mostrar 'Gratis' si shipping es 0 y hay productos
    document.getElementById('cart-shipping').innerText = (shipping === 0 && subtotal > 0) ? 'Gratis' : shipping;
    document.getElementById('cart-total').innerText = total;
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar.classList.contains('hidden')) {
        sidebar.classList.remove('hidden');
    } else {
        sidebar.classList.add('hidden');
    }
}

function toggleMenu() {
    const nav = document.getElementById('main-nav');
    nav.classList.toggle('active');
}

function scrollToProducts() {
    document.getElementById('productos-section').scrollIntoView({ behavior: 'smooth' });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    renderProducts('todas');
    updateCartUI(); // Inicializa el carrito vacío con mensaje
});
