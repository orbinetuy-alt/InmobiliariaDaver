/**
 * Script de diagnóstico para el buscador IA
 * Copia y pega este código en la consola del navegador (F12) para verificar la configuración
 */

console.log('🔍 Diagnóstico del Buscador IA\n' + '='.repeat(50));

// 1. Verificar que config.js está cargado
console.log('\n1️⃣ Verificando configuración...');
if (typeof window.OPENAI_CONFIG !== 'undefined') {
  console.log('✅ window.OPENAI_CONFIG existe');
  
  if (window.OPENAI_CONFIG.apiKey) {
    const key = window.OPENAI_CONFIG.apiKey;
    console.log(`✅ API Key configurada (${key.substring(0, 10)}...)`);
    
    if (key.startsWith('sk-')) {
      console.log('✅ Formato de API key correcto');
    } else {
      console.warn('⚠️ La API key no tiene el formato esperado (debe empezar con "sk-")');
    }
  } else {
    console.error('❌ API Key no configurada en OPENAI_CONFIG');
  }
} else {
  console.error('❌ window.OPENAI_CONFIG no está definido');
  console.log('\n📝 Solución:');
  console.log('1. Copia js/config.example.js a js/config.js');
  console.log('2. Edita js/config.js y agrega tu API key de OpenAI');
  console.log('3. Recarga la página');
}

// 2. Verificar que los scripts están cargados
console.log('\n2️⃣ Verificando scripts...');
if (typeof interpretSearchWithAI === 'function') {
  console.log('✅ ai-search.js cargado correctamente');
} else {
  console.error('❌ ai-search.js no está cargado o tiene errores');
}

// 3. Verificar elementos del DOM
console.log('\n3️⃣ Verificando elementos del DOM...');
const elements = {
  'Formulario de búsqueda': 'aiSearchForm',
  'Input de búsqueda': 'aiSearchInput',
  'Loading indicator': 'aiSearchLoading'
};

for (const [name, id] of Object.entries(elements)) {
  const el = document.getElementById(id);
  if (el) {
    console.log(`✅ ${name} encontrado`);
  } else {
    console.error(`❌ ${name} (id="${id}") no encontrado`);
  }
}

// 4. Verificar base de datos de propiedades
console.log('\n4️⃣ Verificando datos...');
if (typeof properties !== 'undefined') {
  console.log(`✅ Base de datos cargada: ${properties.length} propiedades`);
  console.log('   Propiedades disponibles:');
  const summary = properties.reduce((acc, prop) => {
    acc[prop.type] = (acc[prop.type] || 0) + 1;
    return acc;
  }, {});
  for (const [type, count] of Object.entries(summary)) {
    console.log(`   - ${type}: ${count}`);
  }
} else {
  console.error('❌ Base de datos de propiedades no cargada');
}

// 5. Test rápido de búsqueda simple
console.log('\n5️⃣ Prueba de búsqueda simple...');
if (typeof extractParametersSimple === 'function') {
  try {
    const testQuery = "casa en Pocitos";
    const result = extractParametersSimple(testQuery);
    console.log('✅ Búsqueda simple funciona');
    console.log(`   Query: "${testQuery}"`);
    console.log('   Resultado:', result);
  } catch (error) {
    console.error('❌ Error en búsqueda simple:', error);
  }
} else {
  console.error('❌ Función extractParametersSimple no disponible');
}

// 6. Verificar sessionStorage
console.log('\n6️⃣ Verificando sessionStorage...');
const savedQuery = sessionStorage.getItem('aiSearchQuery');
if (savedQuery) {
  console.log(`ℹ️ Búsqueda anterior guardada: "${savedQuery}"`);
  const savedResults = JSON.parse(sessionStorage.getItem('aiSearchResults') || '[]');
  console.log(`   Resultados: ${savedResults.length} propiedades`);
} else {
  console.log('ℹ️ No hay búsquedas anteriores guardadas');
}

// 7. Resumen y próximos pasos
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DEL DIAGNÓSTICO\n');

if (typeof window.OPENAI_CONFIG === 'undefined' || !window.OPENAI_CONFIG.apiKey) {
  console.log('🔴 PROBLEMA: API key no configurada');
  console.log('\n📝 Para solucionar:');
  console.log('1. En la terminal, ejecuta:');
  console.log('   cp js/config.example.js js/config.js');
  console.log('\n2. Edita js/config.js y pega tu API key:');
  console.log('   window.OPENAI_CONFIG = {');
  console.log('     apiKey: "tu-api-key-aqui"');
  console.log('   };');
  console.log('\n3. Obtén tu API key en: https://platform.openai.com/api-keys');
  console.log('\n4. Recarga la página');
} else {
  console.log('🟢 Todo listo para usar el buscador IA!');
  console.log('\n🎯 Prueba búsquedas como:');
  console.log('   • "casa en Pocitos por menos de 200 mil"');
  console.log('   • "apartamento 2 dormitorios cerca del mar"');
  console.log('   • "oficina en centro"');
}

console.log('\n' + '='.repeat(50));
