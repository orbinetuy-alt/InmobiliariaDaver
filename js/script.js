// Pequeños comportamientos: año en pie de página, togglear menú y validación simple
document.addEventListener('DOMContentLoaded', function(){
  var year = new Date().getFullYear();
  var y1 = document.getElementById('year'); if(y1) y1.textContent = year;
  var y2 = document.getElementById('year2'); if(y2) y2.textContent = year;
  var y3 = document.getElementById('year3'); if(y3) y3.textContent = year;

  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    // Toggle accesible: alternamos la clase 'open' y actualizamos aria-expanded
    // Además controlamos backdrop y animación del icono
    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    var _previousFocus = null;
    var _trapHandler = null;

    function closeNav(){
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      backdrop.classList.remove('show');
      // remove focus trap
      if(_trapHandler) document.removeEventListener('keydown', _trapHandler);
      _trapHandler = null;
      // restore previous focus
      if(_previousFocus && typeof _previousFocus.focus === 'function') _previousFocus.focus(); else navToggle.focus();
      _previousFocus = null;
    }

    function openNav(){
      // save previous focused element
      _previousFocus = document.activeElement;
      mainNav.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded','true');
      backdrop.classList.add('show');
      // focus al primer enlace para accesibilidad
      var focusable = mainNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      var first = focusable.length ? focusable[0] : null;
      if(first) first.focus();

      // install simple focus trap (Tab / Shift+Tab)
      _trapHandler = function(e){
        if(e.key !== 'Tab') return;
        var focusableEls = Array.prototype.slice.call(mainNav.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'))
          .filter(function(el){ return !el.disabled && el.offsetParent !== null; });
        if(focusableEls.length === 0) return;
        var firstEl = focusableEls[0];
        var lastEl = focusableEls[focusableEls.length - 1];
        if(!e.shiftKey && document.activeElement === lastEl){
          e.preventDefault();
          firstEl.focus();
        } else if(e.shiftKey && document.activeElement === firstEl){
          e.preventDefault();
          lastEl.focus();
        }
      };
      document.addEventListener('keydown', _trapHandler);
    }

    navToggle.addEventListener('click', function(e){
      e.stopPropagation();
      if(mainNav.classList.contains('open')) closeNav(); else openNav();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && mainNav.classList.contains('open')){
        closeNav();
      }
    });

    // Cerrar al hacer click fuera del nav (mejora UX en móvil)
    backdrop.addEventListener('click', function(){
      closeNav();
    });

    // También cerrar si se hace click en un enlace del nav (usuarios móviles)
    mainNav.addEventListener('click', function(e){
      if(e.target && e.target.tagName === 'A'){
        closeNav();
      }
    });
  }

  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('name');
      var email = document.getElementById('email');
      var message = document.getElementById('message');
      var msg = document.getElementById('formMsg');

      if(!name.value.trim() || !email.value.trim() || !message.value.trim()){
        msg.textContent = 'Por favor completa los campos obligatorios.';
        msg.style.color = 'crimson';
        return;
      }

      // En una implementación real, aquí harías fetch a un endpoint.
      msg.textContent = 'Gracias — tu mensaje ha sido enviado (simulado).';
      msg.style.color = 'green';
      form.reset();
    });
  }

  // Hero search form: build query and navigate to listings.html
  var siteSearch = document.getElementById('siteSearchForm');
  if(siteSearch){
    siteSearch.addEventListener('submit', function(e){
      e.preventDefault();
      var type = document.getElementById('searchType').value || '';
      var zone = document.getElementById('searchZone').value.trim() || '';
      var params = new URLSearchParams();
      if(type) params.set('type', type);
      if(zone) params.set('zone', zone);
      var url = 'listings.html' + (params.toString() ? ('?' + params.toString()) : '');
      window.location.href = url;
    });
  }

  // Listings page: Filter properties by category, zone and search
  var listings = document.getElementById('listings');
  var listingTitle = document.getElementById('listingTitle');
  var resultsCount = document.getElementById('resultsCount');
  var categorySelect = document.getElementById('category');
  var zoneSelect = document.getElementById('zone');
  var searchInput = document.getElementById('search');

  function getListingCards(){
    return listings ? Array.prototype.slice.call(listings.querySelectorAll('.card')) : [];
  }

  function updateResults(cards, filtered){
    var visible = filtered.filter(function(isVisible){ return isVisible; }).length;
    if(resultsCount){
      resultsCount.textContent = 'Mostrando ' + visible + ' propiedade' + (visible === 1 ? '' : 's');
    }

    // Update title based on filters
    if(listingTitle){
      var category = categorySelect ? categorySelect.value : '';
      var zone = zoneSelect ? zoneSelect.value : '';
      
      var title = '';
      if(category){
        title += {
          'casa': 'Casas',
          'apartamento': 'Apartamentos',
          'local': 'Locales',
          'terreno': 'Terrenos',
          'oficina': 'Oficinas'
        }[category] || 'Propiedades';
      } else {
        title = 'Todas las propiedades';
      }

      if(zone){
        title += ' en ' + zone.charAt(0).toUpperCase() + zone.slice(1);
      }

      listingTitle.textContent = title;
    }

    // Show/hide cards with animación
    cards.forEach(function(card, i){
      if (filtered[i]) {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
        card.style.display = '';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(10px)';
        setTimeout(function() {
          if (!filtered[i]) { // verificamos de nuevo por si cambió
            card.style.display = 'none';
          }
        }, 300);
      }
    });
  }

  function applyFilters(){
    var cards = getListingCards();
    if(!cards.length) return;

    var category = (categorySelect ? categorySelect.value : '').toLowerCase();
    var zone = (zoneSelect ? zoneSelect.value : '').toLowerCase();
    var search = (searchInput ? searchInput.value : '').toLowerCase();

    var filtered = cards.map(function(card){
      var cardType = (card.getAttribute('data-type') || '').toLowerCase();
      var cardZone = (card.getAttribute('data-zone') || '').toLowerCase();
      var cardContent = card.textContent.toLowerCase();
      
      var matchCategory = !category || cardType === category;
      var matchZone = !zone || cardZone === zone;
      var matchSearch = !search || cardContent.indexOf(search) !== -1;

      return matchCategory && matchZone && matchSearch;
    });

    updateResults(cards, filtered);

    // Update URL without reloading
    var params = new URLSearchParams();
    if(category) params.set('type', category);
    if(zone) params.set('zone', zone);
    if(search) params.set('q', search);
    
    var newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  // Highlight active filters
  function updateFilterHighlights() {
    var filterBar = document.querySelector('.filter-bar');
    if (!filterBar) return;

    // Primero removemos todas las clases active
    filterBar.classList.remove('active');
    filterBar.querySelectorAll('.filter-group').forEach(function(group) {
      group.classList.remove('active');
    });

    // Verificamos si algún filtro está activo
    var hasActiveFilter = false;

    document.querySelectorAll('.filter-select').forEach(function(select) {
      var group = select.closest('.filter-group');
      if (select.value) {
        group.classList.add('active');
        hasActiveFilter = true;
      }
    });

    // Si hay algún filtro activo, destacamos toda la barra
    if (hasActiveFilter) {
      filterBar.classList.add('active');
    }
  }

  // Wire up filter change handlers
  function handleFilterChange(e) {
    applyFilters();
    updateFilterHighlights();
  }

  if(categorySelect) categorySelect.addEventListener('change', handleFilterChange);
  if(zoneSelect) zoneSelect.addEventListener('change', handleFilterChange);
  if(searchInput) searchInput.addEventListener('input', handleFilterChange);
  
  // Añadir animación suave al cambiar filtros
  document.querySelectorAll('.card').forEach(function(card) {
    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  });

  // Apply filters from URL on load
  function applyFiltersFromUrl(){
    var params = new URLSearchParams(window.location.search);
    var type = params.get('type');
    var zone = params.get('zone');
    var q = params.get('q');

    if(categorySelect && type) categorySelect.value = type;
    if(zoneSelect && zone) zoneSelect.value = zone;
    if(searchInput && q) searchInput.value = q;

    applyFilters();
  }

  // Run filter on load for listings page
  if(listings) applyFiltersFromUrl();

  // Property page: gallery lightbox and contact form
  var galleryGrid = document.querySelector('.gallery-grid');
  if(galleryGrid){
    // Create lightbox elements
    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:1000;padding:2rem;';
    
    var lightboxImg = document.createElement('img');
    lightboxImg.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);';
    lightbox.appendChild(lightboxImg);
    
    var closeLightbox = document.createElement('button');
    closeLightbox.innerHTML = '×';
    closeLightbox.style.cssText = 'position:absolute;top:1rem;right:1rem;background:none;border:none;color:white;font-size:2rem;cursor:pointer;';
    lightbox.appendChild(closeLightbox);
    
    document.body.appendChild(lightbox);

    // Handle gallery clicks
    galleryGrid.addEventListener('click', function(e){
      var img = e.target.closest('img');
      if(!img) return;
      
      lightboxImg.src = img.src;
      lightbox.style.display = 'block';
      document.body.style.overflow = 'hidden';
    });

    // Close lightbox handlers
    function closeLightboxFn(){
      lightbox.style.display = 'none';
      document.body.style.overflow = '';
    }
    
    closeLightbox.addEventListener('click', closeLightboxFn);
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox) closeLightboxFn();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && lightbox.style.display === 'block') closeLightboxFn();
    });
  }

  // Property contact form
  var propertyForm = document.getElementById('propertyContactForm');
  if(propertyForm){
    propertyForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = this.querySelector('[name="name"]');
      var email = this.querySelector('[name="email"]');
      var phone = this.querySelector('[name="phone"]');
      var message = this.querySelector('[name="message"]');
      var msg = document.getElementById('formMsg');

      if(!name.value.trim() || !email.value.trim() || !message.value.trim()){
        msg.textContent = 'Por favor completa los campos obligatorios.';
        msg.style.color = 'crimson';
        return;
      }

      // Simulamos envío exitoso (en producción harías fetch a un endpoint)
      msg.textContent = 'Gracias — tu consulta ha sido enviada (simulado).';
      msg.style.color = 'green';
      this.reset();
    });
  }
});
