// Variable global basada en el navegador (Local Storage) para mantener la sesión viva entre páginas.
window.enSesion = localStorage.getItem('enSesion') === 'true';

// Inyectar CSS dinámico inmediatamente para evita el parpadeo de botones (FOUC)
const dynamicStyle = document.createElement('style');
if (window.enSesion) {
    dynamicStyle.innerHTML = `
        #nav-item-iniciar-sesion, #nav-item-registrarse,
        #footer-item-iniciar-sesion, #footer-item-registrarse { display: none !important; }
        
        #nav-item-carrito, #nav-item-perfil, #nav-item-cerrar-sesion,
        #footer-item-carrito, #footer-item-perfil, #footer-item-cerrar-sesion { display: block !important; }
    `;
} else {
    dynamicStyle.innerHTML = `
        #nav-item-carrito, #nav-item-perfil, #nav-item-cerrar-sesion,
        #footer-item-carrito, #footer-item-perfil, #footer-item-cerrar-sesion { display: none !important; }
        
        #nav-item-iniciar-sesion, #nav-item-registrarse,
        #footer-item-iniciar-sesion, #footer-item-registrarse { display: block !important; }
    `;
}
document.head.appendChild(dynamicStyle);

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

    // 2. Lógica para Cerrar sesión
    // Buscamos los botones en el Header y Footer
    const btnCerrarSesionNav = document.getElementById('nav-item-cerrar-sesion');
    const btnCerrarSesionFooter = document.getElementById('footer-item-cerrar-sesion');

    const cerrarSesion = (e) => {
        e.preventDefault(); // Evitamos que siga el link de golpe
        
        // Limpiamos los datos locales
        localStorage.removeItem('enSesion');
        localStorage.removeItem('token');
        
        // Volvemos a inicio
        window.location.href = '/';
    };

    if (btnCerrarSesionNav) btnCerrarSesionNav.addEventListener('click', cerrarSesion);
    if (btnCerrarSesionFooter) btnCerrarSesionFooter.addEventListener('click', cerrarSesion);
});