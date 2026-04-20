const detalles = document.getElementById('detalles');
const bgBorroso = document.getElementById('bg-borroso');

const botonAñadir = document.getElementById('boton-añadir');
const botonMas = document.getElementById('boton-mas');
const botonMenos = document.getElementById('boton-menos');
const spanCantidad = document.getElementById('cantidad');

const discos = document.getElementById('discos');

let cantidad = 1; //Cantidad de producto seleccionada que despues se añadirá al carrito cuando sea funcional
let precioActualUnitario = 0; // Precio del producto actualmente seleccionado
let productoActualId = null; // ID real en DB / Discogs de lo que seleccionaste
const spanPrecioTotal = document.getElementById('detalle-precio-total');

//Funciones
function abrirDetalles() {
    detalles.classList.remove('d-none');
    bgBorroso.classList.remove('d-none');

    // Validar sesión global para permitir interacción con el carrito
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

function actualizarPrecioTotal() {
    if (spanPrecioTotal) {
        spanPrecioTotal.textContent = `Precio total: $${(cantidad * precioActualUnitario).toFixed(2)}`;
    }
}

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

async function añadirAlCarrito() {
    const token = localStorage.getItem('token');
    if (!token || !window.enSesion) {
        Swal.fire({icon: 'warning', title: 'Inicia sesión', text: 'Debes iniciar sesión para añadir productos al carrito'});
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
            Swal.fire({icon: 'success', title: '¡Añadido!', text: 'El producto se guardó en tu carrito.', timer: 2000, showConfirmButton: false});
        } else {
            Swal.fire({icon: 'error', title: 'Error', text: data.mensaje || 'No se pudo añadir al carrito'});
        }
    } catch (err) {
        Swal.fire({icon: 'error', title: 'Problema de red', text: 'El servidor no responde.'});
    }
}

// Variable global para la paginación actual
let paginaActual = 1;

// Función base para maquetar un disco y añadirlo al HTML
function renderizarDisco(data, fromSearch = false) {
    if (!data || data.message?.includes('not found')) return null;

    let id = data.id ? data.id.toString() : Date.now().toString();
    let artista = "Artista Desconocido";
    let titulo = "Título Desconocido";
    let cover = "../assets/images/portadas/vinilo-base.webp";
    let genero = "Género Desconocido";
    let formato = "Formato Desconocido";
    let precio = "20.00"; // Precio por defecto en string para que parseFloat funcione igual
    let anio = data.year || "Desconocido";

    if (fromSearch) {
        // La API de search devuelve 'title' como "Artist - Title"
        console.log(data);
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
        // Search no suele traer precio fácilmente accesible sin otro fetch, inventamos uno seguro
        precio = (Math.floor(Math.random() * 20) + 10).toString();
    } else {
        // Formato Release directamente
        artista = data.artists && data.artists[0] ? data.artists[0].name : "Artista Desconocido";
        titulo = data.title || "Título Desconocido";
        cover = (data.images && data.images.length > 0) ? data.images[0].resource_url : cover;
        genero = data.genres && data.genres.length > 0 ? data.genres[0] : genero;
        formato = data.formats && data.formats[0] ? data.formats[0].name : formato;
        // Si no hay precio (ej. num_for_sale es 0 o inexistente), inventamos default
        precio = data.num_for_sale ? data.num_for_sale.toString() : "15.00";
    }

    const producto = document.createElement('div');
    producto.classList.add('btn', 'mt-5', 'col-lg-2', 'col-md-3', 'col-6', 'text-start');

    // Creamos un div intermedio para evitar problemas de maquetación si hay títulos largos. Se quita text-white y font-dark para evitar conflictos de color
    producto.innerHTML = `
        <div class="card bg-transparent border-0 h-100 text-dark">
            <img class="img-fluid shadow-lg rounded border-1 card-img-top w-100" src="${cover}" alt="${titulo}" style="aspect-ratio: 1/1; object-fit: cover;">
            <div class="card-body p-0 pt-2 d-flex flex-column justify-content-between">
                <div>
                    <p class="m-0 fw-bold text-truncate" title="${titulo}">${titulo}</p>
                    <p class="m-0 text-secondary text-truncate small" title="${artista}">${artista}</p>
                </div>
                <div class="mt-1 fw-bold">$${precio}</div>
            </div>
        </div>
    `;

    // Asignamos el event listener para abrir detalles de este producto
    producto.addEventListener('click', function () {
        cantidad = 1;
        spanCantidad.textContent = cantidad;
        productoActualId = id;

        // Parseamos el precio a número
        precioActualUnitario = parseFloat(precio) || 10.00;

        document.getElementById('detalle-cover').src = cover;
        document.getElementById('detalle-titulo').textContent = titulo;
        document.getElementById('detalle-artista').textContent = `Artista: ${artista}`;
        document.getElementById('detalle-genero').textContent = `Género: ${genero}`;
        document.getElementById('detalle-anio').textContent = `Año de lanzamiento: ${anio}`;
        document.getElementById('detalle-formato').textContent = `Formato: ${formato}`;
        document.getElementById('detalle-precio').textContent = `Precio unitario: $${precioActualUnitario.toFixed(2)}`;

        actualizarPrecioTotal();
        abrirDetalles();
    });
    return producto;
}

