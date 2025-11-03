/**
 * AI Search Results Handler for listings.html
 * Displays search results from AI-powered search
 */

(function() {
  // Verificar si es una búsqueda IA
  const urlParams = new URLSearchParams(window.location.search);
  const isAISearch = urlParams.get('ai_search') === 'true';
  
  if (!isAISearch) return;
  
  // Obtener datos de la búsqueda
  const query = sessionStorage.getItem('aiSearchQuery');
  const params = JSON.parse(sessionStorage.getItem('aiSearchParams') || '{}');
  const results = JSON.parse(sessionStorage.getItem('aiSearchResults') || '[]');
  
  if (!query || !results) return;
  
  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', displayAIResults);
  } else {
    displayAIResults();
  }
  
  function displayAIResults() {
    // Actualizar el título de la página
    const pageTitle = document.querySelector('.listings-header h2');
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
    const listingsHeader = document.querySelector('.listings-header');
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
    const filtersSection = document.querySelector('.filters');
    if (filtersSection) {
      filtersSection.style.display = 'none';
    }
    
    // Reemplazar las tarjetas de propiedades
    const grid = document.querySelector('.listings-grid');
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
        <img src="assets/placeholder.svg" alt="${property.title}" loading="lazy">
      </div>
      <div class="card-body">
        <span class="property-type">${formatPropertyType(property.type)}</span>
        <h3 class="card-title">${property.title}</h3>
        <p class="location">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          ${property.zoneName}
        </h3>
        <div class="card-features">
          ${property.bedrooms ? `
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9v12h18V9M3 9l9-7 9 7"/>
              <path d="M9 22V12h6v10"/>
            </svg>
            ${property.bedrooms} dorm.
          </span>
          ` : ''}
          ${property.bathrooms ? `
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="3"/>
              <path d="M12 14c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z"/>
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
