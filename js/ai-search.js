/**
 * AI-Powered Search for Daver Inmobiliaria
 * Uses OpenAI GPT to interpret natural language property searches
 */

// IMPORTANTE: Configura tu API key en el archivo config.js (no incluido en git)
// Para producción, la API key DEBE estar en el backend, no en el frontend
// Ver API_SECURITY.md para instrucciones detalladas
const OPENAI_API_KEY = window.OPENAI_CONFIG?.apiKey || '';

// SheetDB API endpoint para analytics de búsquedas
// INSTRUCCIONES PARA CONFIGURAR:
// 1. Ve a https://sheetdb.io/
// 2. Crea una cuenta gratuita
// 3. Conecta tu Google Sheet (crea uno con columnas: fecha, hora, busqueda, resultados, tipo, zona, operacion, precio_min, precio_max, dispositivo)
// 4. Copia el API endpoint que te da SheetDB
// 5. Reemplaza 'TU_SHEETDB_API_ID' con tu ID real
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/TU_SHEETDB_API_ID';

/**
 * Registra una búsqueda en Google Sheets para analytics
 */
async function logSearchAnalytics(query, params, resultsCount) {
  // Si no está configurado el API, saltar silenciosamente
  if (SHEETDB_API_URL.includes('TU_SHEETDB_API_ID')) {
    console.log('📊 Analytics no configurado. Configura SHEETDB_API_URL en ai-search.js');
    return;
  }

  try {
    const now = new Date();
    const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop';
    
    const analyticsData = {
      fecha: now.toLocaleDateString('es-UY'),
      hora: now.toLocaleTimeString('es-UY'),
      busqueda: query,
      resultados: resultsCount,
      tipo: params.type || 'N/A',
      zona: params.zone || 'N/A',
      operacion: params.operation || 'N/A',
      precio_min: params.priceRange?.min || 'N/A',
      precio_max: params.priceRange?.max || 'N/A',
      dormitorios: params.bedrooms || 'N/A',
      dispositivo: deviceType,
      timestamp: now.toISOString()
    };

    await fetch(SHEETDB_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: analyticsData })
    });

    console.log('📊 Búsqueda registrada en analytics:', analyticsData);
  } catch (error) {
    // Fallar silenciosamente para no interrumpir la experiencia del usuario
    console.warn('⚠️ No se pudo registrar analytics:', error.message);
  }
}