// Cargar productos consumiendo la API de Discogs externa (Desde ID release)
async function cargarPagina(pagina) {
    discos.innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-light" role="status"></div><p>Cargando catálogo...</p></div>'; // Indicador de carga temporal

    let start = 15;
    let end = 30;
    if (pagina === 2) { start = 31; end = 45; }
    else if (pagina === 3) { start = 46; end = 60; }

    const promesas = [];
    for (let i = start; i <= end; i++) {
        promesas.push(obtenerDatos(i));
    }

    const resultados = await Promise.all(promesas);
    discos.innerHTML = ''; // Limpiamos el spinner

    // Actualizar botones de paginación a nivel visual
    document.querySelectorAll('#paginacion-container .page-item a').forEach(a => a.style.fontWeight = 'normal');
    const linkActivo = document.getElementById(`page-${pagina}`);
    if (linkActivo) linkActivo.style.fontWeight = 'bold';

    resultados.forEach((data) => {
        const prodElement = renderizarDisco(data, false);
        if (prodElement) discos.appendChild(prodElement);
    });

    if (discos.innerHTML === '') {
        discos.innerHTML = '<p class="text-center w-100 mt-5">No se encontraron productos o hubo un error al conectar con la API.</p>';
    }
}

// Buscar productos por nombre
async function ejecutarBusqueda(query) {
    discos.innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-light" role="status"></div><p>Buscando...</p></div>';

    // Desmarcamos las paginaciones visualmente
    document.querySelectorAll('#paginacion-container .page-item a').forEach(a => a.style.fontWeight = 'normal');

    const resultados = await buscarDatos(query);
    discos.innerHTML = ''; // Limpiamos el spinner

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

function cambiarPagina(pagina) {
    paginaActual = pagina;

    // Si hay búsqueda ignoramos y limpiamos el input para mostrar resultados directos de catalogo
    const buscador = document.getElementById('buscador-catalogo');
    if (buscador && buscador.value.trim() !== '') {
        buscador.value = '';
    }

    cargarPagina(paginaActual);
}

//EventListeners

//Cierra los detalles del producto al hacer click en el fondo oscuro
bgBorroso.addEventListener('click', function () {
    cerrarDetalles();
});

//Cierra los detalles si se hace click fuera del cuadro blanco (en el contenedor wrapper)
detalles.addEventListener('click', function (e) {
    if (e.target === detalles) {
        cerrarDetalles();
    }
});

//Aumenta la cantidad de producto seleccionado
botonMas.addEventListener('click', function () {
    aumentarCantidad();
});

//Disminuye la cantidad de producto seleccionado
botonMenos.addEventListener('click', function () {
    disminuirCantidad();
});

//Añade el producto al carrito
botonAñadir.addEventListener('click', function () {
    añadirAlCarrito();
    cerrarDetalles();
});

// EventListeners de Paginación
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

// EventListener de Busqueda en tiempo real
let searchTimeout;
document.getElementById('buscador-catalogo')?.addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    searchTimeout = setTimeout(() => {
        if (query === '') {
            cargarPagina(paginaActual); // Si borra todo, regresamos a la paginacion en la que estaba
        } else {
            ejecutarBusqueda(query);
        }
    }, 600); // Pequeño delay de 600ms para evitar llamar a la API por cada letra presionada sin pausa
});

// Inicializar la carga al cargar el script
cargarPagina(paginaActual);
