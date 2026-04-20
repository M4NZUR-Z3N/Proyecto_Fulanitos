document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-carrito');
    const token = localStorage.getItem('token');
    let carritoParaPagar = [];

    if (!token || !window.enSesion) {
        contenedor.innerHTML = '<p class="text-center mt-5 fs-4">Inicia sesión para ver tu carrito.</p>';
        return;
    }

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

        if (items.length === 0) {
            contenedor.innerHTML = '<p class="text-center mt-5 fs-4">Tu carrito está vacío.</p>';
            actualizarTotales(0);
            return;
        }

        contenedor.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-dark" role="status"></div><p>Cargando música...</p></div>';

        let htmlCarrito = '';
        let subtotalCalculado = 0;

        for (const item of items) {
            // Obtenemos info real desde la BD de Discogs usando la apiExterna
            const discoInfo = await obtenerDatos(item.productoId);

            let artista = "Artista Desconocido";
            let titulo = "Título Desconocido";
            let cover = "../assets/images/portadas/vinilo-base.webp";
            let precioUnitario = 15.00; // Si discogs no tira precio en releases individuales

            if (discoInfo) {
                artista = discoInfo.artists && discoInfo.artists[0] ? discoInfo.artists[0].name : artista;
                titulo = discoInfo.title || titulo;
                cover = (discoInfo.images && discoInfo.images.length > 0) ? discoInfo.images[0].resource_url : cover;
                precioUnitario = discoInfo.num_for_sale ? parseFloat(discoInfo.num_for_sale) : 15.00;
            }

            subtotalCalculado += (precioUnitario * item.cantidad);

            carritoParaPagar.push({
                productoId: item.productoId,
                titulo,
                artista,
                cover,
                precioUnitario: precioUnitario,
                cantidad: item.cantidad,
                subtotal: (precioUnitario * item.cantidad)
            });

            htmlCarrito += `
                <div class="vinilo d-flex col-12 flex-md-row mb-3 border border-dark overflow-hidden z-3">
                    <img class="col-4 d-none d-md-block img-fluid" style="aspect-ratio: 1/1; object-fit: cover;"
                        src="${cover}" alt="${titulo}">

                    <div class="col-12 col-md-8 d-flex flex-column justify-content-between p-3 bg-white">
                        <p class="fs-5 mb-0 fw-bold">${titulo}</p>
                        <p class="fs-5 mb-0">Artista: ${artista}</p>
                        <p class="fs-5 mb-0 fw-bold">Cantidad: ${item.cantidad}</p>
                        <p class="fs-5 mb-0">Precio unitario: $${precioUnitario.toFixed(2)}</p>
                    </div>
                </div>
            `;
        }

        contenedor.innerHTML = htmlCarrito;
        actualizarTotales(subtotalCalculado);

    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-center mt-5 fs-4 text-danger">Fallo al contactar al servidor.</p>';
    }

    function actualizarTotales(subtotal) {
        const costoEnvio = subtotal > 0 ? 5.00 : 0.00;
        
        document.getElementById('cart-subtotal').textContent = `Subtotal: $${subtotal.toFixed(2)}`;
        document.getElementById('cart-envio').textContent = `Envío: $${costoEnvio.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `Total: $${(subtotal + costoEnvio).toFixed(2)}`;
    }

    const btnPagar = document.getElementById('btn-pagar');
    if (btnPagar) {
        btnPagar.addEventListener('click', async () => {
            if (typeof carritoParaPagar === 'undefined' || carritoParaPagar.length === 0) {
                Swal.fire({icon: 'warning', title: 'Ups', text: 'Tu carrito está vacío.'});
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
                    Swal.fire({icon: 'error', title: 'Error', text: data.mensaje || 'No se pudo generar la orden.'});
                }
            } catch (err) {
                Swal.fire({icon: 'error', title: 'Problema de red', text: 'El servidor no responde.'});
            }
        });
    }
});
