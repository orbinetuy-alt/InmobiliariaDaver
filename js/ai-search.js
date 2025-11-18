/**
 * AI-Powered Search for Daver Inmobiliaria
 * Uses OpenAI GPT to interpret natural language property searches
 */

// IMPORTANTE: Configura tu API key en el archivo config.js (no incluido en git)
// Para producción, la API key DEBE estar en el backend, no en el frontend
// Ver API_SECURITY.md para instrucciones detalladas
const OPENAI_API_KEY = window.OPENAI_CONFIG?.apiKey || '';

// n8n Webhook para analytics de búsquedas
// ✅ Conectado con n8n para mayor flexibilidad y sin límites
// Los datos se envían a tu workflow de n8n que luego guarda en Google Sheets
const ANALYTICS_WEBHOOK_URL = 'https://n8n.srv1035532.hstgr.cloud/webhook/búsquedas-daver';

/**
 * Registra una búsqueda en Google Sheets para analytics vía n8n
 */
async function logSearchAnalytics(query, params, resultsCount) {
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

    console.log('� [ANALYTICS] Webhook URL:', ANALYTICS_WEBHOOK_URL);
    console.log('�📊 [ANALYTICS] Enviando datos a n8n...', analyticsData);
    
    const response = await fetch(ANALYTICS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsData)
    });

    console.log('📡 [ANALYTICS] Response status:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📡 [ANALYTICS] Response body:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }
    
    if (response.ok) {
      console.log('✅ [ANALYTICS] Búsqueda registrada exitosamente!');
    } else {
      console.error('❌ [ANALYTICS] Error al guardar:', response.status, responseData);
    }
  } catch (error) {
    console.error('⚠️ [ANALYTICS] Error completo:', error);
    console.error('⚠️ [ANALYTICS] Error stack:', error.stack);
  }
}

