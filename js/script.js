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

  // Listings page: read query params and filter cards client-side
  function applyListingsFilterFromParams(){
    if(typeof window === 'undefined') return;
    var params = new URLSearchParams(window.location.search);
    var type = params.get('type') || '';
    var zone = (params.get('zone') || '').toLowerCase();
    var listings = document.getElementById('listings');
    if(!listings) return;
    var cards = Array.prototype.slice.call(listings.querySelectorAll('.card'));
    var visible = 0;
    cards.forEach(function(card){
      var ctype = (card.getAttribute('data-type') || '').toLowerCase();
      var czone = (card.getAttribute('data-zone') || '').toLowerCase();
      var title = (card.querySelector('h4') ? card.querySelector('h4').textContent : '').toLowerCase();
      var matchType = !type || (ctype === type.toLowerCase());
      var matchZone = !zone || czone.indexOf(zone) !== -1 || title.indexOf(zone) !== -1;
      if(matchType && matchZone){ card.style.display = ''; visible++; } else { card.style.display = 'none'; }
    });
    // optional: show a message when none found
    var noneMsg = document.getElementById('noResultsMsg');
    if(!noneMsg){
      noneMsg = document.createElement('p');
      noneMsg.id = 'noResultsMsg';
      noneMsg.style.color = 'var(--muted)';
      noneMsg.style.marginTop = '1rem';
      listings.parentNode.insertBefore(noneMsg, listings.nextSibling);
    }
    noneMsg.textContent = visible ? '' : 'No se encontraron propiedades para esos filtros.';
  }

  // Wire up listings search input to filter dynamically
  var listingsSearch = document.getElementById('search');
  if(listingsSearch){
    listingsSearch.addEventListener('input', function(e){
      var q = (e.target.value || '').toLowerCase();
      var listings = document.getElementById('listings'); if(!listings) return;
      var cards = Array.prototype.slice.call(listings.querySelectorAll('.card'));
      cards.forEach(function(card){
        var text = (card.textContent || '').toLowerCase();
        card.style.display = text.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  // Run filter on load for listings page
  applyListingsFilterFromParams();
});
