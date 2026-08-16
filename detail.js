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
const img = document.querySelector('#designImage'); img.src = d.src; img.alt = d.title;
let zoom = 1; function setZoom() { img.style.transform = `scale(${zoom})`; }
document.querySelector('#zoomIn').onclick = () => { zoom = Math.min(zoom + .25, 2.5); setZoom(); };
document.querySelector('#zoomOut').onclick = () => { zoom = Math.max(zoom - .25, 1); setZoom(); };
const imageUrl = new URL(d.src, window.location.href).href;
const designPageUrl = new URL(`design.html?id=${id}`, window.location.href).href;
const message = `Hello Guddi Silai 👋\n\nMujhe is blouse design ke baare mein enquiry karni hai.\n\n🧵 Design: ${d.title}\n🆔 Design ID: ${id}\n📂 Category: ${d.category}\n🏷️ Tags: ${d.tags.join(', ')}\n� Design page: ${designPageUrl}\n\nPlease price, stitching details aur availability bataiye. Thank you.`;
const whatsappLink = `https://wa.me/9309093123?text=${encodeURIComponent(message)}`;

document.querySelector('#whatsappAction').onclick = async (event) => {
  event.preventDefault();

  const shareData = {
    title: d.title,
    text: message,
    url: designPageUrl,
  };

  const canUseShareSheet = typeof navigator !== 'undefined' && navigator.share && navigator.canShare;

  if (canUseShareSheet) {
    try {
      const response = await fetch(imageUrl, { cache: 'no-store' });
      const blob = await response.blob();
      const file = new File([blob], `${d.id}.jpg`, { type: blob.type || 'image/jpeg' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          ...shareData,
          files: [file],
        });
        return;
      }
    } catch (_) {
      // Ignore and proceed to WhatsApp fallback.
    }
  }

  window.open(whatsappLink, '_blank', 'noopener');
};

if (document.querySelector('#whatsappAction')) {
  document.querySelector('#whatsappAction').setAttribute('href', whatsappLink);
}
const save = document.querySelector('#saveDesign'), stored = new Set(JSON.parse(localStorage.getItem('guddi-silai-saved') || '[]'));
function drawSave() { save.innerHTML = stored.has(id) ? '♥ <span>Saved</span>' : '♡ <span>Save</span>'; save.classList.toggle('saved', stored.has(id)); }
drawSave(); save.onclick = e => { e.preventDefault(); stored.has(id) ? stored.delete(id) : stored.add(id); localStorage.setItem('guddi-silai-saved', JSON.stringify([...stored])); drawSave(); show(stored.has(id) ? 'Saved to your favourites ♡' : 'Removed from saved designs'); };
function show(text) { const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2200); }
document.querySelector('#shareDesign').onclick = async () => { const share = {title: d.title, text: `✨ ${d.title} — Guddi Silai`, url: location.href}; try { if (navigator.share) await navigator.share(share); else { await navigator.clipboard.writeText(location.href); show('Design link copied'); } } catch (_) {} };
