/* ============================================
   SIDE B — INICIO.JS
============================================ */

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
