document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    if (!token || !window.enSesion) {
        Swal.fire({icon: 'warning', title: 'Acceso Restringido', text: 'Por favor, inicia sesión para ver tu perfil.'})
        .then(() => { window.location.href = '/sesion'; });
        return;
    }

    const infoContainer = document.getElementById('perfil-info');
    const ordenesContainer = document.getElementById('perfil-ordenes');

    // Cargar Info de Usuario
    try {
        const resUsuario = await fetch('/api/usuarios/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataUsuario = await resUsuario.json();

        if (resUsuario.ok) {
            const u = dataUsuario.usuario;
            const fecha = new Date(u.fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            
            infoContainer.innerHTML = `
                <div class="text-start fs-5 mt-2">
                    <p><strong>Nombre:</strong> ${u.nombre}</p>
                    <p><strong>Apellidos:</strong> ${u.apellido}</p>
                    <p><strong>Correo:</strong> ${u.email}</p>
                    <p><strong>Teléfono:</strong> ${u.telefono || 'No especificado'}</p>
                    <p class="mt-4 text-muted fs-6">Usuario registrado el ${fecha}</p>
                </div>
            `;
        } else {
            infoContainer.innerHTML = `<p class="text-danger">No se pudo cargar la información</p>`;
        }
    } catch (err) {
        infoContainer.innerHTML = `<p class="text-danger">Error de red al cargar perfil.</p>`;
    }

    // Cargar Órdenes
    try {
        const resOrdenes = await fetch('/api/ordenes/mis-ordenes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataOrdenes = await resOrdenes.json();

        if (resOrdenes.ok) {
            const ordenes = dataOrdenes.ordenes || [];

            if (ordenes.length === 0) {
                ordenesContainer.innerHTML = `
                    <div class="text-center mt-5">
                       <p class="fs-4">Aún no tienes pedidos registrados.</p>
                       <a href="/catalogo" class="btn btn-dark mt-3">Ir al Catálogo</a>
                    </div>
                `;
                return;
            }

            let htmlOrdenes = `<div class="accordion" id="accordionOrdenes">`;

            ordenes.forEach((orden, index) => {
                const fechaOrden = new Date(orden.fechaCreacion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
                
                let htmlItems = '';
                orden.items.forEach(item => {
                    htmlItems += `
                        <div class="vinilo d-flex col-12 flex-md-row mb-3 border-bottom overflow-hidden mt-3 p-2 bg-light">
                            <img class="col-3 d-none d-md-block img-fluid rounded border border-dark" style="aspect-ratio: 1/1; object-fit: cover; max-width: 100px;"
                                src="${item.cover}" alt="${item.titulo}">

                            <div class="col-12 col-md-9 d-flex flex-column justify-content-between px-3">
                                <p class="fs-5 mb-0 fw-bold">${item.titulo}</p>
                                <p class="fs-6 mb-0 text-muted">Artista: ${item.artista}</p>
                                <p class="fs-6 mb-0"><strong>Cantidad:</strong> ${item.cantidad} x $${item.precioUnitario.toFixed(2)}</p>
                                <p class="fs-6 mb-0 text-success fw-bold">Subtotal Item: $${item.subtotal.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                });

                // Uso de componentes acordeón de bootstrap para que crezcan
                htmlOrdenes += `
                  <div class="accordion-item mb-3 border border-dark rounded">
                    <h2 class="accordion-header">
                      <button class="accordion-button fs-5 ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${orden._id}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse${orden._id}">
                        Orden del ${fechaOrden} &nbsp;|&nbsp; <strong>Total: $${orden.total.toFixed(2)}</strong> &nbsp;|&nbsp; Estado: <span class="badge bg-dark ms-2 text-uppercase">${orden.estado}</span>
                      </button>
                    </h2>
                    <div id="collapse${orden._id}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#accordionOrdenes">
                      <div class="accordion-body pb-0">
                         ${htmlItems}
                         <div class="text-end mt-2 pb-3 pt-2">
                             <p class="mb-0 fs-6 text-muted">Subtotal: $${orden.subtotal.toFixed(2)}</p>
                             <p class="mb-0 fs-6 text-muted">Envío: $${orden.envio.toFixed(2)}</p>
                             <p class="mb-0 fw-bold fs-4 mt-2">Pagado: $${orden.total.toFixed(2)}</p>
                         </div>
                      </div>
                    </div>
                  </div>
                `;
            });

            htmlOrdenes += `</div>`;
            ordenesContainer.innerHTML = htmlOrdenes;

        } else {
            ordenesContainer.innerHTML = `<p class="text-danger text-center">No se pudieron cargar los pedidos.</p>`;
        }
    } catch (err) {
        ordenesContainer.innerHTML = `<p class="text-danger text-center">Error de red. Intenta de nuevo más tarde.</p>`;
    }
});