// Base de datos de propiedades (en producción, esto vendría de un servidor)
const properties = [
  {
    id: 1,
    title: "Apartamento 3 Dormitorios",
    type: "apartamento",
    zone: "pocitos",
    zoneName: "Pocitos",
    price: 195000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    features: ["garaje", "terraza", "luminoso"],
    description: "Apartamento luminoso en Pocitos con hermosa terraza",
    url: "propiedad/pocitos/apartamento-3-dormitorios/index.html"
  },
  {
    id: 2,
    title: "Casa 4 Dormitorios",
    type: "casa",
    zone: "punta-carretas",
    zoneName: "Punta Carretas",
    price: 450000,
    currency: "USD",
    operation: "venta",
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    features: ["piscina", "jardín", "garaje doble", "barbacoa"],
    description: "Espectacular casa en Punta Carretas con piscina",
    url: "propiedad/punta-carretas/casa-4-dormitorios/index.html"
  },
  {
    id: 3,
    title: "Casa 3 Dormitorios",
    type: "casa",
    zone: "carrasco",
    zoneName: "Carrasco",
    price: 380000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 220,
    features: ["garaje", "jardín", "cerca del mar"],
    description: "Hermosa casa en Carrasco cerca del mar",
    url: "propiedad/carrasco/casa-3-dormitorios/index.html"
  },
  {
    id: 4,
    title: "Apartamento 3 Dormitorios",
    type: "apartamento",
    zone: "tres-cruces",
    zoneName: "Tres Cruces",
    price: 165000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    features: ["garaje", "balcón"],
    description: "Apartamento en Tres Cruces con excelente ubicación",
    url: "propiedad/tres-cruces/apartamento-3-dormitorios/index.html"
  },
  {
    id: 5,
    title: "Oficina 170m²",
    type: "oficina",
    zone: "ciudad-vieja",
    zoneName: "Ciudad Vieja",
    price: 120000,
    currency: "USD",
    operation: "venta",
    area: 170,
    features: ["amplia", "luminosa", "céntrica"],
    description: "Amplia oficina en Ciudad Vieja",
    url: "propiedad/ciudad-vieja/oficina-170m2/index.html"
  },
  {
    id: 6,
    title: "Oficina 40m²",
    type: "oficina",
    zone: "cordon",
    zoneName: "Cordón",
    price: 42000,
    currency: "USD",
    operation: "venta",
    area: 40,
    features: ["céntrica", "renovada"],
    description: "Oficina en Cordón ideal para profesionales",
    url: "propiedad/cordon/oficina-40m2/index.html"
  },
  {
    id: 7,
    title: "Oficina 28m²",
    type: "oficina",
    zone: "ciudad-vieja",
    zoneName: "Ciudad Vieja",
    price: 30000,
    currency: "USD",
    operation: "venta",
    area: 28,
    features: ["céntrica", "compacta"],
    description: "Oficina compacta en Ciudad Vieja",
    url: "propiedad/ciudad-vieja/oficina-28m2/index.html"
  },
  {
    id: 8,
    title: "Monoambiente a Estrenar",
    type: "apartamento",
    zone: "cordon",
    zoneName: "Cordón",
    price: 75000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    features: ["estrenar", "moderno"],
    description: "Monoambiente a estrenar en Cordón",
    url: "propiedad/cordon/monoambiente-estrenar/index.html"
  },
  {
    id: 9,
    title: "Monoambiente a Estrenar",
    type: "apartamento",
    zone: "union",
    zoneName: "Unión",
    price: 78000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    features: ["estrenar", "terraza"],
    description: "Monoambiente con terraza en Unión",
    url: "propiedad/union/monoambiente-estrenar/index.html"
  },
  {
    id: 10,
    title: "Casa 3 Dormitorios",
    type: "casa",
    zone: "la-figurita",
    zoneName: "La Figurita",
    price: 180000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    features: ["patio", "garaje"],
    description: "Casa con patio en La Figurita",
    url: "propiedad/la-figurita/casa-3-dormitorios/index.html"
  },
  {
    id: 11,
    title: "Terreno 296m²",
    type: "terreno",
    zone: "la-comercial",
    zoneName: "La Comercial",
    price: 85000,
    currency: "USD",
    operation: "venta",
    area: 296,
    features: ["amplio", "bien ubicado"],
    description: "Terreno amplio en La Comercial",
    url: "propiedad/la-comercial/terreno-296m2/index.html"
  },
  {
    id: 12,
    title: "Casa 1 Dormitorio",
    type: "casa",
    zone: "la-comercial",
    zoneName: "La Comercial",
    price: 95000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    features: ["patio", "compacta"],
    description: "Casa compacta con patio en La Comercial",
    url: "propiedad/la-comercial/casa-1-dormitorio/index.html"
  },
  {
    id: 13,
    title: "Apartamento 2 Dormitorios",
    type: "apartamento",
    zone: "capurro",
    zoneName: "Capurro",
    price: 95000,
    currency: "USD",
    operation: "venta",
    bedrooms: 2,
    bathrooms: 1,
    area: 60,
    features: ["luminoso", "balcón"],
    description: "Apartamento con balcón en Capurro",
    url: "propiedad/capurro/apartamento-2-dormitorios/index.html"
  },
  {
    id: 14,
    title: "Apartamento 2 Dormitorios",
    type: "apartamento",
    zone: "palermo",
    zoneName: "Palermo",
    price: 140000,
    currency: "USD",
    operation: "venta",
    bedrooms: 2,
    bathrooms: 1,
    area: 70,
    features: ["luminoso", "balcón"],
    description: "Apartamento luminoso en Palermo",
    url: "propiedad/palermo/apartamento-2-dormitorios/index.html"
  },
  {
    id: 15,
    title: "Casa 3 Dormitorios",
    type: "casa",
    zone: "palermo",
    zoneName: "Palermo",
    price: 285000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    features: ["patio", "garaje", "amplia"],
    description: "Casa amplia con patio en Palermo",
    url: "propiedad/palermo/casa-3-dormitorios/index.html"
  }
];

