// --- 1. DATOS DE PRODUCTOS ---
const products = [
    { id: 1, name: 'Mountain Pro XT', price: 899, category: 'montaña', img: 'resources/img/Mountain Pro XT.png', rating: 4.8, reviews: 124, description: 'Bicicleta de montaña de alto rendimiento ideal para terrenos abruptos. Cuenta con suspensión completa y frenos de disco hidráulicos para máxima seguridad.' },
    { id: 2, name: 'Aero Speed Carbon', price: 1250, category: 'ruta', img: 'resources/img/Aero Speed Carbon.png', rating: 4.9, reviews: 89, description: 'Diseñada para la velocidad. Marco de fibra de carbono ultra ligero y diseño aerodinámico que corta el viento. Perfecta para competiciones.' },
    { id: 3, name: 'City Cruiser Elegance', price: 450, category: 'urbana', img: 'resources/img/City Cruiser Elegance.png', rating: 4.5, reviews: 210, description: 'La compañera perfecta para la ciudad. Postura cómoda, guardabarros, y luces integradas. Desplázate con estilo y comodidad.' },
    { id: 4, name: 'Trail Blazer 500', price: 750, category: 'montaña', img: 'resources/img/Trail Blazer 500.png', rating: 4.7, reviews: 56, description: 'Excelente relación calidad-precio. Suspensión delantera ajustable y transmisión de 21 velocidades para afrontar cualquier cuesta.' },
    { id: 5, name: 'Endurance Road 105', price: 980, category: 'ruta', img: 'resources/img/Endurance Road 105.png', rating: 4.6, reviews: 72, description: 'Para largas distancias. Su geometría enfocada en el confort te permite pedalear durante horas sin fatiga. Equipada con grupo Shimano 105.' },
    { id: 6, name: 'Urban Foldable X', price: 520, category: 'urbana', img: 'resources/img/Urban Foldable X.png', rating: 4.4, reviews: 118, description: 'Bicicleta plegable compacta y ligera. Ideal para combinar con el transporte público y guardarla en casa ocupando el mínimo espacio.' },
];

// Estado Global
let cart = []; 
let favorites = [];
let currentCategory = 'todas';

// --- 2. GESTIÓN DEL CARRITO ---
function addToCart(id) {
    const item = cart.find(i => i.id === id);
    item ? item.quantity++ : cart.push({ id, quantity: 1 });
    updateCartUI();
    
    // Animación visual rápida
    const icon = document.getElementById('cart-icon-container');
    icon.classList.remove('animate-cart');
    void icon.offsetWidth; // reiniciar animación
    icon.classList.add('animate-cart');
}

// NUEVO: Eliminar del carrito
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    // Cálculos de totales usando .reduce() para simplificar
    let subtotal = cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id).price * item.quantity), 0);
    let shipping = (subtotal > 0 && subtotal < 1000) ? 50 : 0;
    
    // Actualizar textos en el DOM
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.getElementById('cart-subtotal').innerText = subtotal;
    document.getElementById('cart-shipping').innerText = shipping === 0 && subtotal > 0 ? 'Gratis' : shipping;
    document.getElementById('cart-total').innerText = subtotal + shipping;

    // Pintar productos del carrito
    const container = document.getElementById('cart-items');
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--color-gray-dark);"><i class="fa-solid fa-basket-shopping" style="font-size:3rem; opacity:0.5; margin-bottom:1rem;"></i><p>Carrito vacío</p></div>';
        return;
    }
    
    // Generar el HTML del carrito usando .map()
    container.innerHTML = cart.map(item => {
        const p = products.find(p => p.id === item.id);
        return `
        <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding:10px 0;">
            <div class="cart-item-info">
                <h4 style="font-size:0.95rem; font-weight:500;">${p.name}</h4>
                <p style="font-size:0.8rem; color:#7f8c8d;">Cant: ${item.quantity} | $${p.price * item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${p.id})" style="color:#ff4757; background:none; border:none; cursor:pointer; font-size:1.2rem; transition:0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>`;
    }).join('');
}

