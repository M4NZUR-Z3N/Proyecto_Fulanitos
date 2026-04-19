// const disco = document.getElementById('disco'); // Ya no existe estáticamente
const detalles = document.getElementById('detalles');
const bgBorroso = document.getElementById('bg-borroso');

const botonAñadir = document.getElementById('boton-añadir');
const botonMas = document.getElementById('boton-mas');
const botonMenos = document.getElementById('boton-menos');
const spanCantidad = document.getElementById('cantidad');

const discos = document.getElementById('discos');

let cantidad = 1; //Cantidad de producto seleccionada que despues se añadirá al carrito cuando sea funcional
let precioActualUnitario = 0; // Precio del producto actualmente seleccionado
const spanPrecioTotal = document.getElementById('detalle-precio-total');

//Funciones
function abrirDetalles() {
    detalles.classList.remove('d-none');
    bgBorroso.classList.remove('d-none');
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

function añadirAlCarrito() {
    const precioTotal = cantidad * precioActualUnitario;
    console.log(`Se guardan en el carrito ${cantidad} cantidad de discos con precio total de $${precioTotal.toFixed(2)}`);
}

// Cargar productos consumiendo la API de Discogs externa (desde id 1 al 20)
async function mostrarProductos() {
    discos.innerHTML = '<div class="col-12 text-center my-5"><div class="spinner-border text-light" role="status"></div><p>Cargando catálogo...</p></div>'; // Indicador de carga temporal

    const promesas = [];
    for (let i = 15; i <= 30; i++) {
        promesas.push(obtenerDatos(i));
    }

    const resultados = await Promise.all(promesas);
    discos.innerHTML = ''; // Limpiamos el spinner

    resultados.forEach((data, index) => {
        if (data && !data.message?.includes('not found')) {
            const artista = data.artists && data.artists[0] ? data.artists[0].name : "Artista Desconocido";
            const titulo = data.title || "Título Desconocido";
            const cover = (data.images && data.images.length > 0) ? data.images[0].resource_url : "../assets/images/portadas/vinilo-base.webp";
            const formato = data.formats && data.formats[0] ? data.formats[0].name : "Formato Desconocido";
            const precio = data.num_for_sale || "Precio Desconocido";

            const anio = data.year || "Desconocido"; // Nuevo dato para el detalle

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

                // Parseamos el precio a número, si no es válido usamos 10 por defecto
                precioActualUnitario = parseFloat(precio) || 10.00;

                document.getElementById('detalle-cover').src = cover;
                document.getElementById('detalle-titulo').textContent = titulo;
                document.getElementById('detalle-artista').textContent = `Artista: ${artista}`;
                document.getElementById('detalle-anio').textContent = `Año de lanzamiento: ${anio}`;
                document.getElementById('detalle-formato').textContent = `Formato: ${formato}`;
                document.getElementById('detalle-precio').textContent = `Precio unitario: $${precioActualUnitario.toFixed(2)}`;

                actualizarPrecioTotal();

                // GUIA: Para agregar algo como el género, lo harías así una vez que la API lo traiga (la de Discogs trae un arreglo, ej: data.genres)
                // document.getElementById('detalle-genero').textContent = `Género: ${data.genres ? data.genres.join(', ') : 'Desconocido'}`;

                abrirDetalles();
            });

            discos.appendChild(producto);
        }
    });

    // Si por alguna razón ninguna API call funciona, mostramos un mensaje
    if (discos.innerHTML === '') {
        discos.innerHTML = '<p class="text-center w-100 mt-5">No se encontraron productos o hubo un error al conectar con la API.</p>';
    }
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

// Inicializar la carga al cargar el script
mostrarProductos();
