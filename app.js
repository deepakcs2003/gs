const designs = catalogData;
const buildFilterConfig = () => [
  { id: 'all', label: 'All Designs', matches: () => true },
  { id: 'saved', label: 'Saved', matches: (d) => saved.has(d.id) },
  { id: 'new-designs', label: 'New Designs', matches: (d) => d.category === 'New Designs' || /new|latest|fresh/i.test(buildDesignText(d)) },
  { id: 'trending', label: 'Trending', matches: (d) => /trending|popular|viral|designer/i.test(buildDesignText(d)) },
  { id: 'back-designs', label: 'Back Designs', matches: (d) => /back/i.test(buildDesignText(d)) },
  { id: 'front-designs', label: 'Front Designs', matches: (d) => /front/i.test(buildDesignText(d)) },
  { id: 'sleeve-designs', label: 'Sleeve Designs', matches: (d) => /sleeve/i.test(buildDesignText(d)) },
  { id: 'neck-designs', label: 'Neck Designs', matches: (d) => /neck|collar/i.test(buildDesignText(d)) },
  { id: 'bridal', label: 'Bridal', matches: (d) => /bridal|wedding/i.test(buildDesignText(d)) },
  { id: 'designer', label: 'Designer', matches: (d) => /designer/i.test(buildDesignText(d)) },
  { id: 'simple', label: 'Simple', matches: (d) => /simple|minimal|classic/i.test(buildDesignText(d)) },
  { id: 'party-wear', label: 'Party Wear', matches: (d) => /party|festive|occasion/i.test(buildDesignText(d)) },
];
const designFilters = buildFilterConfig();

let activeCat = designFilters[0].id, shown = 24;
let saved = new Set(JSON.parse(localStorage.getItem('guddi-silai-saved') || '[]'));
const grid = document.querySelector('#designGrid'), categoryList = document.querySelector('#categoryList'), toast = document.querySelector('#toast');
const filterOverlay = document.querySelector('#filterOverlay');
const filterButton = document.querySelector('#filterButton');
const filterOptions = document.querySelector('#filterOptions');
const loadSentinel = document.querySelector('#loadSentinel');

function buildDesignText(d) {
  return [d.title, d.category, d.id, ...(d.tags || []), d.desc].join(' ').toLowerCase();
}

function getActiveFilter() {
  return designFilters.find((filter) => filter.id === activeCat) || designFilters[0];
}

function setCategory(categoryId) {
  if (!designFilters.some((filter) => filter.id === categoryId)) return;
  activeCat = categoryId;
  shown = 24;
  render();
  drawCategories();
  if (filterOverlay) filterOverlay.classList.remove('open');
}

function drawCategories() {
  const filters = buildFilterConfig();

  if (categoryList) {
    categoryList.innerHTML = filters.map((filter) => `<button type="button" class="category ${filter.id === activeCat ? 'active' : ''}" data-cat="${filter.id}">${filter.label}</button>`).join('');
    categoryList.querySelectorAll('button').forEach((button) => {
      button.onclick = () => setCategory(button.dataset.cat);
    });
  }

  if (filterOptions) {
    filterOptions.innerHTML = filters.map((filter) => `<button type="button" class="filter-choice ${filter.id === activeCat ? 'active' : ''}" data-filter="${filter.id}">${filter.label}</button>`).join('');
    filterOptions.querySelectorAll('button').forEach((button) => {
      button.onclick = () => setCategory(button.dataset.filter);
    });
  }
}

function filtered() {
  const activeFilter = getActiveFilter();
  return designs.filter((design) => activeFilter.matches(design));
}

function openDesignsSection() {
  activeCat = 'all';
  shown = 24;
  drawCategories();
  render();
  location.hash = 'designs';
}

function refreshSavedFilter() {
  const savedFilter = buildFilterConfig().find((filter) => filter.id === 'saved');
  if (savedFilter) {
    savedFilter.matches = (d) => saved.has(d.id);
  }
}

