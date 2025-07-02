function animateHeader() {
    const header = document.getElementById('header');
    header.classList.add('animate');
  }
  
  function verCV() {
    window.open('pdf/Currículum_Huayta_Kevin.pdf', '_blank');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const navBar = document.getElementById('navBar');
    const carousel = document.getElementById('carousel');
  
    // Mostrar la nav-bar y el carrusel al terminar la animación del header.
    header.addEventListener('animationend', () => {
      navBar.classList.add('show');
      carousel.classList.add('show');
    });
  
    // Carrusel: cambiar slide según opción seleccionada.
    const navItems = document.querySelectorAll('.nav-bar li');
    const slides = document.querySelectorAll('.slide');
  
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remover clase active de todos los nav-items.
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
  
        // Mostrar el slide correspondiente.
        const targetId = item.getAttribute('data-slide');
        slides.forEach(slide => {
          slide.classList.remove('active');
          if (slide.id === targetId) {
            slide.classList.add('active');
          }
        });
      });
    });
  });
  
