// Selección de elementos del DOM para el modal y detalles
const detalles = document.getElementById('detalles');
const bgBorroso = document.getElementById('bg-borroso');
const botonAñadir = document.getElementById('boton-añadir');
const botonMas = document.getElementById('boton-mas');
const botonMenos = document.getElementById('boton-menos');
const spanCantidad = document.getElementById('cantidad');
const discos = document.getElementById('discos');
const spanPrecioTotal = document.getElementById('detalle-precio-total');

// Variables de estado
let cantidad = 1;
let precioActualUnitario = 0;
let productoActualId = null;
let paginaActual = 1;

// Lógica para mostrar u ocultar el modal de detalles
function abrirDetalles() {
    detalles.classList.remove('d-none');
    bgBorroso.classList.remove('d-none');

    // Solo permitir añadir al carrito si el usuario inició sesión
    const cantidadCont = document.querySelector('.cantidad');
    const precioTotalCont = document.getElementById('detalle-precio-total');

    if (window.enSesion) {
        botonAñadir.style.display = '';
        if (cantidadCont) cantidadCont.style.display = 'flex';
        if (precioTotalCont) precioTotalCont.style.display = 'inline';
    } else {
        botonAñadir.style.display = 'none';
        if (cantidadCont) cantidadCont.style.display = 'none';
        if (precioTotalCont) precioTotalCont.style.display = 'none';
    }
}

function cerrarDetalles() {
    detalles.classList.add('d-none');
    bgBorroso.classList.add('d-none');
}

// Actualizar el precio total según la cantidad seleccionada
function actualizarPrecioTotal() {
    if (spanPrecioTotal) {
        spanPrecioTotal.textContent = `Precio total: $${(cantidad * precioActualUnitario).toFixed(2)}`;
    }
}

// Controlar el contador de cantidad (+ / -)
function aumentarCantidad() {
    cantidad++;
    spanCantidad.textContent = cantidad;
    actualizarPrecioTotal();
}

function disminuirCantidad() {
    if (cantidad > 1) {
        cantidad--;
        spanCantidad.textContent = cantidad;
        actualizarPrecioTotal();
    }
}

// Enviar el producto al carrito mediante la API
async function añadirAlCarrito() {
    const token = localStorage.getItem('token');
    if (!token || !window.enSesion) {
        Swal.fire({ icon: 'warning', title: 'Inicia sesión', text: 'Debes iniciar sesión para añadir productos al carrito' });
        return;
    }

    try {
        const res = await fetch('/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ productoId: productoActualId, cantidad: cantidad })
        });
        const data = await res.json();

        if (res.ok) {
            Swal.fire({ icon: 'success', title: '¡Añadido!', text: 'El producto se guardó en tu carrito.', timer: 2000, showConfirmButton: false });
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje || 'No se pudo añadir al carrito' });
        }
    } catch (err) {
        Swal.fire({ icon: 'error', title: 'Problema de red', text: 'El servidor no responde.' });
    }
}

// Crear la estructura HTML para cada disco
function renderizarDisco(data, fromSearch = false) {
    if (!data || data.message?.includes('not found')) return null;

    let id = data.id ? data.id.toString() : Date.now().toString();
    let artista = "Artista Desconocido";
    let titulo = "Título Desconocido";
    let cover = "../assets/images/portadas/vinilo-base.webp";
    let genero = "Género Desconocido";
    let formato = "Formato Desconocido";
    let precio = "20.00";
    let anio = data.year || "Desconocido";

    if (fromSearch) {
        // Procesar datos si vienen de una búsqueda
        const partesTitulo = data.title ? data.title.split(' - ') : [];
        if (partesTitulo.length >= 2) {
            artista = partesTitulo[0];
            titulo = partesTitulo.slice(1).join(' - ');
        } else {
            titulo = data.title || titulo;
        }
        cover = data.cover_image || cover;
        genero = data.genre && data.genre.length > 0 ? data.genre[0] : genero;
        formato = data.format && data.format.length > 0 ? data.format.join(', ') : formato;
        precio = (Math.floor(Math.random() * 20) + 10).toString();
    } else {
        // Procesar datos directos de un release
        artista = data.artists && data.artists[0] ? data.artists[0].name : "Artista Desconocido";
        titulo = data.title || "Título Desconocido";
        cover = (data.images && data.images.length > 0) ? data.images[0].resource_url : cover;
        genero = data.genres && data.genres.length > 0 ? data.genres[0] : genero;
        formato = data.formats && data.formats[0] ? data.formats[0].name : formato;
        precio = data.num_for_sale ? data.num_for_sale.toString() : "15.00";
    }

    const producto = document.createElement('div');
    producto.classList.add('btn', 'mt-5', 'col-lg-2', 'col-md-3', 'col-4', 'text-start');

    producto.innerHTML = `
        <div class="product-card h-100 d-flex flex-column text-start">
            <div class="product-img-wrap rounded shadow-sm mb-3">
                <img src="${cover}" alt="${titulo}" class="product-img">
                <div class="product-overlay d-flex align-items-center justify-content-center">
                    <span class="btn btn-outline-light rounded-0 border-2" style="font-size: 0.8rem; pointer-events: none; letter-spacing: 0.1em; font-weight: bold; text-transform: uppercase;">Detalles</span>
                </div>
            </div>
            <div class="d-flex flex-column flex-grow-1 justify-content-between px-1">
                <div>
                    <p class="product-artist text-truncate m-0" title="${artista}">${artista}</p>
                    <h3 class="product-title text-truncate m-0 my-1 fs-6" title="${titulo}">${titulo}</h3>
                </div>
                <div class="product-footer mt-2 pt-2 border-top">
                    <span class="product-price fs-5">$${precio}</span>
                    <span class="product-format text-truncate text-end ms-2" style="max-width: 50%; opacity: 0.7;" title="${formato}">${formato}</span>
                </div>
            </div>
        </div>
    `;

    // Click al disco para abrir el modal
    producto.addEventListener('click', function () {
        cantidad = 1;
        spanCantidad.textContent = cantidad;
        productoActualId = id;
        precioActualUnitario = parseFloat(precio) || 10.00;

        document.getElementById('detalle-cover').src = cover;
        document.getElementById('detalle-titulo').textContent = titulo;
        document.getElementById('detalle-artista').textContent = `Artista: ${artista}`;
        document.getElementById('detalle-genero').textContent = `Género: ${genero}`;
        document.getElementById('detalle-anio').textContent = `Año de lanzamiento: ${anio}`;
        document.getElementById('detalle-formato').textContent = `Formato: ${formato}`;
        document.getElementById('detalle-precio').textContent = `Precio Unitario: $${precioActualUnitario.toFixed(2)}`;

        actualizarPrecioTotal();
        abrirDetalles();
    });
    return producto;
}

