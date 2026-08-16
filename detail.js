const items = Object.fromEntries(catalogData.map(item => [item.id, item]));
const requestedId = new URLSearchParams(location.search).get('id');
const id = items[requestedId] ? requestedId : catalogData[0].id;
const d = items[id];
document.title = `${d.title} | Guddi Silai`;
document.querySelector('#designTitle').textContent = d.title;
document.querySelector('#designCategory').textContent = d.category.toUpperCase();
document.querySelector('#designId').textContent = id;
document.querySelector('#designDescription').textContent = d.desc;
document.querySelector('#designTags').innerHTML = d.tags.map(t => `<span>#${t}</span>`).join('');
const img = document.querySelector('#designImage');
const zoomArea = document.querySelector('#zoomArea');
img.src = d.src; img.alt = d.title;

let zoom = 1;
let panX = 0;
let panY = 0;
let dragging = false;
let startX = 0;
let startY = 0;
let originX = 0;
let originY = 0;

function applyImageTransform() {
  img.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
}

function setZoom(nextZoom) {
  zoom = Math.min(Math.max(nextZoom, 1), 3.5);
  applyImageTransform();
}

document.querySelector('#zoomIn').onclick = () => {
  setZoom(zoom + 0.25);
};

document.querySelector('#zoomOut').onclick = () => {
  setZoom(zoom - 0.25);
};

const dragStart = (event) => {
  if (zoom <= 1) return;
  dragging = true;
  img.classList.add('dragging');
  startX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
  startY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;
  originX = panX;
  originY = panY;
};

const dragMove = (event) => {
  if (!dragging) return;
  const currentX = event.clientX ?? event.touches?.[0]?.clientX ?? startX;
  const currentY = event.clientY ?? event.touches?.[0]?.clientY ?? startY;
  panX = originX + (currentX - startX);
  panY = originY + (currentY - startY);
  applyImageTransform();
};

const dragEnd = () => {
  if (!dragging) return;
  dragging = false;
  img.classList.remove('dragging');
};

img.addEventListener('pointerdown', dragStart);
window.addEventListener('pointermove', dragMove);
window.addEventListener('pointerup', dragEnd);
window.addEventListener('pointercancel', dragEnd);

img.addEventListener('touchstart', dragStart, { passive: true });
img.addEventListener('touchmove', dragMove, { passive: true });
img.addEventListener('touchend', dragEnd);
img.addEventListener('touchcancel', dragEnd);

const designPageUrl = new URL(`design.html?id=${id}`, window.location.href).href;
const message = `Hello Guddi Silai 👋\n\nMujhe ye blouse design pasand hai.\n\nDesign: ${d.title}\nDesign ID: ${id}\nCategory: ${d.category}\nLink: ${designPageUrl}\n\nPlease price, stitching details aur availability bataiye. Thank you.`;
const whatsappLink = `https://wa.me/9309093123?text=${encodeURIComponent(message)}`;

document.querySelector('#whatsappAction').onclick = (event) => {
  event.preventDefault();
  window.open(whatsappLink, '_blank', 'noopener');
};

document.querySelector('#whatsappAction').setAttribute('href', whatsappLink);
const save = document.querySelector('#saveDesign'), stored = new Set(JSON.parse(localStorage.getItem('guddi-silai-saved') || '[]'));
function drawSave() { save.innerHTML = stored.has(id) ? '♥ <span>Saved</span>' : '♡ <span>Save</span>'; save.classList.toggle('saved', stored.has(id)); }
drawSave(); save.onclick = e => { e.preventDefault(); stored.has(id) ? stored.delete(id) : stored.add(id); localStorage.setItem('guddi-silai-saved', JSON.stringify([...stored])); drawSave(); show(stored.has(id) ? 'Saved to your favourites ♡' : 'Removed from saved designs'); };
function show(text) { const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2200); }
document.querySelector('#shareDesign').onclick = async () => { const share = {title: d.title, text: `✨ ${d.title} — Guddi Silai`, url: location.href}; try { if (navigator.share) await navigator.share(share); else { await navigator.clipboard.writeText(location.href); show('Design link copied'); } } catch (_) {} };
