(function () {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        const password = document.getElementById('password')
        const confirmPassword = document.getElementById('confirmPassword')
        const feedback = confirmPassword.nextElementSibling

        // Verifica si las contraseñas coinciden
        if (password.value !== confirmPassword.value) {

          confirmPassword.setCustomValidity('Las contraseñas no coinciden')
          feedback.textContent = 'Las contraseñas no coinciden'
        } else {
          confirmPassword.setCustomValidity('')
          feedback.textContent = 'Favor ingresar una contraseña.'
        }

        // Si el formulario no es válido según las reglas de Bootstrap
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        // Agrega la clase de Bootstrap para mostrar visualmente los estilos de validación
        form.classList.add('was-validated')
      }, false)

      const password = document.getElementById('password')
      const confirmPassword = document.getElementById('confirmPassword')

      if (password && confirmPassword) {
        // Función específica para validar solo las contraseñas mientras se escribe
        const validatePasswords = () => {
          const feedback = confirmPassword.nextElementSibling
          if (password.value !== confirmPassword.value && confirmPassword.value !== '') {
            confirmPassword.setCustomValidity('Las contraseñas no coinciden')
            feedback.textContent = 'Las contraseñas no coinciden'
          } else {
            confirmPassword.setCustomValidity('')
            feedback.textContent = 'Favor ingresar una contraseña.'
          }
        }
      }
    })
})()
