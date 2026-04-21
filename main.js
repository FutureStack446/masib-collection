// Navigation script
document.addEventListener('DOMContentLoaded', function() {
  // Header Scroll Effect
  const header = document.querySelector('.top-header');
  const scrollTopBtn = document.querySelector('.scroll-to-top');

  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }

        if (window.scrollY > 100) {
          scrollTopBtn?.classList.add('visible');
        } else {
          scrollTopBtn?.classList.remove('visible');
        }
        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // Reveal on Scroll Logic
  const revealElements = document.querySelectorAll('section, .text-box, .split-content, .reveal-title, .reveal-text, .reveal-image');
  const gridItems = document.querySelectorAll('.product-card, .step');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // Stagger children if it's a grid
        if (entry.target.classList.contains('grid-container')) {
          const items = entry.target.querySelectorAll('.stagger-item');
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('active');
            }, index * 150);
          });
        }
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });

  // Hamburger toggle behavior (supports multiple navs per page)
  document.querySelectorAll('.hamburger').forEach(function(hamburger) {
    const nav = hamburger.closest('nav');
    const navLinks = nav ? nav.querySelector('.nav-links') : null;
    if (!navLinks) return;

    function toggleMenu(forceOpen) {
      const isOpen = navLinks.classList.contains('open');
      const willOpen = typeof forceOpen === 'boolean' ? forceOpen : !isOpen;
      hamburger.setAttribute('aria-expanded', String(willOpen));
      hamburger.classList.toggle('active', willOpen);
      navLinks.classList.toggle('open', willOpen);
      document.body.style.overflow = willOpen ? 'hidden' : '';
    }

    // Click: toggle only; never prevent default for normal links
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Keyboard accessibility: Space/Enter
    hamburger.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      }
    });

    // Close when clicking a menu link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', function() {
        toggleMenu(false);
      });
    });

    // Close when clicking outside
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Accessibility: Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggleMenu(false);
      }
    });
  });

  // Handle window resize: unlock scroll if moving to desktop view
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      document.body.style.overflow = '';
      document.querySelectorAll('.nav-links').forEach(nav => nav.classList.remove('open'));
      document.querySelectorAll('.hamburger').forEach(h => h.classList.remove('active'));
    }
  });

  // Smooth scroll for in-page anchors only
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Collection Filtering Logic
  const filterButtons = document.querySelectorAll('.filter-bar .btn-secondary');
  const productCards = document.querySelectorAll('.product-card');
  const searchInput = document.getElementById('product-search');
  const noResults = document.getElementById('no-results');
  const resetBtn = document.getElementById('reset-filters');
  const sortSelect = document.getElementById('sort-products');
  const gridContainer = document.querySelector('.grid-container');

  function applyFilters() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activeBtn = document.querySelector('.filter-bar .btn-secondary.active');
    const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    let visibleCount = 0;

    productCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const category = card.getAttribute('data-category');

      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = activeFilter === 'all' || category === activeFilter;

      if (matchesSearch && matchesCategory) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle No Results Message
    if (noResults) noResults.classList.toggle('visible', visibleCount === 0);
  }

  function applySort() {
    const sortValue = sortSelect.value;
    const cardsArray = Array.from(productCards);

    if (sortValue === 'default') return;

    cardsArray.sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price-val'));
      const priceB = parseInt(b.getAttribute('data-price-val'));

      return sortValue === 'price-low' ? priceA - priceB : priceB - priceA;
    });

    // Re-append cards in new order
    cardsArray.forEach(card => gridContainer.appendChild(card));
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      applyFilters();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
      });
      applyFilters();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Product Modal Logic
  const modalRoot = document.getElementById('modal-root');
  const infoButtons = document.querySelectorAll('.info-trigger');

  infoButtons.forEach(button => {
    button.addEventListener('click', () => {
      const { title, price, desc, materials, care } = button.dataset;
      
      const modalHTML = `
        <div class="modal-backdrop">
          <div class="modal-content glass-card">
            <button class="modal-close" aria-label="Close">&times;</button>
            <div class="modal-body" style="text-align: left;">
              <h3 style="color: var(--primary); font-size: 2rem;">${title}</h3>
              <p class="modal-price" style="font-weight: 700; color: var(--primary-dark); font-size: 1.2rem;">${price}</p>
              <hr style="margin: 1.5rem 0; border: 0; border-top: 1px solid var(--glass-border);">
              
              <p><strong>Description:</strong><br>${desc}</p>
              ${materials ? `<p style="margin-top: 1rem;"><strong>Materials:</strong><br>${materials}</p>` : ''}
              ${care ? `<p style="margin-top: 1rem;"><strong>Care:</strong><br>${care}</p>` : ''}
              
              <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <a href="https://wa.me/2349130216263?text=I'm interested in the ${title}" class="btn" style="flex: 1;">Order via WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      `;

      modalRoot.innerHTML = modalHTML;
      document.body.style.overflow = 'hidden'; // Prevent scroll

      // Close Logic
      const backdrop = modalRoot.querySelector('.modal-backdrop');
      const closeBtn = modalRoot.querySelector('.modal-close');
      
      const closeModal = () => {
        modalRoot.innerHTML = '';
        document.body.style.overflow = '';
      };

      closeBtn.onclick = closeModal;
      backdrop.onclick = (e) => { if(e.target === backdrop) closeModal(); };
    });
  });

  // Contact Form Success Animation
  const contactForm = document.getElementById('premium-contact-form');
  const successOverlay = document.getElementById('form-success');

  if (contactForm && successOverlay) {
    contactForm.addEventListener('submit', function() {
      // Note: mailto: doesn't truly "submit" to a server, 
      // but we show the animation to the user.
      setTimeout(() => {
        contactForm.style.opacity = '0.1';
        successOverlay.style.display = 'flex';
      }, 500);
    });
  }
});
