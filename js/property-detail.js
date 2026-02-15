import { getPropertyById, formatPrice } from './firebase-loader.js';

// Obtener el ID de la propiedad de la URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

// Elementos del DOM
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const propertyContent = document.getElementById('propertyContent');

// Cargar propiedad
async function loadProperty() {
  if (!propertyId) {
    showError();
    return;
  }

  try {
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      showError();
      return;
    }

    renderProperty(property);
  } catch (error) {
    console.error('Error al cargar propiedad:', error);
    showError();
  }
}

// Renderizar propiedad
function renderProperty(property) {
  // Actualizar título y meta
  const operationType = property.operation === 'venta' ? 'Venta' : 'Alquiler';
  const title = `${property.title} - ${operationType} | Daver Inmobiliaria`;
  document.getElementById('pageTitle').textContent = title;
  document.title = title;
  document.getElementById('pageDescription').content = property.description?.substring(0, 160) || property.title;

  // Header con imagen de fondo
  const propertyHeader = document.querySelector('.property-detail .property-header');
  if (property.images && property.images.length > 0) {
    // NO aplicar background directamente - usar CSS custom property para ::before
    propertyHeader.style.setProperty('--property-bg-image', `url('${property.images[0]}')`);
  }

  // Tipo de propiedad
  document.getElementById('propertyType').textContent = capitalizeFirst(property.type);

  // Título y ubicación
  document.getElementById('propertyTitle').textContent = property.title;
  const neighborhoodCapitalized = property.neighborhood
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  document.getElementById('propertyAddress').textContent = `${neighborhoodCapitalized}, Montevideo`;

  // Precio y operación
  document.getElementById('operationLabel').textContent = capitalizeFirst(property.operation);
  document.getElementById('propertyPrice').textContent = formatPrice(property.price, property.currency);
  
  // Gastos comunes (si existen)
  const commonExpensesElement = document.getElementById('commonExpenses');
  if (property.commonExpenses && property.commonExpenses > 0) {
    commonExpensesElement.textContent = `+ ${formatPrice(property.commonExpenses, property.currency)} GC`;
    commonExpensesElement.style.display = 'inline';
  } else {
    commonExpensesElement.style.display = 'none';
  }

  // Imagen principal
  if (property.images && property.images.length > 0) {
    document.getElementById('mainPropertyImage').src = property.images[0];
    document.getElementById('mainPropertyImage').alt = property.title;
    
    // Configurar array de imágenes para la galería (usado por script.js)
    window.propertyGalleryImages = property.images;
    
    // Inicializar galería después de establecer las imágenes
    setTimeout(() => initGallery(), 100);
  }

  // Features grid
  const featuresGrid = [];
  
  if (property.bedrooms) {
    featuresGrid.push({
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>`,
      label: 'Dormitorios',
      value: property.bedrooms
    });
  }
  
  if (property.bathrooms) {
    featuresGrid.push({
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12h-3m3 0v7h-18v-7M21 12V5h-18v7m18 0h-18"/>
      </svg>`,
      label: 'Baños',
      value: property.bathrooms
    });
  }
  
  if (property.area) {
    featuresGrid.push({
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h16v16H4z"/>
      </svg>`,
      label: 'Superficie',
      value: `${property.area} m²`
    });
  }
  
  if (property.garages) {
    featuresGrid.push({
      icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>`,
      label: 'Garajes',
      value: property.garages
    });
  }

  document.getElementById('featuresGrid').innerHTML = featuresGrid.map(f => `
    <div class="feature-item">
      ${f.icon}
      <div>
        <strong>${f.label}</strong>
        <span>${f.value}</span>
      </div>
    </div>
  `).join('');

  // Descripción
  const description = document.getElementById('propertyDescription');
  const descriptionText = property.description || 'Sin descripción disponible.';
  const paragraphs = descriptionText.split('\n\n').filter(p => p.trim());
  description.innerHTML = paragraphs.map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

  // Mapa
  if (property.latitude && property.longitude) {
    document.getElementById('mapSection').style.display = 'block';
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.innerHTML = `
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3271.4!2d${property.longitude}!3d${property.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${property.latitude}%2C${property.longitude}!5e0!3m2!1ses!2suy!4v1699000000000!5m2!1ses!2suy"
        width="100%"
        height="400"
        style="border:0; border-radius: 8px;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Ubicación de la propiedad">
      </iframe>
    `;
  }

  // Actualizar formulario
  document.getElementById('formSubject').value = `Consulta por ${property.title} (ID: ${property.id})`;

  // Mostrar contenido
  loadingState.style.display = 'none';
  propertyContent.style.display = 'block';
}

