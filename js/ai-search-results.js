/**
 * AI Search Results Handler for listings.html
 * Displays search results from AI-powered search
 */

(function() {
  console.log('🚀 AI Search Results script cargado');
  
  // Verificar si es una búsqueda IA
  const urlParams = new URLSearchParams(window.location.search);
  const isAISearch = urlParams.get('ai_search') === 'true';
  
  console.log('🔍 ¿Es búsqueda IA?', isAISearch);
  
  if (!isAISearch) {
    console.log('⚠️ No es búsqueda IA, saliendo...');
    return;
  }
  
  // Obtener datos de la búsqueda
  const query = sessionStorage.getItem('aiSearchQuery');
  const params = JSON.parse(sessionStorage.getItem('aiSearchParams') || '{}');
  const results = JSON.parse(sessionStorage.getItem('aiSearchResults') || '[]');
  
  console.log('📦 Datos de sessionStorage:');
  console.log('  - Query:', query);
  console.log('  - Params:', params);
  console.log('  - Results:', results.length, 'propiedades');
  
  if (!query || !results) {
    console.error('❌ Faltan datos en sessionStorage');
    return;
  }
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayAIResults);
  } else {
    displayAIResults();
  }
  
  function displayAIResults() {
    console.log('📊 Mostrando resultados IA:', results.length, 'propiedades');
    console.log('🔍 Parámetros de búsqueda:', params);
    
    // Actualizar el título de la página
    const pageTitle = document.querySelector('.listing-header h2') || document.getElementById('listingTitle');
    if (pageTitle) {
      pageTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #8b5cf6;">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Resultados de búsqueda inteligente</span>
        </div>
      `;
    }
    
    // Agregar banner con la búsqueda y explicación
    const listingsHeader = document.querySelector('.listing-header');
    if (listingsHeader) {
      const banner = document.createElement('div');
      banner.className = 'ai-search-banner';
      banner.innerHTML = `
        <div class="ai-search-banner-content">
          <div class="ai-search-query">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <span>"${query}"</span>
          </div>
          ${params.explanation ? `<p class="ai-explanation">${params.explanation}</p>` : ''}
          <div class="ai-params">
            ${params.type ? `<span class="param-tag">Tipo: ${params.type}</span>` : ''}
            ${params.zone ? `<span class="param-tag">Zona: ${formatZoneName(params.zone)}</span>` : ''}
            ${params.maxPrice ? `<span class="param-tag">Hasta: $${formatPrice(params.maxPrice)}</span>` : ''}
            ${params.bedrooms ? `<span class="param-tag">${params.bedrooms} dormitorios</span>` : ''}
          </div>
          <p class="ai-results-count">
            ${results.length === 0 ? 'No se encontraron propiedades' : `Se encontraron ${results.length} propiedad${results.length !== 1 ? 'es' : ''}`}
          </p>
          <button class="btn-new-search" onclick="window.location.href='index.html'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            Nueva búsqueda
          </button>
        </div>
      `;
      
      listingsHeader.appendChild(banner);
    }
    
    // Ocultar filtros normales (ya que estamos mostrando resultados IA)
    const filtersSection = document.querySelector('.filter-bar');
    if (filtersSection) {
      filtersSection.style.display = 'none';
    }
    
    // Ocultar el selector de ordenamiento también
    const sortSection = document.querySelector('.listing-sort');
    if (sortSection) {
      sortSection.style.display = 'none';
    }
    
    // Reemplazar las tarjetas de propiedades (selector correcto)
    const grid = document.querySelector('.grid.listings') || document.getElementById('listings');
    if (grid && results.length > 0) {
      grid.innerHTML = '';
      
      results.forEach((property, index) => {
        const card = createPropertyCard(property, index + 1);
        grid.appendChild(card);
      });
    } else if (grid && results.length === 0) {
      grid.innerHTML = `
        <div class="no-results">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <h3>No se encontraron propiedades</h3>
          <p>Intenta modificar tu búsqueda o explora todas nuestras propiedades</p>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button class="btn" onclick="window.location.href='index.html'">Nueva búsqueda</button>
            <button class="btn btn-secondary" onclick="window.location.href='listings.html'">Ver todas</button>
          </div>
        </div>
      `;
    }
  }
  
  function createPropertyCard(property, rank) {
    const article = document.createElement('article');
    article.className = 'card';
    article.style.cursor = 'pointer';
    article.style.position = 'relative'; // Para el badge de ranking
    
    // Agregar data attributes como las cards originales
    article.setAttribute('data-type', property.type);
    article.setAttribute('data-zone', property.zone);
    article.setAttribute('data-operation', property.operation);
    article.setAttribute('data-bedrooms', property.bedrooms || '');
    
    // Hacer la card clicable
    article.addEventListener('click', function(e) {
      // No navegar si se hizo click en el enlace específico
      if (e.target.tagName === 'A') return;
      window.location.href = property.url;
    });
    
    // Determinar la etiqueta de operación
    const operationTag = property.operation === 'alquiler' ? 'En alquiler' : 'En venta';
    
    article.innerHTML = `
      <div class="ai-rank-badge" title="Relevancia según tu búsqueda">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        #${rank}
      </div>
      <div class="card-img-wrapper">
        <img src="${property.image || 'assets/placeholder.svg'}" alt="${property.title}" loading="lazy">
        <span class="card-tag">${operationTag}</span>
      </div>
      <div class="card-content">
        <h4>${property.title}</h4>
        <address class="card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          ${property.zoneName}
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
            ${property.bathrooms} baño${property.bathrooms !== 1 ? 's' : ''}
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
        <p class="price">${property.currency === 'USD' ? 'U$S' : '$'} ${formatPrice(property.price)}</p>
        <a href="${property.url}" class="btn">Ver detalle</a>
      </div>
    `;
    return article;
  }
  
  function formatPropertyType(type) {
    const types = {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'oficina': 'Oficina',
      'terreno': 'Terreno'
    };
    return types[type] || type;
  }
  
  function formatZoneName(zone) {
    const zones = {
      'pocitos': 'Pocitos',
      'carrasco': 'Carrasco',
      'punta-carretas': 'Punta Carretas',
      'tres-cruces': 'Tres Cruces',
      'centro': 'Centro',
      'ciudad-vieja': 'Ciudad Vieja',
      'cordon': 'Cordón',
      'palermo': 'Palermo',
      'union': 'Unión',
      'la-comercial': 'La Comercial',
      'la-figurita': 'La Figurita',
      'capurro': 'Capurro',
      'aguada': 'Aguada',
      'barrio-sur': 'Barrio Sur',
      'la-blanqueada': 'La Blanqueada'
    };
    return zones[zone] || zone;
  }
  
  function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  
  // Agregar estilos específicos para resultados IA
  const style = document.createElement('style');
  style.textContent = `
    .ai-search-banner {
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.05));
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    
    .ai-search-banner-content {
      max-width: 800px;
    }
    
    .ai-search-query {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #8b5cf6;
      margin-bottom: 1rem;
    }
    
    .ai-explanation {
      color: #6b7280;
      margin-bottom: 1rem;
      font-size: 0.95rem;
    }
    
    .ai-params {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    
    .param-tag {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 20px;
      font-size: 0.875rem;
      color: #6b7280;
    }
    
    .ai-results-count {
      color: #374151;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    
    .btn-new-search {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: white;
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 8px;
      color: #8b5cf6;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .btn-new-search:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
      transform: translateY(-2px);
    }
    
    .ai-rank-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    
    .no-results {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }
    
    .no-results svg {
      margin: 0 auto 1.5rem;
      color: #9ca3af;
    }
    
    .no-results h3 {
      color: #374151;
      margin-bottom: 0.5rem;
    }
  `;
  document.head.appendChild(style);
})();
