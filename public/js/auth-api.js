document.addEventListener('DOMContentLoaded', () => {

    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault(); // Evita la recarga de página y el action="GET/POST" por defecto

            // Validaciones por defecto manejadas por Bootstrap/form-validation.js
            if (!formRegistro.checkValidity()) return;

            const nombre = document.getElementById('firstName').value;
            const apellido = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const telefono = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmarPassword = document.getElementById('confirmPassword').value;

            try {
                const response = await fetch('/api/usuarios/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, apellido, email, telefono, password, confirmarPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Registro Exitoso!',
                        text: data.mensaje || 'Serás redirigido en 5 segundos...',
                        showConfirmButton: true,
                        confirmButtonText: 'Iniciar sesión',
                        timer: 5000,
                        timerProgressBar: true
                    }).then(() => {
                        window.location.href = '/sesion';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Ocurrió un problema',
                        text: data.mensaje || 'Revisa tus datos y vuelve a intentarlo'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de servidor',
                    text: 'No se pudo conectar con la base de datos'
                });
            }
        });
    }

    const formSesion = document.getElementById('formSesion');
    if (formSesion) {
        formSesion.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!formSesion.checkValidity()) return;

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/usuarios/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('enSesion', 'true');
                    localStorage.setItem('token', data.token);
                    
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: data.mensaje || 'Iniciando sesión...',
                        showConfirmButton: true,
                        confirmButtonText: 'Volver a inicio',
                        timer: 5000,
                        timerProgressBar: true
                    }).then(() => {
                        window.location.href = '/';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Autenticación fallida',
                        text: data.mensaje || 'Correo o contraseña incorrectos'
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de servidor',
                    text: 'No se pudo conectar con la base de datos'
                });
            }
        });
    }
});
