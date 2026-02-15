// Property Stats - Actualiza contadores de propiedades en index.html dinámicamente desde Firebase

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCj6nyM8iqeXLEPNp46M_j-CW7aCTYM60A",
  authDomain: "daver-inmobiliaria-65e82.firebaseapp.com",
  projectId: "daver-inmobiliaria-65e82",
  storageBucket: "daver-inmobiliaria-65e82.firebasestorage.app",
  messagingSenderId: "936144386163",
  appId: "1:936144386163:web:10b999ab6dcc9456bcd206"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener estadísticas de propiedades
export async function getPropertyStats() {
  try {
    const propertiesRef = collection(db, 'properties');
    const querySnapshot = await getDocs(propertiesRef);
    
    const stats = {
      total: 0,
      apartamento: 0,
      casa: 0,
      oficina: 0,
      terreno: 0,
      venta: 0,
      alquiler: 0
    };
    
    querySnapshot.forEach((doc) => {
      const property = doc.data();
      stats.total++;
      
      // Contar por tipo
      if (property.type) {
        const type = property.type.toLowerCase();
        if (stats[type] !== undefined) {
          stats[type]++;
        }
      }
      
      // Contar por operación
      if (property.operation) {
        const operation = property.operation.toLowerCase();
        if (stats[operation] !== undefined) {
          stats[operation]++;
        }
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
}

// Actualizar contadores en la página
export async function updatePropertyCounters() {
  const stats = await getPropertyStats();
  
  if (!stats) {
    console.error('No se pudieron cargar las estadísticas');
    return;
  }
  
  console.log('Estadísticas de propiedades:', stats);
  
  // Actualizar contadores de categorías
  updateCategoryCounter('apartamento', stats.apartamento);
  updateCategoryCounter('casa', stats.casa);
  updateCategoryCounter('oficina', stats.oficina);
  updateCategoryCounter('terreno', stats.terreno);
  
  // Actualizar contador total si existe
  const totalCounter = document.querySelector('.total-properties-count');
  if (totalCounter) {
    totalCounter.textContent = `${stats.total} ${stats.total === 1 ? 'propiedad' : 'propiedades'}`;
  }
}

// Actualizar contador de una categoría específica
function updateCategoryCounter(type, count) {
  // Buscar todas las cards de categoría
  const categoryCards = document.querySelectorAll('.category-card');
  
  categoryCards.forEach(card => {
    const href = card.getAttribute('href');
    if (href && href.includes(`type=${type}`)) {
      const countElement = card.querySelector('.cat-count');
      if (countElement) {
        countElement.textContent = `${count} ${count === 1 ? 'propiedad' : 'propiedades'}`;
      }
    }
  });
}

// Auto-ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updatePropertyCounters);
} else {
  updatePropertyCounters();
}
