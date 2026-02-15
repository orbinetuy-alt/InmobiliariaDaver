// Home Featured Properties - Carga propiedades destacadas para la página principal

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// Formatear precio
function formatPrice(price, currency = 'USD') {
  if (currency === 'USD') {
    return `USD ${new Intl.NumberFormat('es-UY').format(price)}`;
  } else {
    return `$ ${new Intl.NumberFormat('es-UY').format(price)}`;
  }
}

// Crear card HTML para propiedad
function createPropertyCard(property) {
  const mainImage = property.images && property.images[0] ? property.images[0] : 'assets/placeholder.svg';
  const operationText = property.operation === 'venta' ? 'En venta' : 'En alquiler';
  
  return `
    <article class="card">
      <div class="card-img-wrapper">
        <img src="${mainImage}" alt="${property.title}" loading="lazy" onerror="this.src='assets/placeholder.svg'">
        <span class="card-tag">${operationText}</span>
      </div>
      <div class="card-content">
        <h4>${property.title}</h4>
        <address class="card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          ${property.neighborhood}, Montevideo
        </address>
        <div class="card-features">
          ${property.bedrooms ? `
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              ${property.bedrooms} dorm
            </span>
          ` : ''}
          ${property.bathrooms ? `
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12h-3m3 0v7h-18v-7M21 12V5h-18v7m18 0h-18"/>
              </svg>
              ${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}
            </span>
          ` : ''}
          ${property.area ? `
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16v16H4z"/>
              </svg>
              ${property.area} m²
            </span>
          ` : ''}
        </div>
        <p class="price">${formatPrice(property.price, property.currency)}</p>
        <a href="property-detail.html?id=${property.id}" class="btn">Ver detalle</a>
      </div>
    </article>
  `;
}

// Cargar propiedades destacadas (últimas 3 de Firebase)
async function loadFeaturedProperties() {
  try {
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'), limit(3));
    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Renderizar propiedades SOLO si hay propiedades de Firebase
    const container = document.getElementById('featuredProperties');
    if (container && properties.length > 0) {
      // Crear cards de Firebase
      const firebaseCards = properties.map(p => createPropertyCard(p)).join('');
      
      // IMPORTANTE: Insertar AL PRINCIPIO sin borrar las existentes
      container.insertAdjacentHTML('afterbegin', firebaseCards);
      
      console.log(`✅ Agregadas ${properties.length} propiedades desde Firebase (sin eliminar las existentes)`);
    }
  } catch (error) {
    console.error('Error al cargar propiedades destacadas:', error);
  }
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadFeaturedProperties);
} else {
  loadFeaturedProperties();
}
