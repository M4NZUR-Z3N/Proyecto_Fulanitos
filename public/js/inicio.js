// --- Navbar scroll effect ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// --- Intersection Observer para animaciones de entrada ---
const animatedElements = document.querySelectorAll('[data-animate]');

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;

            setTimeout(() => {
                el.classList.add('is-visible');
            }, delay);

            observer.unobserve(el);
        }
    });
}, observerOptions);

animatedElements.forEach(el => observer.observe(el));

// --- Carga dinámica de Discos Destacados (Desde API Discogs) ---
// Aquí puedes modificar los 4 IDs que quieras destacar en el inicio
const DISCOS_DESTACADOS_IDS = [2712996, 2760422, 7282012, 380980];

async function cargarDestacados() {
    const destacadosContainer = document.getElementById('destacados-container');
    if (!destacadosContainer) return;

    // Ejecutamos las promises simultáneamente
    const promesas = DISCOS_DESTACADOS_IDS.map(id => obtenerDatos(id));
    const resultados = await Promise.all(promesas);

    destacadosContainer.innerHTML = ''; // Quitamos el spinner cargando

    resultados.forEach((data, index) => {
        if (data && !data.message?.includes('not found')) {
            const artista = data.artists && data.artists[0] ? data.artists[0].name : "Artista Desconocido";
            const titulo = data.title || "Título Desconocido";
            const cover = (data.images && data.images.length > 0) ? data.images[0].resource_url : "../assets/images/portadas/vinilo-base.webp";
            // Tomamos el mismo comportamiento para el precio: tomamos 'num_for_sale' u originamos uno default "15.00"
            const precio = data.num_for_sale ? data.num_for_sale.toString() : "15.00";

            // Para mantener la estética que tenías, simulamos que algunos traen tags visuales "Nuevo" y "Limitado" 
            let badgeHtml = '';

            const productoCol = document.createElement('div');
            productoCol.className = 'col-6 col-md-4 col-lg-3';
            productoCol.setAttribute('data-animate', 'fade-up');
            productoCol.setAttribute('data-delay', (index * 100).toString());

            productoCol.innerHTML = `
            <div class="product-card h-100 d-flex flex-column text-start">
              <div class="product-img-wrap" style="aspect-ratio: 1/1;">
                <img src="${cover}" alt="${titulo}" class="img-fluid product-img w-100 h-100" style="object-fit: cover;">
                <div class="product-overlay">
                  <a href="/catalogo?id=${data.id}" class="btn-add-cart text-decoration-none">Ir al disco</a>
                </div>
                ${badgeHtml}
              </div>
              <div class="product-info mt-3 flex-grow-1 d-flex flex-column justify-content-start text-dark">
                  <p class="product-artist m-0 text-secondary text-truncate small">${artista}</p>
                  <h6 class="product-title m-0 fw-bold text-truncate" title="${titulo}">${titulo}</h6>
                  <span class="product-price fw-bold mt-2">$${parseFloat(precio).toFixed(2)}</span>
              </div>
            </div>`;

            destacadosContainer.appendChild(productoCol);
        }
    });

    // Re-ejecutamos manualmente los observer en los nuevos nodos
    destacadosContainer.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

cargarDestacados();
