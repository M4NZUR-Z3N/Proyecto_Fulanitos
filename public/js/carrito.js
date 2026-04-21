document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-carrito');
    const token = localStorage.getItem('token');
    let carritoParaPagar = [];

    // Validar si hay una sesión activa
    if (!token || !window.enSesion) {
        contenedor.innerHTML = '<p class="text-center mt-5 fs-4">Inicia sesión para ver tu carrito.</p>';
        return;
    }

    // Obtener los productos del carrito desde el servidor
    try {
        const response = await fetch('/api/carrito', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (!response.ok) {
            contenedor.innerHTML = '<p class="text-center mt-5 fs-4">Error al cargar el carrito.</p>';
            return;
        }

        const items = data.carrito || [];

        // Mostrar diseño especial si el carrito está vacío
        if (items.length === 0) {
            contenedor.innerHTML = `
                <div class="d-flex flex-column align-items-center justify-content-center mt-4 text-center">
                    <img src="../assets/images/CarritoCompraVacio.webp" alt="Carrito Vacío" class="img-fluid mb-4" style="max-width: 220px;">
                    <h3 class="fw-bold mb-2">Tu carrito está vacío</h3>
                    <p class="text-muted mb-4">Explora nuestra colección y añade algunos vinilos.</p>
                    <a href="/catalogo" class="btn btn-dark px-4 py-2 fw-bold border-0" style="background-color: #2d2c2d;">Ir al catálogo</a>
                </div>
            `;
            actualizarTotales(0);
            return;
        }

        // Pantalla de carga mientras se obtienen detalles de los discos
        contenedor.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-dark" role="status"></div><p>Cargando música...</p></div>';

        let htmlCarrito = '';
        let subtotalCalculado = 0;

        for (const item of items) {
            // Buscamos la info del disco en la API de Discogs
            const discoInfo = await obtenerDatos(item.productoId);

            let artista = "Artista Desconocido";
            let titulo = "Título Desconocido";
            let cover = "../assets/images/portadas/vinilo-base.webp";
            let precioUnitario = 15.00;

            if (discoInfo) {
                artista = discoInfo.artists && discoInfo.artists[0] ? discoInfo.artists[0].name : artista;
                titulo = discoInfo.title || titulo;
                cover = (discoInfo.images && discoInfo.images.length > 0) ? discoInfo.images[0].resource_url : cover;
                precioUnitario = discoInfo.num_for_sale ? parseFloat(discoInfo.num_for_sale) : 15.00;
            }

            subtotalCalculado += (precioUnitario * item.cantidad);

            // Guardamos datos para el proceso de pago posterior
            carritoParaPagar.push({
                productoId: item.productoId,
                titulo,
                artista,
                cover,
                precioUnitario: precioUnitario,
                cantidad: item.cantidad,
                subtotal: (precioUnitario * item.cantidad)
            });

            // Generar el HTML de cada disco en el carrito
            htmlCarrito += `
                <div class="vinilo d-flex flex-row mb-3 border-0 bg-white shadow-sm overflow-hidden z-3" style="border-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;">
                    <div class="bg-dark flex-shrink-0" style="width: 130px; height: 130px;">
                        <img class="w-100 h-100" style="object-fit: cover; aspect-ratio: 1/1;" src="${cover}" alt="${titulo}">
                    </div>

                    <div class="d-flex flex-column justify-content-between p-3 flex-grow-1 bg-white" style="border: 1px solid rgba(45, 44, 45, 0.08); border-left: none;">
                        <div>
                            <p class="mb-0 fw-bold text-truncate" style="font-size: 1.1rem; max-width: 90%;">${titulo}</p>
                            <p class="mb-0 text-muted" style="font-size: 0.85rem;">Artista: ${artista}</p>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-end mt-2">
                            <div class="d-flex bg-light rounded px-2 py-1 align-items-center border border-secondary-subtle">
                                <button class="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0 fw-bold btn-cant-menos" data-id="${item.productoId}">-</button>
                                <span class="px-2 fw-medium" style="font-size: 0.9rem;">${item.cantidad}</span>
                                <button class="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0 fw-bold btn-cant-mas" data-id="${item.productoId}">+</button>
                            </div>
                            <div class="text-end">
                                <p class="mb-0 text-muted" style="font-size: 0.75rem;">$${precioUnitario.toFixed(2)} c/u</p>
                                <p class="mb-0 fw-bold text-dark" style="font-size: 1.1rem;">$${(precioUnitario * item.cantidad).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        contenedor.innerHTML = htmlCarrito;
        actualizarTotales(subtotalCalculado);

        // Botones para aumentar o disminuir cantidad
        document.querySelectorAll('.btn-cant-menos').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const prodId = e.target.getAttribute('data-id');
                const pItem = carritoParaPagar.find(i => String(i.productoId) === String(prodId));
                if (pItem && pItem.cantidad > 0) {
                    await actualizarCantidadAPI(prodId, pItem.cantidad - 1, token);
                }
            });
        });

        document.querySelectorAll('.btn-cant-mas').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const prodId = e.target.getAttribute('data-id');
                const pItem = carritoParaPagar.find(i => String(i.productoId) === String(prodId));
                if (pItem) {
                    await actualizarCantidadAPI(prodId, pItem.cantidad + 1, token);
                }
            });
        });

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-center mt-5 fs-4 text-danger">Fallo al contactar al servidor.</p>';
    }

    // Calcular y mostrar subtotales, envío y total
    function actualizarTotales(subtotal) {
        const costoEnvio = subtotal > 0 ? 5.00 : 0.00;

        document.getElementById('cart-subtotal').textContent = `Subtotal: $${subtotal.toFixed(2)}`;
        document.getElementById('cart-envio').textContent = `Envío: $${costoEnvio.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `Total: $${(subtotal + costoEnvio).toFixed(2)}`;
    }

    // Procesar el pago simulado y crear la orden
    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', async () => {
            if (typeof carritoParaPagar === 'undefined' || carritoParaPagar.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Ups', text: 'Tu carrito está vacío.' });
                return;
            }

            try {
                const subtotal = carritoParaPagar.reduce((acc, i) => acc + i.subtotal, 0);
                const envio = subtotal > 0 ? 5.00 : 0;

                const res = await fetch('/api/ordenes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ items: carritoParaPagar, subtotal, envio, total: (subtotal + envio) })
                });

                const data = await res.json();

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Pago Realizado con Éxito!',
                        text: 'Procesando tu pedido...',
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        confirmButtonText: 'Ver mis pedidos'
                    }).then(() => {
                        window.location.href = '/perfil';
                    });
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje || 'No se pudo generar la orden.' });
                }
            } catch (err) {
                Swal.fire({ icon: 'error', title: 'Problema de red', text: 'El servidor no responde.' });
            }
        });
    }

    // Vaciar todo el carrito con confirmación
    const btnVaciar = document.getElementById('btn-vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', async () => {
            if (typeof carritoParaPagar === 'undefined' || carritoParaPagar.length === 0) {
                Swal.fire({ icon: 'info', title: 'Aviso', text: 'El carrito ya está vacío.' });
                return;
            }

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Se eliminarán todos los productos de tu carrito.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, vaciar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    const res = await fetch('/api/carrito/vaciar', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        Swal.fire('Vaciado', 'Tu carrito ha sido vaciado.', 'success').then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Error', 'No se pudo vaciar el carrito.', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'Problema de conexión.', 'error');
                }
            }
        });
    }

    // Llamada a la API para actualizar cantidad de un producto específico
    async function actualizarCantidadAPI(prodId, nuevaCantidad, localToken) {
        try {
            const res = await fetch('/api/carrito/actualizar', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localToken}`
                },
                body: JSON.stringify({ productoId: prodId, cantidad: nuevaCantidad })
            });

            if (res.ok) {
                window.location.reload();
            } else {
                const data = await res.json();
                Swal.fire({ icon: 'error', title: 'Error', text: data.mensaje || 'No se pudo actualizar la cantidad' });
            }
        } catch (error) {
            console.error('Error actualizando:', error);
            Swal.fire({ icon: 'error', title: 'Problema de red', text: 'Error al contactar al servidor.' });
        }
    }
});
