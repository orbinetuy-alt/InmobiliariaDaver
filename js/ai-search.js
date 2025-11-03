/**
 * AI-Powered Search for Daver Inmobiliaria
 * Uses OpenAI GPT to interpret natural language property searches
 */

// IMPORTANTE: Configura tu API key en el archivo config.js (no incluido en git)
// Para producción, la API key DEBE estar en el backend, no en el frontend
// Ver API_SECURITY.md para instrucciones detalladas
const OPENAI_API_KEY = window.OPENAI_CONFIG?.apiKey || '';

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
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Limpiar el contenido para extraer solo el JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }
    
    const parsedParams = JSON.parse(jsonMatch[0]);
    return parsedParams;
  } catch (error) {
    console.error('Error al interpretar con IA:', error);
    // Fallback: extracción simple si falla la IA
    return extractParametersSimple(query);
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
  let results = [...properties];
  let scores = new Map();
  
  results.forEach(prop => {
    let score = 0;
    
    // Tipo (peso: 30)
    if (params.type && prop.type === params.type) {
      score += 30;
    } else if (params.type) {
      return; // Si se especificó tipo y no coincide, descartar
    }
    
    // Zona (peso: 30)
    if (params.zone && prop.zone === params.zone) {
      score += 30;
    } else if (params.zone) {
      return; // Si se especificó zona y no coincide, descartar
    }
    
    // Precio (peso: 20)
    if (params.maxPrice && prop.price <= params.maxPrice) {
      score += 20;
    } else if (params.maxPrice && prop.price > params.maxPrice) {
      return; // Fuera de presupuesto
    }
    
    if (params.minPrice && prop.price >= params.minPrice) {
      score += 10;
    }
    
    // Dormitorios (peso: 15)
    if (params.bedrooms && prop.bedrooms === params.bedrooms) {
      score += 15;
    } else if (params.bedrooms && prop.bedrooms) {
      // Dar puntos parciales si está cerca
      const diff = Math.abs(prop.bedrooms - params.bedrooms);
      if (diff === 1) score += 7;
    }
    
    // Características (peso: 5)
    if (params.features && params.features.length > 0) {
      params.features.forEach(feature => {
        if (prop.features && prop.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))) {
          score += 5;
        }
      });
    }
    
    scores.set(prop.id, score);
  });
  
  // Filtrar propiedades que no cumplieron criterios obligatorios
  results = results.filter(prop => scores.has(prop.id));
  
  // Ordenar por score descendente
  results.sort((a, b) => scores.get(b.id) - scores.get(a.id));
  
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
      alert('Por favor ingresa una búsqueda');
      return;
    }
    
    // Mostrar loading
    loading.style.display = 'flex';
    input.disabled = true;
    
    try {
      // Interpretar búsqueda con IA
      const params = await interpretSearchWithAI(query);
      console.log('Parámetros extraídos:', params);
      
      // Filtrar propiedades
      const results = filterProperties(params);
      
      // Guardar en sessionStorage para la página de resultados
      sessionStorage.setItem('aiSearchQuery', query);
      sessionStorage.setItem('aiSearchParams', JSON.stringify(params));
      sessionStorage.setItem('aiSearchResults', JSON.stringify(results));
      
      // Redirigir a la página de resultados
      window.location.href = 'listings.html?ai_search=true';
      
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Hubo un error al procesar tu búsqueda. Por favor intenta nuevamente.');
      loading.style.display = 'none';
      input.disabled = false;
    }
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAISearch);
} else {
  initAISearch();
}
