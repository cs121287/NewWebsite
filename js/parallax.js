window.addEventListener('scroll', function() {
  const video = document.querySelector('.video-background video');
  const scrollPosition = window.pageYOffset;
  
  video.style.transform = 'translateY(' + (scrollPosition * 0.5) + 'px)';
});