// Cargar una página específica del catálogo
async function cargarPagina(pagina) {
    discos.innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-light" role="status"></div><p>Cargando catálogo...</p></div>';

    let start = 15;
    let end = 30;
    if (pagina === 2) { start = 31; end = 45; }
    else if (pagina === 3) { start = 46; end = 60; }

    const promesas = [];
    for (let i = start; i <= end; i++) {
        promesas.push(obtenerDatos(i));
    }

    const resultados = await Promise.all(promesas);
    discos.innerHTML = '';

    // Marcar botón activo en la paginación
    document.querySelectorAll('#paginacion-container .page-item a').forEach(a => a.style.fontWeight = 'normal');
    const linkActivo = document.getElementById(`page-${pagina}`);
    if (linkActivo) linkActivo.style.fontWeight = 'bold';

    resultados.forEach((data) => {
        const prodElement = renderizarDisco(data, false);
        if (prodElement) discos.appendChild(prodElement);
    });

    if (discos.innerHTML === '') {
        discos.innerHTML = '<p class="text-center w-100 mt-5">No se encontraron productos o hubo un error.</p>';
    }
}

// Buscar discos por texto
async function ejecutarBusqueda(query) {
    discos.innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-light" role="status"></div><p>Buscando...</p></div>';
    document.querySelectorAll('#paginacion-container .page-item a').forEach(a => a.style.fontWeight = 'normal');

    const resultados = await buscarDatos(query);
    discos.innerHTML = '';

    if (resultados && resultados.length > 0) {
        resultados.forEach((data) => {
            const prodElement = renderizarDisco(data, true);
            if (prodElement) discos.appendChild(prodElement);
        });
    }

    if (discos.innerHTML === '') {
        discos.innerHTML = '<p class="text-center w-100 mt-5">No se encontraron resultados para tu búsqueda.</p>';
    }
}

// Cambiar entre páginas (1, 2, 3)
function cambiarPagina(pagina) {
    paginaActual = pagina;
    const buscador = document.getElementById('buscador-catalogo');
    if (buscador && buscador.value.trim() !== '') {
        buscador.value = '';
    }
    cargarPagina(paginaActual);
}

// --- Event Listeners ---

// Botones de cierre (X) para movil y desktop
const btnCerrarMovil = document.getElementById('btn-cerrar-movil');
const btnCerrarDesktop = document.getElementById('btn-cerrar-desktop');
if (btnCerrarMovil) btnCerrarMovil.addEventListener('click', cerrarDetalles);
if (btnCerrarDesktop) btnCerrarDesktop.addEventListener('click', cerrarDetalles);

bgBorroso.addEventListener('click', cerrarDetalles);

//Cierra los detalles si se hace click fuera del cuadro blanco (en el contenedor wrapper)
detalles.addEventListener('click', function (e) {
    if (e.target === detalles) cerrarDetalles();
});

botonMas.addEventListener('click', aumentarCantidad);
botonMenos.addEventListener('click', disminuirCantidad);

//Añade el producto al carrito
botonAñadir.addEventListener('click', function () {
    añadirAlCarrito();
    cerrarDetalles();
});

// Paginación
document.getElementById('page-1')?.addEventListener('click', e => { e.preventDefault(); cambiarPagina(1); });
document.getElementById('page-2')?.addEventListener('click', e => { e.preventDefault(); cambiarPagina(2); });
document.getElementById('page-3')?.addEventListener('click', e => { e.preventDefault(); cambiarPagina(3); });
document.getElementById('page-prev')?.addEventListener('click', e => {
    e.preventDefault();
    if (paginaActual > 1) cambiarPagina(paginaActual - 1);
});
document.getElementById('page-next')?.addEventListener('click', e => {
    e.preventDefault();
    if (paginaActual < 3) cambiarPagina(paginaActual + 1);
});

// Búsqueda en tiempo real con retraso (debounce)
let searchTimeout;
document.getElementById('buscador-catalogo')?.addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    searchTimeout = setTimeout(() => {
        if (query === '') {
            cargarPagina(paginaActual);
        } else {
            ejecutarBusqueda(query);
        }
    }, 600); // Pequeño delay de 600ms para evitar llamar a la API por cada letra presionada sin pausa
});

// Iniciar catálogo al cargar la página
cargarPagina(paginaActual);
