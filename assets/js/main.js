const PRODUCTS_URL = 'data/products.json';
const PRODUCTS_PER_PAGE = 8;

// Utils
function createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;
}

// Retourne le nom du fichier sans extension ni dossier
function getBaseName(path) {
  if (!path || typeof path !== 'string') return '';
  return path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '');
}

// Fetch products
async function fetchProducts() {
  try {
    const res = await fetch(PRODUCTS_URL);
    if (!res.ok) throw new Error('Impossible de charger les produits.');
    return await res.json();
  } catch (err) {
    console.error(err);
    const containers = ['home-products', 'product-grid', 'product-container'];
    containers.forEach(id => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = '<p class="text-center text-danger">Erreur : impossible de charger les produits. Veuillez réessayer plus tard.</p>';
      }
    });
    return [];
  }
}

// Fonction SIMPLIFIÉE pour event listeners cards
function attachCardClickListeners() {
    const productCards = document.querySelectorAll('.card[data-product-slug]');
    
    productCards.forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', function(e) {
            if (e.target.closest('a') || e.target.closest('.btn')) return;
            const slug = this.dataset.productSlug;
            if (slug) window.location.href = `product.html?slug=${slug}`;
        });
        
        newCard.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        newCard.addEventListener('mouseup', function() {
            this.style.transform = '';
            setTimeout(() => { this.style.transition = 'box-shadow 0.3s ease'; }, 100);
        });
        newCard.addEventListener('mouseleave', function() { this.style.transform = ''; });
    });
}

// Render catalogue page
async function renderCatalogue() {
    const container = document.getElementById('product-grid');
    const filterContainer = document.getElementById('filter-container');
    const paginationContainer = document.getElementById('pagination-container');
    if (!container || !filterContainer || !paginationContainer) return;

    const products = await fetchProducts();
    if (!products.length) {
        container.innerHTML = '<p class="text-center">Aucun produit trouvé.</p>';
        return;
    }

    const categories = [...new Set(products.map(p => p.category))];
    filterContainer.innerHTML = categories.map(cat =>
        `<button class="btn filter-btn me-2 mb-2" data-category="${cat}">${cat}</button>`
    ).join('') + `<button class="btn filter-btn mb-2" data-category="all">Tous</button>`;

    let currentPage = 1;
    let filteredProducts = [...products];

    function renderPage() {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        const pageItems = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

        container.innerHTML = pageItems.map(p => `
            <div class="col">
                <div class="card h-100 shadow-sm" data-product-slug="${p.slug}">
                    <div class="card-img-wrapper">
                        <img 
                            src="assets/img/products/webp/medium/${getBaseName(p.images[0])}.webp"
                            srcset="
                                assets/img/products/webp/small/${getBaseName(p.images[0])}.webp 600w,
                                assets/img/products/webp/medium/${getBaseName(p.images[0])}.webp 1200w,
                                assets/img/products/webp/large/${getBaseName(p.images[0])}.webp 2000w
                            "
                            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            class="card-img-top"
                            alt="${p.title}"
                            loading="lazy"
                        >
                    </div>
                    ${p.isNew ? '<span class="badge badge-new">Nouveau</span>' : ''}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${p.title}</h5>
                        <p class="card-text">${p.shortDescription}</p>
                        <div class="price text-accent fw-bold">${p.price}</div>
                        <a href="product.html?slug=${p.slug}" class="btn btn-primary mt-2">Voir le produit</a>
                    </div>
                </div>
            </div>
        `).join('');

        const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
        paginationContainer.innerHTML = `
            <nav>
                <ul class="pagination justify-content-center">
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <button class="page-link prev">Précédent</button>
                    </li>
                    ${[...Array(totalPages)].map((_, i) => `
                        <li class="page-item ${currentPage === i+1 ? 'active' : ''}">
                            <button class="page-link page-btn">${i+1}</button>
                        </li>`).join('')}
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <button class="page-link next">Suivant</button>
                    </li>
                </ul>
            </nav>
        `;

        paginationContainer.querySelectorAll('.page-btn').forEach((btn, i) => {
            btn.onclick = () => { currentPage = i + 1; renderPage(); };
        });
        paginationContainer.querySelector('.prev')?.addEventListener('click', () => {
            if(currentPage > 1) { currentPage--; renderPage(); }
        });
        paginationContainer.querySelector('.next')?.addEventListener('click', () => {
            if(currentPage < totalPages) { currentPage++; renderPage(); }
        });

        attachCardClickListeners();
    }

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const cat = this.dataset.category;
            filteredProducts = cat === 'all' ? [...products] : products.filter(p => p.category === cat);
            currentPage = 1;
            renderPage();
        });
    });

    filterContainer.querySelector('[data-category="all"]').classList.add('active');
    renderPage();
}