/**
 * Interpreta búsqueda en lenguaje natural usando OpenAI
 */
async function interpretSearchWithAI(query) {
  console.log(`🤖 Interpretando búsqueda: "${query}"`);
  
  // Si no hay API key, usar fallback directamente
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ No hay API key, usando búsqueda simple');
    return extractParametersSimple(query);
  }
  
  const prompt = `Eres un asistente de una inmobiliaria en Montevideo, Uruguay. Analiza la siguiente búsqueda de un cliente y extrae los parámetros en formato JSON.

Búsqueda del cliente: "${query}"

Extrae SOLO los parámetros mencionados explícitamente. Si algo no se menciona, deja el campo en null.

Barrios de Montevideo válidos: pocitos, carrasco, punta-carretas, tres-cruces, centro, ciudad-vieja, cordon, palermo, union, la-comercial, la-figurita, capurro, aguada, barrio-sur, la-blanqueada

Tipos de propiedad válidos: casa, apartamento, oficina, terreno

Responde SOLO con un objeto JSON válido con esta estructura:
{
  "type": "tipo de propiedad o null",
  "zone": "barrio en formato slug o null",
  "maxPrice": número o null,
  "minPrice": número o null,
  "bedrooms": número o null,
  "features": ["lista", "de", "características"] o [],
  "explanation": "breve explicación de qué entendiste de la búsqueda"
}`;

  try {
    console.log('📡 Enviando petición a OpenAI...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Eres un asistente de inmobiliaria experto en interpretar búsquedas. Respondes siempre con JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error API ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta de OpenAI recibida');
    
    const content = data.choices[0].message.content.trim();
    console.log('📝 Respuesta raw:', content);
    
    // Limpiar el contenido para extraer solo el JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ No se pudo extraer JSON de la respuesta');
      throw new Error('No se pudo extraer JSON de la respuesta');
    }
    
    const parsedParams = JSON.parse(jsonMatch[0]);
    console.log('✅ Parámetros interpretados por IA:', parsedParams);
    return parsedParams;
    
  } catch (error) {
    console.error('❌ Error al interpretar con IA:', error.message);
    console.log('⚙️ Usando búsqueda simple como fallback...');
    // Fallback: extracción simple si falla la IA
    const simpleParams = extractParametersSimple(query);
    console.log('✅ Parámetros (búsqueda simple):', simpleParams);
    return simpleParams;
  }
}

/**
 * Extracción simple de parámetros (fallback)
 */
function extractParametersSimple(query) {
  const lowerQuery = query.toLowerCase();
  
  const params = {
    type: null,
    zone: null,
    maxPrice: null,
    minPrice: null,
    bedrooms: null,
    features: [],
    explanation: "Búsqueda interpretada sin IA"
  };
  
  // Detectar tipo
  if (lowerQuery.includes('casa')) params.type = 'casa';
  else if (lowerQuery.includes('apartamento') || lowerQuery.includes('apto')) params.type = 'apartamento';
  else if (lowerQuery.includes('oficina')) params.type = 'oficina';
  else if (lowerQuery.includes('terreno')) params.type = 'terreno';
  
  // Detectar zona
  const zones = {
    'pocitos': ['pocitos'],
    'carrasco': ['carrasco'],
    'punta-carretas': ['punta carretas', 'punta-carretas'],
    'tres-cruces': ['tres cruces', 'tres-cruces'],
    'centro': ['centro'],
    'ciudad-vieja': ['ciudad vieja', 'ciudad-vieja'],
    'cordon': ['cordón', 'cordon'],
    'palermo': ['palermo'],
    'union': ['unión', 'union'],
    'la-comercial': ['la comercial', 'comercial'],
    'la-figurita': ['la figurita', 'figurita'],
    'capurro': ['capurro']
  };
  
  for (const [zone, keywords] of Object.entries(zones)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      params.zone = zone;
      break;
    }
  }
  
  // Detectar precio
  const priceMatch = lowerQuery.match(/(\d+)\s*(mil|k|thousand)/i);
  if (priceMatch) {
    const value = parseInt(priceMatch[1]) * 1000;
    if (lowerQuery.includes('menos') || lowerQuery.includes('hasta') || lowerQuery.includes('max')) {
      params.maxPrice = value;
    } else if (lowerQuery.includes('más') || lowerQuery.includes('desde') || lowerQuery.includes('min')) {
      params.minPrice = value;
    } else {
      params.maxPrice = value;
    }
  }
  
  // Detectar dormitorios
  const bedroomsMatch = lowerQuery.match(/(\d+)\s*(dormitorio|dorm|habitación|habitacion)/i);
  if (bedroomsMatch) {
    params.bedrooms = parseInt(bedroomsMatch[1]);
  }
  
  return params;
}

