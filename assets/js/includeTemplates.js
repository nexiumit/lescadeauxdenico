async function includeTemplate(id, filePath) {
  const container = document.getElementById(id);
  if (!container) return;
  try {
    const res = await fetch(filePath);
    if (!res.ok) throw new Error(`Impossible de charger ${filePath}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
  }
}

function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('#navbarNav .nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === currentPage || (currentPage === '' && href === 'index.html');
    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// Appel sur DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Inclure header et footer
  includeTemplate('header-container', 'assets/templates/header.html').then(highlightActiveNavLink);
  includeTemplate('footer-container', 'assets/templates/footer.html');
});
