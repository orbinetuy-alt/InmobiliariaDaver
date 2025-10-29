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

    function closeNav(){
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded','false');
      backdrop.classList.remove('show');
      navToggle.focus();
    }

    function openNav(){
      mainNav.classList.add('open');
      navToggle.classList.add('open');
      navToggle.setAttribute('aria-expanded','true');
      backdrop.classList.add('show');
      // focus al primer enlace para accesibilidad
      var firstLink = mainNav.querySelector('a'); if(firstLink) firstLink.focus();
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
});
