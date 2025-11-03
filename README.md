# Daver Inmobiliaria — Sitio web con IA

Este repositorio contiene el sitio web de Daver Inmobiliaria con búsqueda inteligente potenciada por IA.

## 🚀 Características Principales

- ✨ **Búsqueda con IA**: Motor de búsqueda inteligente que entiende lenguaje natural
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos
- 💬 **Chat en vivo**: Integración con Chatwoot
- 📧 **Formulario funcional**: Envío de contacto con Web3Forms
- 🗺️ **Mapas integrados**: Ubicación de propiedades con Google Maps

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal con buscador IA
├── listings.html           # Listado de propiedades
├── contacto.html          # Formulario de contacto
├── ubicacion.html         # Página de ubicación
├── css/
│   └── styles.css         # Estilos globales
├── js/
│   ├── script.js          # JavaScript principal
│   ├── ai-search.js       # Motor de búsqueda IA
│   ├── ai-search-results.js  # Mostrar resultados
│   ├── config.example.js  # Ejemplo de configuración
│   └── config.js          # Configuración (no en git)
├── propiedad/             # Páginas individuales de propiedades
└── assets/                # Imágenes y recursos
```

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/orbinetuy-alt/InmobiliariaDaver.git
cd InmobiliariaDaver
```

### 2. Configurar API de OpenAI (Para Búsqueda IA)

1. Copia el archivo de ejemplo:
```bash
cp js/config.example.js js/config.js
```

2. Obtén tu API key de OpenAI:
   - Ve a https://platform.openai.com/
   - Crea una cuenta o inicia sesión
   - Ve a "API Keys"
   - Crea una nueva key

3. Edita `js/config.js` y pega tu API key:
```javascript
window.OPENAI_CONFIG = {
  apiKey: 'tu-api-key-aqui'
};
```

### 3. Servidor Local

Con Python 3:
```bash
python3 -m http.server 8000
```

Con Node.js (npx http-server):
```bash
npx http-server -p 8000
```

Luego abre: http://localhost:8000

## 🤖 Búsqueda Inteligente con IA

El buscador IA permite búsquedas en lenguaje natural como:

- "casa en Pocitos por menos de 200 mil"
- "apartamento 2 dormitorios cerca del mar"
- "oficina en centro menos de 100 mil"

### Cómo Funciona

1. El usuario escribe su búsqueda en lenguaje natural
2. OpenAI GPT-3.5 interpreta la búsqueda y extrae parámetros
3. El sistema filtra propiedades y las ordena por relevancia
4. Se muestran resultados con explicación y ranking

## 🔒 Seguridad

⚠️ **IMPORTANTE**: La configuración actual expone la API key en el frontend. Esto es **solo para desarrollo**.

Para producción, debes:
1. Crear un backend que actúe como proxy
2. Almacenar la API key en variables de entorno
3. Nunca exponer credenciales en el código del cliente

📖 **Lee `API_SECURITY.md`** para instrucciones detalladas sobre cómo implementar una solución segura.

## 🌐 Despliegue

### GitHub Pages
1. Ve a Settings → Pages
2. Selecciona branch `main`
3. Guarda y espera unos minutos

### Netlify
1. Arrastra la carpeta al panel de Netlify
2. O conecta el repositorio de GitHub

### Vercel
```bash
npx vercel
```

## 📝 Notas Técnicas

- **Chatwoot**: Widget configurado para chat en vivo
- **Web3Forms**: Formulario de contacto funcional sin backend
- **Google Maps**: Mapas integrados en páginas de propiedades
- **OpenAI GPT-3.5**: Motor de interpretación de búsquedas

## 🛠️ Próximas Mejoras

- [ ] Mover API key a backend seguro
- [ ] Implementar caché de búsquedas comunes
- [ ] Agregar imágenes reales a propiedades
- [ ] Sistema de favoritos con localStorage
- [ ] Tour virtual 360° de propiedades
- [ ] Dashboard de analytics

## 📧 Contacto

Daver Inmobiliaria
- Email: info@daverinmobiliaria.com
- Instagram: [@daverinmobiliaria](https://www.instagram.com/daverinmobiliaria)
- Dirección: Bv. Gral Artigas 1443, Montevideo

---

Desarrollado con ❤️ por [Tu Empresa de Automatización]