// --- 3. FILTROS Y ORDENACIÓN (Todo unificado en una sola función para mayor simplicidad) ---
function renderProducts(category = currentCategory) {
    currentCategory = category;
    const search = document.getElementById('search-input').value.toLowerCase();
    const sort = document.getElementById('sort-select').value;

    // 1. Filtrar por categoría y búsqueda simultáneamente
    let filtered = products.filter(p => {
        const matchCat = category === 'todas' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search);
        return matchCat && matchSearch;
    });

    // 2. Ordenar
    if (sort === 'asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'desc') filtered.sort((a, b) => b.price - a.price);

    // 3. Pintar en el HTML
    const grid = document.getElementById('product-grid');
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#7f8c8d;">No hay resultados.</p>';
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const isFav = favorites.includes(p.id);
        return `
        <div class="product-card">
            <div class="favorite-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id}, event)">
                <i class="fa-heart ${isFav ? 'fa-solid' : 'fa-regular'}"></i>
            </div>
            <div class="product-image-container" onclick="openProductDetails(${p.id})" style="cursor:pointer;">
                <img src="${p.img}" class="product-image" alt="${p.name}">
            </div>
            <div class="product-info">
                <span class="product-category">${p.category}</span>
                <h3 class="product-title" onclick="openProductDetails(${p.id})" style="cursor:pointer;">${p.name}</h3>
                <div class="product-rating" style="color:#f1c40f; font-size:0.9rem; margin-bottom:10px;">
                    <i class="fa-solid fa-star"></i> ${p.rating} <span style="color:#7f8c8d;">(${p.reviews})</span>
                </div>
                <div class="product-price">$${p.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Añadir al Carrito</button>
            </div>
        </div>`;
    }).join('');
}

// Alias para los eventos del HTML
const searchProducts = () => renderProducts();
const sortProducts = () => renderProducts();

// --- 4. FAVORITOS ---
function toggleFavorite(id, event) {
    event.stopPropagation();
    // Si ya está, lo quitamos. Si no, lo añadimos.
    favorites.includes(id) ? favorites = favorites.filter(f => f !== id) : favorites.push(id);
    renderProducts(); // Repintar para actualizar el corazón
}

// --- 5. SESIÓN DE USUARIO ---
let session = { loggedIn: false, name: '' };

function login() {
    const div = document.getElementById('session-info');
    if (session.loggedIn) {
        session = { loggedIn: false, name: '' };
        div.innerHTML = `<button class="btn-outline" onclick="login()">Iniciar Sesión</button>`;
    } else {
        const name = prompt('Nombre para iniciar sesión:');
        if (name && name.trim() !== '') {
            session = { loggedIn: true, name };
            div.innerHTML = `
                <span style="font-weight:600; margin-right:1rem; color:var(--color-black);"><i class="fa-regular fa-user"></i> ${name}</span>
                <button class="btn-outline" style="padding:0.3rem 0.8rem; font-size:0.8rem;" onclick="login()">Salir</button>
            `;
        }
    }
}

// --- 6. UTILIDADES UI ---
const toggleCart = () => document.getElementById('cart-sidebar').classList.toggle('hidden');
const toggleMenu = () => document.getElementById('main-nav').classList.toggle('active');
const scrollToProducts = () => document.getElementById('productos-section').scrollIntoView({ behavior: 'smooth' });

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});

// --- 7. DETALLES DEL PRODUCTO (MODAL) ---
function openProductDetails(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    
    // Generar estrellas visuales
    const stars = Array(5).fill(0).map((_, i) => 
        i < Math.floor(p.rating) ? '<i class="fa-solid fa-star"></i>' : 
        i < p.rating ? '<i class="fa-solid fa-star-half-stroke"></i>' : 
        '<i class="fa-regular fa-star"></i>'
    ).join('');

    document.getElementById('modal-body').innerHTML = `
        <div class="modal-flex">
            <img src="${p.img}" alt="${p.name}" class="modal-image">
            <div class="modal-info">
                <span style="font-size: 0.8rem; color: #7f8c8d; text-transform: uppercase; font-weight: bold; margin-bottom: 0.5rem;">${p.category}</span>
                <h2 style="font-size:2rem; margin-bottom:0.5rem; color:var(--color-black);">${p.name}</h2>
                <div style="color:#f1c40f; margin-bottom:1rem;">
                    ${stars} <span style="color:#7f8c8d; margin-left:5px;">(${p.reviews} valoraciones)</span>
                </div>
                <div style="font-size:2.2rem; font-weight:800; color:var(--color-blue); margin-bottom:1.5rem;">$${p.price}</div>
                <p class="modal-desc" style="flex-grow:1;">${p.description}</p>
                <div style="margin-top:2rem;">
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id}); closeProductDetails()" style="font-size:1.1rem; padding:1.2rem; display:flex; align-items:center; justify-content:center; gap:10px;">
                        <i class="fa-solid fa-cart-plus"></i> Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductDetails() {
    document.getElementById('product-modal').classList.add('hidden');
}
