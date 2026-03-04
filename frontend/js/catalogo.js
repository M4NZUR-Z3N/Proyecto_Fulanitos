const disco = document.getElementById('disco');
const detalles = document.getElementById('detalles');
const bgBorroso = document.getElementById('bg-borroso');

const botonAñadir = document.getElementById('boton-añadir');
const botonMas = document.getElementById('boton-mas');
const botonMenos = document.getElementById('boton-menos');
const spanCantidad = document.getElementById('cantidad');

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

//EventListeners

//Abre los detalles del producto
disco.addEventListener('click', function () {
    abrirDetalles();
});

//Cierra los detalles del producto
bgBorroso.addEventListener('click', function () {
    cerrarDetalles();
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
