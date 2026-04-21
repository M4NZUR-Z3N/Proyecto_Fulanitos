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
                    <p><strong>Nombre:</strong> <span id="text-nombre">${u.nombre}</span></p>
                    <p><strong>Apellidos:</strong> <span id="text-apellido">${u.apellido}</span></p>
                    <p><strong>Correo:</strong> ${u.email}</p>
                    <p><strong>Teléfono:</strong> <span id="text-telefono">${u.telefono || 'No especificado'}</span></p>
                    <p class="mt-4 text-muted fs-6">Usuario registrado el ${fecha}</p>
                </div>
            `;

            // Rellenar Modal de edicion con validación de existencia para evitar crashear el script si EJS no compila
            const iptNombre = document.getElementById('edit-nombre');
            const iptApellido = document.getElementById('edit-apellido');
            const iptTelefono = document.getElementById('edit-telefono');
            
            if (iptNombre) iptNombre.value = u.nombre;
            if (iptApellido) iptApellido.value = u.apellido;
            if (iptTelefono) iptTelefono.value = u.telefono || '';
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

                // Botón cancelar orden dinámico si está en estado correcto
                let btnCancelar = '';
                if (orden.estado === 'procesando' || orden.estado === 'pendiente') {
                    btnCancelar = `<button class="btn btn-sm btn-outline-danger btn-cancelar-orden" data-id="${orden._id}">Cancelar Orden</button>`;
                }

                // Uso de componentes acordeón de bootstrap para que crezcan
                htmlOrdenes += `
                  <div class="accordion-item mb-3 border border-dark rounded">
                    <h2 class="accordion-header">
                      <button class="accordion-button fs-5 collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${orden._id}" aria-expanded="false" aria-controls="collapse${orden._id}">
                        Orden del ${fechaOrden} &nbsp;|&nbsp; <strong>Total: $${orden.total.toFixed(2)}</strong> &nbsp;|&nbsp; Estado: <span class="badge bg-dark ms-2 text-uppercase badge-estado-${orden._id}">${orden.estado}</span>
                      </button>
                    </h2>
                    <div id="collapse${orden._id}" class="accordion-collapse collapse" data-bs-parent="#accordionOrdenes">
                      <div class="accordion-body pb-0">
                         <div style="max-height: 350px; overflow-y: auto; overflow-x: hidden;" class="pe-2">
                            ${htmlItems}
                         </div>
                         <div class="text-end mt-2 pb-3 pt-2 border-top">
                             <p class="mb-0 fs-6 text-muted">Subtotal: $${orden.subtotal.toFixed(2)}</p>
                             <p class="mb-0 fs-6 text-muted">Envío: $${orden.envio.toFixed(2)}</p>
                             <p class="mb-0 fw-bold fs-4 mt-2">Pagado: $${orden.total.toFixed(2)}</p>
                             <div class="mt-3 text-end cancels-container-${orden._id}">
                                ${btnCancelar}
                             </div>
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

    // -------------------------------------------------------------
    // LOGICAS DE BOTONES DE ACCION
    // -------------------------------------------------------------

    // 1. Eliminar Cuenta
    const btnEliminar = document.getElementById('btn-eliminar-cuenta');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', async () => {
            const resp = await Swal.fire({
                title: '¿Eliminar tu cuenta?',
                text: "Esta acción es permanente y no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar cuenta'
            });

            if (resp.isConfirmed) {
                try {
                    const res = await fetch('/api/usuarios/perfil', {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('enSesion');
                        window.enSesion = false;
                        await Swal.fire('Cuenta Eliminada', 'Lamentamos verte partir.', 'success');
                        window.location.href = '/';
                    } else {
                        Swal.fire('Error', 'No se pudo eliminar la cuenta.', 'error');
                    }
                } catch (err) {
                    Swal.fire('Error', 'Problema de conexión.', 'error');
                }
            }
        });
    }

    // 2. Editar Perfil
    const formEditar = document.getElementById('form-editar-perfil');
    if (formEditar) {
        formEditar.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre = document.getElementById('edit-nombre').value;
            const apellido = document.getElementById('edit-apellido').value;
            const telefono = document.getElementById('edit-telefono').value;

            try {
                const res = await fetch('/api/usuarios/perfil', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ nombre, apellido, telefono })
                });

                if (res.ok) {
                    document.getElementById('text-nombre').textContent = nombre;
                    document.getElementById('text-apellido').textContent = apellido;
                    document.getElementById('text-telefono').textContent = telefono || 'No especificado';
                    
                    // Cerrar el modal programaicamente (se necesita bootstrap dist JS)
                    const modalEl = document.getElementById('modal-editar-perfil');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();

                    Swal.fire({icon: 'success', title: 'Perfil Actualizado', text: 'Tus datos se han guardado.', timer: 2000, showConfirmButton: false});

                    // Remove modal backdrop just in case
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style = '';
                } else {
                    const data = await res.json();
                    Swal.fire('Error', data.mensaje || 'Error al actualizar', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Problema de conexión.', 'error');
            }
        });
    }

    // 3. Cancelar Órdenes (Event Delegation)
    if (ordenesContainer) {
        ordenesContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-cancelar-orden')) {
                const ordenId = e.target.getAttribute('data-id');

                const resp = await Swal.fire({
                    title: '¿Cancelar esta orden?',
                    text: "Verificaremos si es elegible a cancelación.",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, cancelar'
                });

                if (resp.isConfirmed) {
                    try {
                        const res = await fetch(`/api/ordenes/${ordenId}/cancelar`, {
                            method: 'PATCH',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        
                        if (res.ok) {
                            Swal.fire('Cancelada', 'Tu orden ha sido cancelada.', 'success');
                            
                            // Edit UI tags instead of reload for coolness
                            const badge = document.querySelector(`.badge-estado-${ordenId}`);
                            if(badge) badge.textContent = 'cancelado';
                            
                            const div = document.querySelector(`.cancels-container-${ordenId}`);
                            if(div) div.innerHTML = ''; // Quitar botón
                        } else {
                            Swal.fire('Error', data.mensaje || 'No se pudo cancelar', 'error');
                        }
                    } catch (err) {
                        Swal.fire('Error', 'Error de conexión', 'error');
                    }
                }
            }
        });
    }
});