/**
 * Filtra propiedades basándose en los parámetros extraídos
 */
function filterProperties(params) {
  console.log('🔍 Filtrando propiedades con parámetros:', params);
  
  let results = [...properties];
  let scores = new Map();
  
  // Primero filtrar por criterios obligatorios
  results = results.filter(prop => {
    let score = 100; // Score base
    let shouldInclude = true;
    
    // Tipo (OBLIGATORIO si se especificó)
    if (params.type) {
      if (prop.type === params.type) {
        score += 30;
        console.log(`  ✓ ${prop.title}: Coincide tipo "${params.type}"`);
      } else {
        console.log(`  ✗ ${prop.title}: No coincide tipo (busca "${params.type}", es "${prop.type}")`);
        return false; // DESCARTAR
      }
    }
    
    // Zona (OBLIGATORIO si se especificó)
    if (params.zone) {
      if (prop.zone === params.zone) {
        score += 30;
        console.log(`  ✓ ${prop.title}: Coincide zona "${params.zone}"`);
      } else {
        console.log(`  ✗ ${prop.title}: No coincide zona (busca "${params.zone}", es "${prop.zone}")`);
        return false; // DESCARTAR
      }
    }
    
    // Precio máximo (OBLIGATORIO si se especificó)
    if (params.maxPrice) {
      if (prop.price <= params.maxPrice) {
        score += 20;
        console.log(`  ✓ ${prop.title}: Dentro de presupuesto ($${prop.price} <= $${params.maxPrice})`);
      } else {
        console.log(`  ✗ ${prop.title}: Fuera de presupuesto ($${prop.price} > $${params.maxPrice})`);
        return false; // DESCARTAR
      }
    }
    
    // Precio mínimo (opcional)
    if (params.minPrice && prop.price >= params.minPrice) {
      score += 10;
    }
    
    // Dormitorios (preferencia, no obligatorio)
    if (params.bedrooms && prop.bedrooms) {
      if (prop.bedrooms === params.bedrooms) {
        score += 15;
        console.log(`  ✓ ${prop.title}: Coincide dormitorios (${params.bedrooms})`);
      } else {
        // Dar puntos parciales si está cerca
        const diff = Math.abs(prop.bedrooms - params.bedrooms);
        if (diff === 1) {
          score += 7;
          console.log(`  ~ ${prop.title}: Dormitorios cercanos (${prop.bedrooms} vs ${params.bedrooms})`);
        }
      }
    }
    
    // Características (preferencia, no obligatorio)
    if (params.features && params.features.length > 0 && prop.features) {
      params.features.forEach(feature => {
        if (prop.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))) {
          score += 5;
          console.log(`  ✓ ${prop.title}: Tiene característica "${feature}"`);
        }
      });
    }
    
    scores.set(prop.id, score);
    return true; // INCLUIR
  });
  
  console.log(`\n📊 Propiedades después del filtrado: ${results.length}`);
  
  // Si no hay criterios específicos, mostrar todas
  if (!params.type && !params.zone && !params.maxPrice && !params.bedrooms) {
    console.log('⚠️ No hay criterios específicos, mostrando todas las propiedades');
  }
  
  // Ordenar por score descendente
  results.sort((a, b) => {
    const scoreA = scores.get(a.id) || 0;
    const scoreB = scores.get(b.id) || 0;
    return scoreB - scoreA;
  });
  
  // Log de resultados finales
  results.forEach((prop, index) => {
    console.log(`  ${index + 1}. ${prop.title} - Score: ${scores.get(prop.id)}`);
  });
  
  return results.slice(0, 9); // Máximo 9 resultados
}