// Base de datos de propiedades (en producción, esto vendría de un servidor)
const properties = [
  {
    id: 7,
    title: "Monoambiente a Estrenar",
    type: "apartamento",
    zone: "union",
    zoneName: "Unión",
    price: 21000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 51,
    features: ["estrenar", "terraza"],
    description: "Monoambiente a estrenar con terraza en Unión",
    url: "propiedad/union/monoambiente-estrenar/index.html",
    image: "assets/properties/union-apartamento/foto-1.jpeg"
  },
  {
    id: 8,
    title: "Oficina 28m²",
    type: "oficina",
    zone: "ciudad-vieja",
    zoneName: "Ciudad Vieja",
    price: 10000,
    currency: "UYU",
    operation: "alquiler",
    area: 28,
    features: ["céntrica", "compacta"],
    description: "Oficina compacta en Ciudad Vieja",
    url: "propiedad/ciudad-vieja/oficina-28m2/index.html",
    image: "assets/oficina-ciudad-vieja.jpg"
  },
  {
    id: 10,
    title: "Apartamento 3 Dormitorios",
    type: "apartamento",
    zone: "tres-cruces",
    zoneName: "Tres Cruces",
    price: 160000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 68,
    features: ["balcón", "luminoso"],
    description: "Apartamento luminoso en Tres Cruces",
    url: "propiedad/tres-cruces/apartamento-3-dormitorios/index.html",
    image: "assets/properties/tres-cruces-apartamento-3dorm/foto-1.jpeg"
  },
  {
    id: 11,
    title: "Apartamento 3 Dormitorios",
    type: "apartamento",
    zone: "pocitos",
    zoneName: "Pocitos",
    price: 328000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 115,
    features: ["garaje", "terraza", "luminoso"],
    description: "Apartamento luminoso en Pocitos con terraza",
    url: "propiedad/pocitos/apartamento-3-dormitorios/index.html",
    image: "assets/properties/pocitos-apartamento/foto-1.jpeg"
  },
  {
    id: 12,
    title: "Casa 1 Dormitorio",
    type: "casa",
    zone: "la-comercial",
    zoneName: "La Comercial",
    price: 78000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 50,
    features: ["compacta", "patio"],
    description: "Casa compacta en La Comercial",
    url: "propiedad/la-comercial/casa-1-dormitorio/index.html",
    image: "assets/casa-la-comercial.jpg"
  },
  {
    id: 13,
    title: "Apartamento 2 Dormitorios",
    type: "apartamento",
    zone: "palermo",
    zoneName: "Palermo",
    price: 129000,
    currency: "USD",
    operation: "venta",
    bedrooms: 2,
    bathrooms: 1,
    area: 76,
    features: ["luminoso", "balcón"],
    description: "Apartamento luminoso en Palermo",
    url: "propiedad/palermo/apartamento-2-dormitorios/index.html",
    image: "assets/properties/palermo-apartamento/foto-1.jpeg"
  },
  {
    id: 14,
    title: "Casa 3 Dormitorios",
    type: "casa",
    zone: "palermo",
    zoneName: "Palermo",
    price: 240000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    features: ["patio", "amplia"],
    description: "Casa amplia en Palermo",
    url: "propiedad/palermo/casa-3-dormitorios/index.html",
    image: "assets/casa-palermo.jpg"
  },
  {
    id: 15,
    title: "Oficina 170m²",
    type: "oficina",
    zone: "ciudad-vieja",
    zoneName: "Ciudad Vieja",
    price: 1400,
    currency: "USD",
    operation: "alquiler",
    area: 170,
    features: ["amplia", "8 oficinas", "céntrica"],
    description: "Amplia oficina en Ciudad Vieja",
    url: "propiedad/ciudad-vieja/oficina-170m2/index.html",
    image: "assets/oficina-ciudad-vieja-170m2.jpg"
  },
  {
    id: 16,
    title: "Oficina 40m²",
    type: "oficina",
    zone: "cordon",
    zoneName: "Cordón",
    price: 45000,
    currency: "UYU",
    operation: "alquiler",
    area: 40,
    features: ["consultorio", "céntrica"],
    description: "Oficina consultorio en Cordón",
    url: "propiedad/cordon/oficina-40m2/index.html",
    image: "assets/properties/cordon-oficina/foto-1.jpeg"
  },
  {
    id: 18,
    title: "Casa 3 Dormitorios",
    type: "casa",
    zone: "carrasco",
    zoneName: "Carrasco",
    price: 400000,
    currency: "USD",
    operation: "venta",
    bedrooms: 3,
    bathrooms: 3,
    area: 182,
    features: ["amplia", "jardín"],
    description: "Casa amplia en Parque de Carrasco",
    url: "propiedad/carrasco/casa-3-dormitorios/index.html",
    image: "assets/casa-carrasco.jpg"
  },
  {
    id: 19,
    title: "Monoambiente a Estrenar",
    type: "apartamento",
    zone: "cordon",
    zoneName: "Cordón",
    price: 20000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 37,
    features: ["estrenar", "moderno"],
    description: "Monoambiente a estrenar en Cordón",
    url: "propiedad/cordon/monoambiente-estrenar/index.html",
    image: "assets/apartamento-cordon.jpg"
  },
  {
    id: 20,
    title: "Apartamento 2 Dormitorios",
    type: "apartamento",
    zone: "capurro",
    zoneName: "Capurro",
    price: 22500,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 2,
    bathrooms: 1,
    area: 50,
    features: ["luminoso", "balcón"],
    description: "Apartamento en Capurro Bella Vista",
    url: "propiedad/capurro/apartamento-2-dormitorios/index.html",
    image: "assets/apartamento-capurro.jpg"
  },
  {
    id: 21,
    title: "Terreno 296m²",
    type: "terreno",
    zone: "la-comercial",
    zoneName: "La Comercial",
    price: 320000,
    currency: "USD",
    operation: "venta",
    area: 296,
    features: ["amplio", "FOS 100%"],
    description: "Terreno amplio en La Comercial sobre Bvar Artigas",
    url: "propiedad/la-comercial/terreno-296m2/index.html",
    image: "assets/terreno-la-comercial.jpg"
  },
  {
    id: 22,
    title: "Apartamento en Barrio Sur",
    type: "apartamento",
    zone: "barrio-sur",
    zoneName: "Barrio Sur",
    price: 110000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    features: ["entrada independiente", "aire acondicionado", "patio exclusivo", "buena ubicación"],
    description: "Apartamento en planta baja con entrada independiente. Sobre calle Maldonado esquina Andes, excelente ubicación en pleno centro de Montevideo y a metros de la rambla Sur. Living comedor al frente, amplio dormitorio, baño completo y cocina con salida a patio de 8 m² de uso exclusivo. Queda instalado equipo de aire acondicionado. Muy buen estado.",
    url: "propiedad/barrio-sur/apartamento-1-dormitorio/index.html",
    image: "assets/properties/barrio-sur-apartamento-venta/foto-1.jpeg"
  },
  {
    id: 23,
    title: "Apartamento en Alquiler en Barrio Sur",
    type: "apartamento",
    zone: "barrio-sur",
    zoneName: "Barrio Sur",
    price: 23000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    features: ["planta baja", "entrada independiente", "patio exclusivo", "cerca rambla"],
    description: "Apartamento en planta baja con entrada independiente. Amplio living comedor y dormitorio al frente con doble ventana. Baño completo con conexiones para lavarropa. Cocina con salida a patio de uso exclusivo. A metros de la rambla sur.",
    url: "propiedad/barrio-sur/apartamento-alquiler/index.html",
    image: "assets/properties/barrio-sur-apartamento-alquiler/foto-1.jpeg"
  },
  {
    id: 24,
    title: "Apartamento 2 Dormitorios en Tres Cruces",
    type: "apartamento",
    zone: "tres-cruces",
    zoneName: "Tres Cruces",
    price: 33500,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 2,
    bathrooms: 1,
    area: 55,
    features: ["garage", "gimnasio", "barbacoa", "portería", "terraza"],
    description: "Apartamento con 2 dormitorios, living comedor, cocina y baño. Amplia terraza estar. Edificio con portería 9-21hs, gimnasio, barbacoa y lavadero. Garage en lugar fijo incluido. Excelente ubicación en Tres Cruces.",
    url: "propiedad/tres-cruces/apartamento-2-dormitorios-alquiler/index.html",
    image: "assets/properties/tres-cruces-apartamento-2dorm/foto-1.jpeg"
  },
  {
    id: 25,
    title: "Apartamento 1 Dormitorio en Centro",
    type: "apartamento",
    zone: "centro",
    zoneName: "Centro",
    price: 84000,
    currency: "USD",
    operation: "venta",
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    features: ["luminoso", "balcón", "céntrico"],
    description: "Apartamento en primer piso interno con balcón al patio. Living comedor con ventana, cocina, baño completo y dormitorio. Muy luminoso. Excelente ubicación en pleno centro de Montevideo.",
    url: "propiedad/centro/apartamento-1-dormitorio/index.html",
    image: "assets/properties/centro-apartamento/foto-1.jpeg"
  },
  {
    id: 26,
    title: "Casa 2 Dormitorios en Aguada",
    type: "casa",
    zone: "aguada",
    zoneName: "Aguada",
    price: 99000,
    currency: "USD",
    operation: "venta",
    bedrooms: 2,
    bathrooms: 1,
    area: 46,
    features: ["con renta", "inversión", "patio"],
    description: "Casa con renta actual de $22.500. Living comedor, cocina, 2 dormitorios, baño completo y patio. Excelente oportunidad de inversión en barrio tradicional con todos los servicios.",
    url: "propiedad/aguada/casa-2-dormitorios/index.html",
    image: "assets/placeholder.svg"
  },
  {
    id: 27,
    title: "Casa 1 Dormitorio en La Blanqueada",
    type: "casa",
    zone: "la-blanqueada",
    zoneName: "La Blanqueada",
    price: 38000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    features: ["patio", "garage opcional", "tranquila"],
    description: "Casa con living, dormitorio amplio, cocina, baño completo y patio al fondo. Garage disponible opcional. Ubicación tranquila en barrio consolidado con todos los servicios.",
    url: "propiedad/la-blanqueada/casa-1-dormitorio/index.html",
    image: "assets/properties/la-blanqueada-casa/foto-1.jpeg"
  },
  {
    id: 28,
    title: "Apartamento 1 Dormitorio en La Blanqueada",
    type: "apartamento",
    zone: "la-blanqueada",
    zoneName: "La Blanqueada",
    price: 38000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    features: ["balcón", "luminoso", "garage opcional"],
    description: "Apartamento con living, dormitorio, cocina, baño completo y balcón. Muy luminoso y en buen estado. Garage opcional consultar precio. Excelente ubicación en La Blanqueada.",
    url: "propiedad/la-blanqueada/apartamento-1-dormitorio/index.html",
    image: "assets/properties/la-blanqueada-apartamento/foto-1.jpeg"
  },
  {
    id: 29,
    title: "Apartamento 4 Dormitorios en Punta Carretas",
    type: "apartamento",
    zone: "punta-carretas",
    zoneName: "Punta Carretas",
    price: 220000,
    currency: "USD",
    operation: "venta",
    bedrooms: 4,
    bathrooms: 2,
    area: 110,
    features: ["amplio", "zona premium", "alto potencial"],
    description: "Amplio apartamento de 110m² con 4 dormitorios y 2 baños completos. Ubicación premium en Punta Carretas. Alto potencial para proyecto comercial o profesional. Gran oportunidad de inversión.",
    url: "propiedad/punta-carretas/apartamento-4-dormitorios/index.html",
    image: "assets/properties/punta-carretas-apartamento/foto-1.jpeg"
  },
  {
    id: 30,
    title: "Casa 4 Dormitorios en Punta Carretas",
    type: "casa",
    zone: "punta-carretas",
    zoneName: "Punta Carretas",
    price: 220000,
    currency: "USD",
    operation: "venta",
    bedrooms: 4,
    bathrooms: 2,
    area: 110,
    features: ["amplia", "zona premium", "alto potencial"],
    description: "Casa de 110m² con 4 dormitorios y 2 baños completos. Ubicación premium en Punta Carretas. Alto potencial para proyecto comercial o profesional. Gran oportunidad de inversión.",
    url: "propiedad/punta-carretas/casa-4-dormitorios/index.html",
    image: "assets/properties/punta-carretas-casa/foto-1.jpeg"
  },
  {
    id: 31,
    title: "Oficina 170m² en Ciudad Vieja",
    type: "oficina",
    zone: "ciudad-vieja",
    zoneName: "Ciudad Vieja",
    price: 165000,
    currency: "USD",
    operation: "venta",
    area: 170,
    features: ["8 oficinas", "céntrica", "amplia", "baños completos"],
    description: "Oficina de 170m² con 8 espacios independientes, 2 baños completos y cocina. Ubicación premium en Ciudad Vieja sobre calle peatonal. Ideal para establecer empresa en el corazón de Montevideo.",
    url: "propiedad/ciudad-vieja/oficina-venta/index.html",
    image: "assets/placeholder.svg"
  },
  {
    id: 32,
    title: "Apartamento 1 Dormitorio en Tres Cruces",
    type: "apartamento",
    zone: "tres-cruces",
    zoneName: "Tres Cruces",
    price: 18000,
    currency: "UYU",
    operation: "alquiler",
    bedrooms: 1,
    bathrooms: 1,
    area: 43,
    features: ["luminoso", "balcón", "céntrico", "laundry"],
    description: "Apartamento con dormitorio, living comedor, cocina, baño completo y balcón. Incluye área de laundry con conexiones. Muy luminoso con ventanas en todos los ambientes. Excelente ubicación en el corazón de Montevideo.",
    url: "propiedad/tres-cruces/apartamento-1-dormitorio-alquiler/index.html",
    image: "assets/properties/tres-cruces-apartamento-18000/foto-1.jpeg"
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
    'capurro': ['capurro'],
    'aguada': ['aguada'],
    'la-blanqueada': ['la blanqueada', 'blanqueada'],
    'barrio-sur': ['barrio sur']
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
      
      // 📊 Registrar búsqueda en analytics (n8n)
      await logSearchAnalytics(query, params, results.length);
      
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
