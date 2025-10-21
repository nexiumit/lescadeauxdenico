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

// Appel sur DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Inclure header et footer
  includeTemplate('header-container', 'assets/templates/header.html');
  includeTemplate('footer-container', 'assets/templates/footer.html');
});