/**
 * Inicializa el buscador IA
 */
function initAISearch() {
  const form = document.getElementById('aiSearchForm');
  const input = document.getElementById('aiSearchInput');
  const loading = document.getElementById('aiSearchLoading');
  const suggestionsChips = document.querySelectorAll('.suggestion-chip');
  
  // Verificar si hay API key configurada
  if (!OPENAI_API_KEY) {
    console.warn('⚠️ API key de OpenAI no configurada. Usando búsqueda simple.');
    // Mostrar advertencia visual
    const badge = document.querySelector('.ai-badge');
    if (badge) {
      badge.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        Búsqueda Inteligente (modo simple)
      `;
      badge.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15))';
      badge.style.borderColor = 'rgba(251, 191, 36, 0.3)';
      badge.style.color = '#f59e0b';
    }
  }
  
  // Manejar clicks en sugerencias
  suggestionsChips.forEach(chip => {
    chip.addEventListener('click', function() {
      const query = this.getAttribute('data-query');
      input.value = query;
      form.dispatchEvent(new Event('submit'));
    });
  });
  
  // Manejar envío del formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const query = input.value.trim();
    if (!query) {
      showNotification('Por favor ingresa una búsqueda', 'warning');
      input.focus();
      return;
    }
    
    // Mostrar loading
    loading.style.display = 'flex';
    input.disabled = true;
    const submitBtn = form.querySelector('.ai-search-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px;"></div> Buscando...';
    }
    
    try {
      // Interpretar búsqueda con IA
      const params = await interpretSearchWithAI(query);
      console.log('✅ Parámetros extraídos:', params);
      
      // Filtrar propiedades
      const results = filterProperties(params);
      console.log(`✅ Se encontraron ${results.length} propiedades`);
      
      // 📊 Registrar búsqueda en analytics (Google Sheets)
      logSearchAnalytics(query, params, results.length).catch(err => {
        console.warn('Analytics error:', err);
      });
      
      // Guardar en sessionStorage para la página de resultados
      sessionStorage.setItem('aiSearchQuery', query);
      sessionStorage.setItem('aiSearchParams', JSON.stringify(params));
      sessionStorage.setItem('aiSearchResults', JSON.stringify(results));
      
      // Redirigir a la página de resultados
      window.location.href = 'listings.html?ai_search=true';
      
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      showNotification('Hubo un error al procesar tu búsqueda. Intenta con términos más simples o verifica tu conexión.', 'error');
      loading.style.display = 'none';
      input.disabled = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Buscar
        `;
      }
    }
  });
}

/**
 * Muestra notificación al usuario
 */
function showNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `ai-notification ai-notification-${type}`;
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'error' ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>' : 
        type === 'warning' ? '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>' :
        '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'}
    </svg>
    <span>${message}</span>
  `;
  
  // Agregar estilos
  const style = document.createElement('style');
  style.textContent = `
    .ai-notification {
      position: fixed;
      top: 2rem;
      right: 2rem;
      max-width: 400px;
      padding: 1rem 1.5rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    }
    
    .ai-notification-error {
      border-left: 4px solid #ef4444;
      color: #dc2626;
    }
    
    .ai-notification-warning {
      border-left: 4px solid #f59e0b;
      color: #d97706;
    }
    
    .ai-notification-info {
      border-left: 4px solid #3b82f6;
      color: #2563eb;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @media (max-width: 768px) {
      .ai-notification {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Agregar al body
  document.body.appendChild(notification);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAISearch);
} else {
  initAISearch();
}
