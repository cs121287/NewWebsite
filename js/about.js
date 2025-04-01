document.addEventListener('DOMContentLoaded', () => {
  const animElements = document.querySelectorAll('.anim1');
  const borderElement = document.querySelector('.border');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1
  });

  animElements.forEach(el => observer.observe(el));
  if (borderElement) {
    observer.observe(borderElement);
  }
});