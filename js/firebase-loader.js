// Firebase Loader - Carga propiedades desde Firebase para mostrar en el sitio público

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

// Obtener todas las propiedades
export async function getAllProperties() {
  try {
    const propertiesRef = collection(db, 'properties');
    const q = query(propertiesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return properties;
  } catch (error) {
    console.error('Error al cargar propiedades:', error);
    return [];
  }
}

// Obtener una propiedad específica por ID
export async function getPropertyById(propertyId) {
  try {
    const docRef = doc(db, 'properties', propertyId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.error('Propiedad no encontrada');
      return null;
    }
  } catch (error) {
    console.error('Error al cargar propiedad:', error);
    return null;
  }
}

// Filtrar propiedades
export async function filterProperties(filters = {}) {
  try {
    const propertiesRef = collection(db, 'properties');
    let q = query(propertiesRef, orderBy('createdAt', 'desc'));
    
    // Aplicar filtros
    const constraints = [];
    
    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }
    
    if (filters.operation) {
      constraints.push(where('operation', '==', filters.operation));
    }
    
    if (filters.neighborhood) {
      constraints.push(where('neighborhood', '==', filters.neighborhood));
    }
    
    if (constraints.length > 0) {
      q = query(propertiesRef, ...constraints, orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    
    let properties = [];
    querySnapshot.forEach((doc) => {
      properties.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Filtros adicionales en cliente (precio, dormitorios, etc.)
    if (filters.minPrice) {
      properties = properties.filter(p => p.price >= filters.minPrice);
    }
    
    if (filters.maxPrice) {
      properties = properties.filter(p => p.price <= filters.maxPrice);
    }
    
    if (filters.minBedrooms) {
      properties = properties.filter(p => p.bedrooms >= filters.minBedrooms);
    }
    
    if (filters.minBathrooms) {
      properties = properties.filter(p => p.bathrooms >= filters.minBathrooms);
    }
    
    if (filters.minArea) {
      properties = properties.filter(p => p.area >= filters.minArea);
    }
    
    return properties;
  } catch (error) {
    console.error('Error al filtrar propiedades:', error);
    return [];
  }
}

// Formatear precio
export function formatPrice(price, currency = 'USD') {
  if (currency === 'USD') {
    return `USD ${new Intl.NumberFormat('es-UY').format(price)}`;
  } else {
    return `$ ${new Intl.NumberFormat('es-UY').format(price)}`;
  }
}

// Generar slug para URL amigable
export function generateSlug(property) {
  const neighborhood = property.neighborhood.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
  
  const type = property.type.toLowerCase();
  const operation = property.operation.toLowerCase();
  
  return `${neighborhood}-${type}-${operation}`;
}

// Crear HTML card de propiedad para listings
export function createPropertyCard(property) {
  const slug = generateSlug(property);
  const mainImage = property.images && property.images[0] ? property.images[0] : 'assets/placeholder.svg';
  const operationText = property.operation === 'venta' ? 'En venta' : 'En alquiler';
  
  return `
    <article class="card" 
             data-type="${property.type || ''}" 
             data-operation="${property.operation || ''}" 
             data-zone="${property.neighborhood || ''}" 
             data-bedrooms="${property.bedrooms || ''}"
             data-price="${property.price || 0}">
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
      </div>
    </article>
  `;
}
