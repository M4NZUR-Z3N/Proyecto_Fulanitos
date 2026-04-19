// Variable global simulando la sesión del usuario.
// Se puede cambiar a "true" o "false" para probar la interacción.
window.enSesion = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Activar pestaña actual dependiendo de la URL
    const pathname = window.location.pathname;

    // Obtenemos todos los enlaces de navegación del header con clase nav-link-custom
    const navLinks = document.querySelectorAll('.nav-link-custom');

    navLinks.forEach(link => {
        // Quitamos "active" de todos primero (por si quedó pegado)
        link.classList.remove('active');

        // Comparamos el href
        const href = link.getAttribute('href');

        // Verificamos si estamos en la ruta correcta evitando que '/' coincida siempre
        if (pathname === href || (href !== '/' && pathname.startsWith(href))) {
            link.classList.add('active');
        }
    });

    // 2. Controlar la visibilidad de elementos según si hay sesión
    // Header
    const carritoLinkItem = document.getElementById('nav-item-carrito');
    const perfilLinkItem = document.getElementById('nav-item-perfil');
    const iniciarSesionItem = document.getElementById('nav-item-iniciar-sesion');
    const registrarseItem = document.getElementById('nav-item-registrarse');
    const cerrarSesionItem = document.getElementById('nav-item-cerrar-sesion');

    // Footer
    const footerCarritoItem = document.getElementById('footer-item-carrito');
    const footerPerfilItem = document.getElementById('footer-item-perfil');
    const footerIniciarSesionItem = document.getElementById('footer-item-iniciar-sesion');
    const footerRegistrarseItem = document.getElementById('footer-item-registrarse');
    const footerCerrarSesionItem = document.getElementById('footer-item-cerrar-sesion');

    if (window.enSesion) {
        if (carritoLinkItem) carritoLinkItem.style.display = 'block';
        if (perfilLinkItem) perfilLinkItem.style.display = 'block';
        if (iniciarSesionItem) iniciarSesionItem.style.display = 'none';
        if (registrarseItem) registrarseItem.style.display = 'none';
        if (cerrarSesionItem) cerrarSesionItem.style.display = 'block';

        if (footerCarritoItem) footerCarritoItem.style.display = 'block';
        if (footerPerfilItem) footerPerfilItem.style.display = 'block';
        if (footerIniciarSesionItem) footerIniciarSesionItem.style.display = 'none';
        if (footerRegistrarseItem) footerRegistrarseItem.style.display = 'none';
        if (footerCerrarSesionItem) footerCerrarSesionItem.style.display = 'block';
    } else {
        if (carritoLinkItem) carritoLinkItem.style.display = 'none';
        if (perfilLinkItem) perfilLinkItem.style.display = 'none';
        if (iniciarSesionItem) iniciarSesionItem.style.display = 'block';
        if (registrarseItem) registrarseItem.style.display = 'block';
        if (cerrarSesionItem) cerrarSesionItem.style.display = 'none';

        if (footerCarritoItem) footerCarritoItem.style.display = 'none';
        if (footerPerfilItem) footerPerfilItem.style.display = 'none';
        if (footerIniciarSesionItem) footerIniciarSesionItem.style.display = 'block';
        if (footerRegistrarseItem) footerRegistrarseItem.style.display = 'block';
        if (footerCerrarSesionItem) footerCerrarSesionItem.style.display = 'none';
    }
});