function card(d) {
  return `<article class="design-card"><a class="card-open" href="design.html?id=${d.id}" aria-label="View ${d.title}"><div class="card-image"><img src="${d.src}" alt="${d.title}" loading="lazy"></div><div class="card-copy"><h3>${d.title}</h3><p>${d.category} · ${d.id}</p><span class="card-link">View design →</span></div></a><button class="heart ${saved.has(d.id) ? 'saved' : ''}" data-save="${d.id}" aria-label="Save ${d.title}">${saved.has(d.id) ? '♥' : '♡'}</button></article>`;
}

function render() {
  const list = filtered();
  const heading = document.querySelector('#designs .section-head .eyebrow');
  if (heading) heading.textContent = getActiveFilter().label.toUpperCase();

  const safeShown = Math.min(shown, list.length || shown);
  if (safeShown !== shown) shown = safeShown;

  grid.innerHTML = list.slice(0, shown).map(card).join('');
  grid.querySelectorAll('.heart').forEach((button) => {
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleSave(button.dataset.save);
    };
  });
}

function maybeLoadMoreOnScroll() {
  if (!loadSentinel) return;
  const list = filtered();
  if (shown >= list.length) return;

  const sentinelRect = loadSentinel.getBoundingClientRect();
  if (sentinelRect.top <= window.innerHeight + 220) {
    shown += 24;
    render();
  }
}

function toggleSave(id) { saved.has(id) ? saved.delete(id) : saved.add(id); localStorage.setItem('guddi-silai-saved', JSON.stringify([...saved])); refreshSavedFilter(); flash(saved.has(id) ? 'Saved to your favourites ♡' : 'Removed from saved designs'); render(); }
function flash(text) { toast.textContent = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); }

window.addEventListener('scroll', () => {
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(maybeLoadMoreOnScroll);
  } else {
    maybeLoadMoreOnScroll();
  }
}, { passive: true });

document.querySelectorAll('.whats-button').forEach((button) => {
  button.onclick = () => {
    const design = button.closest('.design-card') ? designs.find((item) => item.id === button.dataset.id) : null;
    const designPage = design ? new URL(`design.html?id=${design.id}`, window.location.href).href : '';
    const text = encodeURIComponent(
      `Hello Guddi Silai 👋\n\nMujhe blouse design ke baare mein enquiry karni hai.\n\nDesign: ${design ? design.title : 'Blouse Design'}\nDesign ID: ${design ? design.id : 'N/A'}\nCategory: ${design ? design.category : 'General'}\n\nPlease price, stitching details aur availability bataiye.\n\n${designPage}`
    );
    window.open(`https://wa.me/9309093123?text=${text}`, '_blank');
  };
});

const search = document.querySelector('#searchOverlay');
document.querySelectorAll('.search-trigger').forEach((button) => {
  button.onclick = () => {
    search.classList.add('open');
    setTimeout(() => document.querySelector('#searchInput').focus(), 100);
  };
});
document.querySelectorAll('.close').forEach((button) => {
  button.onclick = () => search.classList.remove('open');
});
document.querySelector('#searchInput').oninput = (event) => {
  const query = event.target.value.trim().toLowerCase();
  const results = designs.filter((design) => [design.title, design.category, design.id, ...(design.tags || [])].join(' ').toLowerCase().includes(query)).slice(0, 12);
  document.querySelector('#searchResults').innerHTML = query ? (results.length ? results.map((design) => `<a class="search-result" href="design.html?id=${design.id}"><b>${design.title}</b><br><small>${design.id}</small></a>`).join('') : 'No design found. Try another keyword.') : '';
};

document.querySelector('#favoritesNav').onclick = () => {
  activeCat = 'saved';
  shown = 24;
  drawCategories();
  render();
  location.hash = 'designs';
};

document.querySelectorAll('a[href="#designs"]').forEach((link) => {
  link.onclick = (event) => {
    event.preventDefault();
    openDesignsSection();
  };
});

if (filterButton && filterOverlay) {
  filterButton.onclick = () => filterOverlay.classList.add('open');
  filterOverlay.querySelector('.close-filter').onclick = () => filterOverlay.classList.remove('open');
}

document.querySelector('#viewAllCategories').onclick = () => setCategory('all');

drawCategories();
render();
