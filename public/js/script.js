document.addEventListener('DOMContentLoaded', function() {
  const baseDelay = 0.1;
  const items = document.querySelectorAll('ul.stagger li');

  items.forEach((item, index) => {
    const delay = index * baseDelay;
    item.style.animationDelay = `${delay}s`;
    item.classList.add('fade-in');
  });
});