# Configuración de Seguridad para API de OpenAI

## ⚠️ IMPORTANTE: Seguridad de la API Key

La API key de OpenAI está actualmente expuesta en el código del cliente (`js/ai-search.js`). Esto es **INSEGURO para producción** y solo debe usarse para desarrollo/pruebas.

### 🔒 Solución Recomendada: Backend Proxy

Para proteger tu API key en producción, debes crear un backend que actúe como proxy:

#### Opción 1: Serverless Function (Recomendado)

**Ventajas:**
- Sin servidor que mantener
- Escala automáticamente
- Muy económico (gratis en muchos casos)

**Servicios recomendados:**
- Vercel Serverless Functions
- Netlify Functions
- Cloudflare Workers
- AWS Lambda

#### Ejemplo con Vercel:

1. Crear archivo `api/ai-search.js`:

```javascript
export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // ← API key segura
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de inmobiliaria...'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });
    
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

2. Configurar variable de entorno en Vercel:
   - Dashboard → Settings → Environment Variables
   - Agregar: `OPENAI_API_KEY` = tu_api_key

3. Modificar `js/ai-search.js` para usar el endpoint:

```javascript
// Cambiar:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}` // ❌ Inseguro
  }
});

// Por:
const response = await fetch('/api/ai-search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
});
```

#### Opción 2: Backend Node.js/Express

Si prefieres un servidor tradicional:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/ai-search', async (req, res) => {
  const { query } = req.body;
  
  // Tu lógica aquí usando process.env.OPENAI_API_KEY
});

app.listen(3000);
```

#### Opción 3: Cloudflare Workers (Más Avanzado)

```javascript
// worker.js
export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    const { query } = await request.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}` // Secret en Cloudflare
      },
      body: JSON.stringify({
        // tu configuración
      })
    });
    
    return response;
  }
}
```

### 🔐 Mejores Prácticas Adicionales

1. **Rate Limiting**: Limita requests por IP para evitar abuso
2. **CORS**: Restringe orígenes permitidos
3. **Validación**: Valida y sanitiza todas las entradas
4. **Monitoring**: Monitorea uso y costos de OpenAI
5. **Caché**: Guarda búsquedas comunes para reducir costos

### 💰 Optimización de Costos

1. **Caché de resultados**: 
   - Guardar búsquedas comunes en localStorage/servidor
   - Reducir llamadas innecesarias a la API

2. **Limitar tokens**:
   - Usar `max_tokens` bajo (200-300)
   - Usar GPT-3.5-turbo en lugar de GPT-4

3. **Fallback sin IA**:
   - Si falla la API, usar búsqueda simple
   - No bloquear funcionalidad del sitio

### 📊 Monitoreo de Uso

Dashboard de OpenAI: https://platform.openai.com/usage

Revisa regularmente:
- Número de requests
- Tokens consumidos
- Costos acumulados
- Errores

### 🚨 Acción Inmediata Requerida

**Tu API key actual está expuesta en el código. Debes:**

1. ✅ Regenerar la API key en OpenAI
2. ✅ Implementar uno de los métodos seguros arriba
3. ✅ Agregar `.env` al `.gitignore`
4. ✅ Nunca commitear API keys en git

### 📝 Archivo .env.example

Crear este archivo para documentar variables necesarias:

```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Rate limiting
MAX_REQUESTS_PER_MINUTE=10
```

### 🎯 Para Desarrollo Local

1. Crear archivo `.env`:
```
OPENAI_API_KEY=tu_api_key_aqui
```

2. Agregar a `.gitignore`:
```
.env
.env.local
*.key
```

3. Usar en código:
```javascript
// Node.js
require('dotenv').config();
const apiKey = process.env.OPENAI_API_KEY;
```

---

## 📞 Soporte

Si necesitas ayuda implementando la solución segura, considera:
- Contratar a un desarrollador backend
- Usar servicios managed como Vercel/Netlify (más fácil)
- Consultar documentación de OpenAI sobre mejores prácticas