/// Render product page
async function renderProduct() {
    const container = document.getElementById('product-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        container.innerHTML = '<p class="text-center">Produit introuvable.</p>';
        return;
    }

    const products = await fetchProducts();
    const product = products.find(p => p.slug === slug);

    if (!product) {
        container.innerHTML = '<p class="text-center">Produit introuvable.</p>';
        return;
    }

    container.innerHTML = `
        <div class="row g-4">
            <div class="col-md-6">
                <div id="carousel-${product.slug}" class="carousel slide" data-bs-ride="carousel" role="region" aria-label="Galerie d'images du produit">
                    <div class="carousel-inner">
                    ${product.images.map((img, i) => `
                        <div class="carousel-item ${i===0?'active':''}">
                        <img
                            src="assets/img/products/webp/medium/${getBaseName(img)}.webp"
                            class="product-carousel-img"
                            alt="${product.title} - Image ${i+1}"
                            loading="lazy"
                        >
                        </div>
                    `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${product.slug}" data-bs-slide="prev" aria-label="Image précédente">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel-${product.slug}" data-bs-slide="next" aria-label="Image suivante">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    </button>
                </div>
                <div class="thumbnails-container mt-3" role="navigation" aria-label="Miniatures de navigation">
                    <button class="thumb-nav prev" aria-label="Faire défiler les miniatures vers la gauche">&lt;</button>
                    <div class="thumbnails-wrapper">
                    ${product.images.map((img, i) => `
                        <img class="thumbnail ${i===0?'active':''}"
                            src="assets/img/products/webp/small/${getBaseName(img)}.webp"
                            data-bs-target="#carousel-${product.slug}"
                            data-bs-slide-to="${i}"
                            alt="Miniature ${i+1} pour ${product.title}"
                            role="button"
                            tabindex="0">
                    `).join('')}
                    </div>
                    <button class="thumb-nav next" aria-label="Faire défiler les miniatures vers la droite">&gt;</button>
                </div>
            </div>

            <div class="col-md-6">
                <h2>${product.title}</h2>
                <p>${product.description}</p>
                <ul>
                    <li><strong>Matériaux :</strong> ${product.materials.join(', ')}</li>
                    <li><strong>Dimensions :</strong> ${product.dimensions}</li>
                    <li><strong>Personnalisation :</strong> ${product.customizationOptions.join(', ')}</li>
                </ul>
                <p class="price text-accent fw-bold fs-3">${product.price}</p>
                <a href="mailto:contact@lescadeauxdenico.fr?subject=Personnalisation ${encodeURIComponent(product.title)}" 
                   class="btn btn-primary btn-lg w-100">
                   <i class="fas fa-envelope me-2"></i> Nous contacter pour personnaliser
                </a>
            </div>
        </div>
    `;

    // Initialiser le carousel Bootstrap
    const carouselEl = document.getElementById(`carousel-${product.slug}`);
    const carouselInstance = new bootstrap.Carousel(carouselEl);

    // Gestion miniatures
    const thumbnailsWrapper = container.querySelector('.thumbnails-wrapper');
    const thumbPrev = container.querySelector('.thumb-nav.prev');
    const thumbNext = container.querySelector('.thumb-nav.next');
    const thumbnails = container.querySelectorAll('.thumbnail');
    const scrollAmount = 80; // largeur approx d'une miniature + gap

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            const index = parseInt(thumb.dataset.bsSlideTo, 10);
            carouselInstance.to(index);

            // Centrer la miniature active dans le bandeau
            const wrapperWidth = thumbnailsWrapper.offsetWidth;
            const thumbWidth = thumb.offsetWidth;
            const scrollLeft = thumb.offsetLeft - (wrapperWidth / 2) + (thumbWidth / 2);
            thumbnailsWrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        });
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            thumb.click();
            }
        });
    });

    // Flèches bandeau
    thumbPrev.addEventListener('click', () => {
        thumbnailsWrapper.scrollBy({ left: -scrollAmount*3, behavior: 'smooth' });
    });
    thumbNext.addEventListener('click', () => {
        thumbnailsWrapper.scrollBy({ left: scrollAmount*3, behavior: 'smooth' });
    });
}


// Render home best-sellers - AVEC WRAPPER ZOOM ✅
async function renderHome() {
    const container = document.getElementById('home-products');
    if (!container) return;
    
    const products = await fetchProducts();
    if (!products.length) {
        container.innerHTML = '<p class="text-center">Aucun produit à afficher.</p>';
        return;
    }
    
    const bestsellers = products.filter(p => p.isBestseller).slice(0, 6) || products.slice(0, 6);
    
    container.innerHTML = bestsellers.map(p => `
        <div class="col-lg-4 col-md-6">
            <div class="card h-100" data-product-slug="${p.slug}">
                <div class="card-img-wrapper">
                    <img
                        src="assets/img/products/webp/medium/${getBaseName(p.images[0])}.webp"
                        srcset="
                            assets/img/products/webp/small/${getBaseName(p.images[0])}.webp 600w,
                            assets/img/products/webp/medium/${getBaseName(p.images[0])}.webp 1200w,
                            assets/img/products/webp/large/${getBaseName(p.images[0])}.webp 2000w
                        "
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        class="card-img-top"
                        alt="${p.title}"
                        loading="lazy"
                    >
                </div>
                ${p.isNew ? '<span class="badge badge-new">Nouveau</span>' : ''}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${p.title}</h5>
                    <div class="mt-auto">
                        <div class="price text-accent fw-bold">${p.price}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    setTimeout(() => {
        attachCardClickListeners();
    }, 100);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('product-grid')) {
        renderCatalogue();
    } else if (document.getElementById('product-container')) {
        renderProduct();
    } else if (document.getElementById('home-products')) {
        renderHome();
    }
    
    window.addEventListener('scroll', () => {
        const backToTop = document.getElementById('back-to-top');
        if (window.scrollY > 300) {
            backToTop?.classList.add('show');
        } else {
            backToTop?.classList.remove('show');
        }
    });
});
