// Pequeños comportamientos: año en pie de página, togglear menú y validación simple
document.addEventListener('DOMContentLoaded', function(){
  var year = new Date().getFullYear();
  var y1 = document.getElementById('year'); if(y1) y1.textContent = year;
  var y2 = document.getElementById('year2'); if(y2) y2.textContent = year;
  var y3 = document.getElementById('year3'); if(y3) y3.textContent = year;

  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', function(){
      if(mainNav.style.display==='block') mainNav.style.display=''; else mainNav.style.display='block';
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
