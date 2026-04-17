Carpeta para la implementación del preprocesador Sass

Cuando sea implementado el Sass aqui se guardarán los archivos correspondientes

---

## Instalación

```bash
# 1. Instalar dependencias (Bootstrap SCSS + Sass compiler)
npm install

# 2. Compilar todo el SCSS a CSS (una vez)
npm run sass:build

# 3. Modo watch durante desarrollo
npm run sass:watch
```

---

## Flujo de trabajo con SASS

**Editar siempre los archivos `.scss`, nunca los `.css`.**

| Archivo SCSS | Genera | Usado en |
|---|---|---|
| `scss/inicio.scss` | `css/inicio.css` | `pages/inicio.html` |
| `scss/catalogo.scss` | `css/catalogo.css` | `pages/catalogo.html` |
| `scss/carrito.scss` | `css/carrito.css` | `pages/carrito.html` |
| `scss/landing-page.scss` | `css/landing-page.css` | `pages/landing-page.html` |
| `scss/forms.scss` | `css/forms.css` | `pages/registro.html` + `sesion.html` |

---

## Personalización rápida

Para cambiar colores, tipografías o comportamiento de Bootstrap, edita **`scss/_variables.scss`**.

Ejemplos:
```scss
$blue:    #2176ff;   // Color de acento principal
$dark:    #2d2c2d;   // Color oscuro base
$cream:   #ede8df;   // Fondo claro
```

Los overrides de Bootstrap se aplican automáticamente al compilar, ya que `_variables.scss` se importa **antes** de Bootstrap.

---

## Mixins disponibles

| Mixin | Uso |
|---|---|
| `font-display($size, $weight)` | Aplica Playfair Display |
| `font-mono($size, $spacing)` | Aplica DM Mono |
| `section-tag` | Estilo de etiqueta de sección |
| `section-title(...)` | Título de sección con fluid type |
| `btn-sideb($bg, $color, ...)` | Botón estilo Side B |
| `animate-in($delay)` | Animación de entrada |
| `img-overlay($opacity)` | Overlay de imagen |
| `vinyl-disc($size, $duration)` | Disco de vinilo animado |
