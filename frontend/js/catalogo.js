const disco = document.getElementById('disco');
const detalles = document.getElementById('detalles');
const bgBorroso = document.getElementById('bg-borroso');

const botonAñadir = document.getElementById('boton-añadir');
const botonMas = document.getElementById('boton-mas');
const botonMenos = document.getElementById('boton-menos');
const spanCantidad = document.getElementById('cantidad');

const discos = document.getElementById('discos');

let cantidad = 1; //Cantidad de producto seleccionada que despues se añadirá al carrito cuando sea funcional

//Funciones
function abrirDetalles() {
    detalles.classList.remove('d-none');
    bgBorroso.classList.remove('d-none');
}

function cerrarDetalles() {
    detalles.classList.add('d-none');
    bgBorroso.classList.add('d-none');
}

function aumentarCantidad() {
    cantidad++;
    spanCantidad.textContent = cantidad;
}

function disminuirCantidad() {
    if (cantidad > 1) {
        cantidad--;
        spanCantidad.textContent = cantidad;
    }
}

function añadirAlCarrito() {
    console.log('Añadido al carrito: ' + cantidad + ' unidades');
}

//Funcion para cargar productos iguales como version de prueba, luego se sustituye por lo que recibamos del backend
function mostrarProductos() {
    for (let i = 0; i < 20; i++) {
        const producto = document.createElement('div');
        producto.classList.add('btn', 'mt-5', 'col-lg-2', 'col-md-3', 'col-6');
        producto.innerHTML = `
        <img class="img-fluid shadow-lg rounded" src="/assets/images/portadas/vinilo-base.webp"
            alt="Vinilo Base">
        <div class="d-flex justify-content-between">
            <div>Vinilo Base</div>
            <div>$10</div>
        </div>
    `;
        discos.appendChild(producto);
    }
}

//EventListeners

//Abre los detalles del producto
disco.addEventListener('click', function () {
    abrirDetalles();
});

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

mostrarProductos();
