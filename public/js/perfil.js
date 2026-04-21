document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Verificar si el usuario está autenticado
    if (!token || !window.enSesion) {
        Swal.fire({ icon: 'warning', title: 'Acceso Restringido', text: 'Por favor, inicia sesión para ver tu perfil.' })
        .then(() => { window.location.href = '/sesion'; });
        return;
    }

    const infoContainer = document.getElementById('perfil-info');
    const ordenesContainer = document.getElementById('perfil-ordenes');

    // Cargar la información personal del usuario
    try {
        const resUsuario = await fetch('/api/usuarios/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataUsuario = await resUsuario.json();

        if (resUsuario.ok) {
            const u = dataUsuario.usuario;
            const fecha = new Date(u.fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
            
            // Actualizar textos en la cabecera del perfil
            const headerNombre = document.getElementById('header-nombre');
            const headerApellido = document.getElementById('header-apellido');
            const headerEmail = document.getElementById('header-email');
            if(headerNombre) headerNombre.textContent = u.nombre;
            if(headerApellido) headerApellido.textContent = u.apellido;
            if(headerEmail) headerEmail.textContent = u.email;

            // Inyectar datos en la tarjeta de información
            infoContainer.innerHTML = `
                <div class="info-campo">
                    <span class="campo-label">Nombre</span>
                    <span class="campo-valor" id="text-nombre">${u.nombre}</span>
                </div>
                <div class="info-campo">
                    <span class="campo-label">Apellidos</span>
                    <span class="campo-valor" id="text-apellido">${u.apellido}</span>
                </div>
                <div class="info-campo">
                    <span class="campo-label">Correo electrónico</span>
                    <span class="campo-valor">${u.email}</span>
                </div>
                <div class="info-campo">
                    <span class="campo-label">Teléfono</span>
                    <span class="campo-valor" id="text-telefono">${u.telefono || 'No especificado'}</span>
                </div>
                <div class="info-campo">
                    <span class="campo-label">Miembro desde</span>
                    <span class="campo-valor">${fecha}</span>
                </div>
            `;

            // Rellenar los campos del modal de edición
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

    // Cargar el historial de compras
    try {
        const resOrdenes = await fetch('/api/ordenes/mis-ordenes', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataOrdenes = await resOrdenes.json();

        if (resOrdenes.ok) {
            const ordenes = dataOrdenes.ordenes || [];

            // Actualizar estadísticas rápidas del usuario
            const statOrdenes = document.getElementById('stat-ordenes');
            const statVinilos = document.getElementById('stat-vinilos');
            let totalVinilos = 0;
            ordenes.forEach(o => {
                o.items.forEach(i => totalVinilos += i.cantidad);
            });
            if(statOrdenes) statOrdenes.textContent = ordenes.length;
            if(statVinilos) statVinilos.textContent = totalVinilos;

            // Mostrar mensaje si no hay órdenes
            if (ordenes.length === 0) {
                ordenesContainer.innerHTML = `
                    <div class="text-center mt-5">
                       <p class="fs-4">Aún no tienes pedidos registrados.</p>
                       <a href="/catalogo" class="btn btn-dark mt-3">Ir al Catálogo</a>
                    </div>
                `;
            } else {
                let htmlOrdenes = '';

                ordenes.forEach((orden) => {
                    const fechaOrden = new Date(orden.fechaCreacion).toLocaleString('es-ES', { dateStyle: 'long' });
                    
                    let htmlItems = '';
                    orden.items.forEach(item => {
                        htmlItems += `
                            <div class="d-flex col-12 mb-2 pb-2 border-bottom border-secondary-subtle">
                                <div class="col-8">
                                    <p class="mb-0 fw-bold" style="font-size: 0.85rem; color: #2d2c2d;">${item.titulo}</p>
                                    <p class="mb-0 text-muted" style="font-size: 0.75rem;">${item.artista}</p>
                                </div>
                                <div class="col-4 text-end">
                                    <p class="mb-0 text-dark fw-medium" style="font-size: 0.8rem;">${item.cantidad} x $${item.precioUnitario.toFixed(2)}</p>
                                </div>
                            </div>
                        `;
                    });

                    // Lógica de cancelación permitida solo si está pendiente o procesando
                    let btnCancelar = '';
                    if (orden.estado === 'procesando' || orden.estado === 'pendiente') {
                        btnCancelar = `<button class="btn btn-sm btn-outline-danger btn-cancelar-orden mt-2" data-id="${orden._id}">Cancelar Orden</button>`;
                    }
                    
                    let estadoClass = '';
                    switch(orden.estado) {
                        case 'entregado': estadoClass = 'estado-entregado'; break;
                        case 'enviado': estadoClass = 'estado-enviado'; break;
                        case 'procesando': estadoClass = 'estado-procesando'; break;
                        case 'cancelado': estadoClass = 'estado-cancelado'; break;
                        default: estadoClass = 'estado-pendiente'; break;
                    }

                    // Armar el bloque visual de cada orden
                    htmlOrdenes += `
                        <div class="orden-block mb-3 border border-secondary-subtle rounded overflow-hidden shadow-sm" style="transition: all 0.2s ease;" onmouseover="this.style.boxShadow='0 8px 15px rgba(33, 118, 255, 0.15)'; this.style.borderColor='#2176ff';" onmouseout="this.style.boxShadow=''; this.style.borderColor='';">
                            <div class="orden-item p-3 bg-white" data-bs-toggle="collapse" data-bs-target="#collapse${orden._id}" style="cursor: pointer; align-items: start; border-bottom: none;">
                                <div>
                                    <p class="orden-id text-dark">#${orden._id.substring(0,8).toUpperCase()}</p>
                                    <p class="orden-fecha text-muted mb-2">${fechaOrden}</p>
                                    <p class="m-0 text-primary fw-bold" style="font-size: 0.8rem;">⬇ Desplegar canciones ⬇</p>
                                </div>
                                <div class="d-flex flex-column align-items-end gap-2">
                                    <span class="orden-estado ${estadoClass} badge-estado-${orden._id}">${orden.estado}</span>
                                    <span class="orden-total fs-5 fw-bold text-dark">$${orden.total.toFixed(2)}</span>
                                </div>
                            </div>
                            <div class="collapse w-100" data-bs-parent="#perfil-ordenes" id="collapse${orden._id}">
                               <div class="p-3 bg-light border-top border-secondary-subtle">
                                   <p class="fw-bold mb-3 text-secondary" style="font-size: 0.9rem;">DETALLE DE LA ORDEN</p>
                                   <div style="max-height: 250px; overflow-y: auto; overflow-x: hidden;" class="pe-2 mb-3">
                                       ${htmlItems}
                                   </div>
                                   <div class="d-flex justify-content-between align-items-end pt-3 border-top border-secondary-subtle">
                                       <div>
                                           <span class="text-muted fw-medium" style="font-size: 0.85rem;">Subtotal: $${orden.subtotal.toFixed(2)}</span><br>
                                           <span class="text-muted fw-medium" style="font-size: 0.85rem;">Envío: $${orden.envio.toFixed(2)}</span>
                                       </div>
                                       <div class="cancels-container-${orden._id}">
                                           ${btnCancelar}
                                       </div>
                                   </div>
                               </div>
                            </div>
                        </div>
                    `;
                });
                ordenesContainer.innerHTML = htmlOrdenes;
            }
        } else {
            ordenesContainer.innerHTML = `<p class="text-danger text-center">No se pudieron cargar los pedidos.</p>`;
        }
    } catch (err) {
        ordenesContainer.innerHTML = `<p class="text-danger text-center">Error de red. Intenta de nuevo más tarde.</p>`;
    }

    // 1. Eliminar la cuenta permanentemente
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

    // 2. Modificar los datos del perfil
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
                    // Actualizar la interfaz sin recargar
                    document.getElementById('text-nombre').textContent = nombre;
                    document.getElementById('text-apellido').textContent = apellido;
                    document.getElementById('text-telefono').textContent = telefono || 'No especificado';
                    
                    const headerNombre = document.getElementById('header-nombre');
                    const headerApellido = document.getElementById('header-apellido');
                    if(headerNombre) headerNombre.textContent = nombre;
                    if(headerApellido) headerApellido.textContent = apellido;
                    
                    // Cerrar el modal de forma manual
                    const modalEl = document.getElementById('modal-editar-perfil');
                    const modal = bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();

                    Swal.fire({ icon: 'success', title: 'Perfil Actualizado', text: 'Tus datos se han guardado.', timer: 2000, showConfirmButton: false });

                    // Limpieza de restos del modal
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

    // 3. Cancelar órdenes mediante delegación de eventos
    if (ordenesContainer) {
        ordenesContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-cancelar-orden')) {
                const ordenId = e.target.getAttribute('data-id');

                const resp = await Swal.fire({
                    title: '¿Cancelar esta orden?',
                    text: "Verificaremos si es elegible para cancelación.",
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
                            
                            // Cambiar estado en la UI visualmente
                            const badge = document.querySelector(`.badge-estado-${ordenId}`);
                            if(badge) badge.textContent = 'cancelado';
                            
                            const div = document.querySelector(`.cancels-container-${ordenId}`);
                            if(div) div.innerHTML = ''; 
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
