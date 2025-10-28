# Daver Inmobiliaria — Sitio web estático

Este repositorio contiene una página web estática simple para una inmobiliaria con páginas: `index.html`, `listings.html` y `contacto.html`.

Estructura:
- `index.html` — Página principal
- `listings.html` — Listado de propiedades
- `contacto.html` — Formulario de contacto (validación cliente)
- `css/styles.css` — Estilos
- `js/script.js` — JavaScript pequeño (menú y validación)
- `assets/` — imágenes y recursos

Cómo probar localmente:

1. Abrir `index.html` en el navegador (doble clic o arrastrar al navegador).
2. Para un servidor local (recomendado), en macOS con Python 3 puedes ejecutar desde la carpeta del proyecto:

```bash
python3 -m http.server 8000
```

y abrir http://localhost:8000

Despliegue rápido:
- GitHub Pages: Subir el repo y activar Pages desde la rama `main`.
- Netlify: Arrastrar la carpeta al panel o conectar el repositorio.

Notas y siguientes pasos posibles:
- Añadir integración backend para enviar mensajes del formulario (ej. Netlify Functions, Firebase o un backend simple en Node/PHP).
- Conectar a una base de datos para gestionar propiedades y filtros dinámicos.