// Mostrar error
function showError() {
  loadingState.style.display = 'none';
  errorState.style.display = 'block';
}

// Función auxiliar
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Cargar al iniciar
loadProperty();

// Manejar formulario de contacto
document.getElementById('propertyContactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formMsg = document.getElementById('formMsg');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  
  // Aquí deberías integrar con tu servicio de email (EmailJS, Formspree, etc.)
  // Por ahora solo simulo el envío
  setTimeout(() => {
    formMsg.textContent = 'Mensaje enviado correctamente. Nos contactaremos pronto.';
    formMsg.style.color = '#27ae60';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar consulta';
    e.target.reset();
    
    setTimeout(() => {
      formMsg.textContent = '';
    }, 5000);
  }, 1500);
});

// ===========================
// LIGHTBOX GALLERY
// ===========================
// Copiado exactamente de script.js para manejar la galería de imágenes

function initGallery() {
  // Verificar si la galería ya fue inicializada (evitar duplicados)
  if (window.galleryInitialized) {
    console.log('⚠️ Galería ya inicializada, saltando...');
    return;
  }
  
  // Usar imágenes específicas de la propiedad si están definidas
  const images = window.propertyGalleryImages || [];
  
  if (images.length === 0) {
    console.log('⚠️ No hay imágenes para mostrar en la galería');
    return;
  }
  
  console.log('🖼️ Galería inicializada con', images.length, 'imágenes:', images);
  
  // Marcar como inicializada
  window.galleryInitialized = true;
  
  let currentIndex = 0;
  
  // Crear estructura del lightbox
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <div class="lightbox-counter"><span id="current">1</span> / <span id="total">${images.length}</span></div>
      <button class="lightbox-close" aria-label="Cerrar galería">&times;</button>
      <div class="lightbox-main">
        <button class="lightbox-nav prev" aria-label="Imagen anterior">‹</button>
        <img id="lightbox-img" src="${images[0]}" alt="Imagen de propiedad">
        <button class="lightbox-nav next" aria-label="Imagen siguiente">›</button>
      </div>
      <div class="lightbox-thumbnails" id="thumbnails"></div>
    </div>
  `;
  document.body.appendChild(lightbox);
  
  // Crear miniaturas
  const thumbnailsContainer = document.getElementById('thumbnails');
  images.forEach((src, index) => {
    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.alt = `Miniatura ${index + 1}`;
    thumb.className = index === 0 ? 'active' : '';
    thumb.addEventListener('click', () => showImage(index));
    thumbnailsContainer.appendChild(thumb);
  });
  
  // Agregar botón de "Ver galería" sobre la imagen principal
  const gallery = document.querySelector('.property-gallery');
  const mainImage = gallery.querySelector('.main-image');
  
  const trigger = document.createElement('button');
  trigger.className = 'gallery-trigger';
  trigger.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
    Ver galería completa
  `;
  gallery.appendChild(trigger);
  
  // Event listeners
  mainImage.addEventListener('click', openLightbox);
  trigger.addEventListener('click', openLightbox);
  
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.prev').addEventListener('click', () => navigate(-1));
  lightbox.querySelector('.next').addEventListener('click', () => navigate(1));
  
  // Cerrar al hacer clic fuera de la imagen
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        navigate(-1);
        break;
      case 'ArrowRight':
        navigate(1);
        break;
    }
  });
  
  function openLightbox() {
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    showImage(0);
  }
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  function navigate(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = images.length - 1;
    if (currentIndex >= images.length) currentIndex = 0;
    showImage(currentIndex);
  }
  
  function showImage(index) {
    currentIndex = index;
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('current');
    
    // Actualizar imagen
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = images[index];
      img.style.opacity = '1';
    }, 150);
    
    // Actualizar contador
    counter.textContent = index + 1;
    
    // Actualizar miniaturas activas
    const thumbs = thumbnailsContainer.querySelectorAll('img');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
    
    // Scroll a la miniatura activa
    const activeThumb = thumbs[index];
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }
}
