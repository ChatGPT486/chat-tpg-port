// ============================================================
//  CHAT TPG PORTFOLIO — app.js
// ============================================================

const catLabels = {
  graphics: 'Graphics Design',
  web:      'Full Stack Development',
  video:    'Video Editing',
  android:  'Android Development',
};

let portfolioItems = [];
let activeFilter   = 'all';
let stagedFiles    = [];
let lightboxItems  = [];
let lightboxIndex  = 0;

// ── ADMIN SESSION ────────────────────────────────────────────
let adminPassword = null;
let isAdmin = false;

function promptAdmin() {
  const pw = prompt('Enter admin password:');
  if (!pw) return false;
  adminPassword = pw;
  isAdmin = true;
  return true;
}

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initCursorTrail();
  initNav();
  initScrollAnimations();
  initCounters();
  initStatBars();
  initFilterTabs();
  initUploadModal();
  initLightbox();
  initWordCycle();
  initHeroParticles();
  initSkillCardGlow();
  loadPortfolio();
});

// ── CURSOR ──────────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursor-dot');
  if (!cursor || !dot) return;
  let mx = 0, my = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });

  (function animate() {
    cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(animate);
  })();

  document.querySelectorAll('a, button, .skill-card, .work-item, .role-pill, .tool-item, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
}

// ── CURSOR TRAIL (subtle gold particle trail) ─────────────────
function initCursorTrail() {
  const container = document.getElementById('cursor-trail');
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch devices

  let last = 0;
  document.addEventListener('mousemove', e => {
    const now = performance.now();
    if (now - last < 45) return; // throttle
    last = now;
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = e.clientX + 'px';
    dot.style.top  = e.clientY + 'px';
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  });
}

// ── NAV ─────────────────────────────────────────────────────
function initNav() {
  const nav        = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60));
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
}
window.closeMobile = () => {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobile-menu').classList.remove('open');
};

// ── SCROLL ANIMATIONS ────────────────────────────────────────
function initScrollAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 90);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

// ── COUNTERS ─────────────────────────────────────────────────
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num[data-target]').forEach(el => obs.observe(el));
}
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const start  = performance.now();
  (function update(now) {
    const p = Math.min((now - start) / 1600, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * target) + (target === 100 ? '%' : target === 50 ? '+' : '');
    if (p < 1) requestAnimationFrame(update);
  })(start);
}

// ── STAT BARS (fill on visible) ───────────────────────────────
function initStatBars() {
  const boxes = document.querySelectorAll('.stat-box');
  if (!boxes.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  boxes.forEach(el => obs.observe(el));
}

// ── WORD CYCLE (hero tagline) ─────────────────────────────────
function initWordCycle() {
  const el = document.getElementById('word-cycle');
  if (!el) return;
  const words = ['ideas', 'pixels', 'stories', 'code', 'worlds'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % words.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = words[i];
      el.style.opacity = '1';
    }, 250);
  }, 2600);
  el.style.transition = 'opacity 0.25s ease';
}

// ── HERO PARTICLE CANVAS ───────────────────────────────────────
function initHeroParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('section-hero');
  let particles = [];
  let w, h;

  function resize() {
    w = canvas.width  = hero.offsetWidth;
    h = canvas.height = hero.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = Math.min(70, Math.floor((w * h) / 18000));
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      o: Math.random() * 0.5 + 0.15,
    });
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#c9a84c';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.globalAlpha = p.o;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
}

// ── SKILL CARD MAGNETIC GLOW ───────────────────────────────────
function initSkillCardGlow() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
}

// ── FILTER TABS ──────────────────────────────────────────────
function initFilterTabs() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderWork();
    });
  });
}

// ── LOAD PORTFOLIO FROM API ──────────────────────────────────
async function loadPortfolio() {
  setEmptyText('Loading portfolio...');
  try {
    const res  = await fetch('/api/portfolio');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    portfolioItems = data.items || [];
    renderWork();
  } catch (err) {
    console.error(err);
    setEmptyText('Could not load portfolio. Check your API configuration.');
  }
}

function setEmptyText(msg) {
  const el = document.getElementById('empty-text');
  if (el) el.textContent = msg;
}

// ── RENDER WORK GRID ─────────────────────────────────────────
function renderWork() {
  const grid  = document.getElementById('work-grid');
  const empty = document.getElementById('work-empty');

  const visible = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  grid.querySelectorAll('.work-item').forEach(el => el.remove());

  if (visible.length === 0) {
    empty.style.display = 'block';
    setEmptyText(portfolioItems.length === 0
      ? 'No work uploaded yet. Click "Upload Work" to add your flyers, videos & projects.'
      : 'No work in this category yet.');
    return;
  }

  empty.style.display = 'none';

  visible.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'work-item fade-up';
    div.dataset.id = item.id;

    const isVideo = item.resourceType === 'video';
    let mediaEl = isVideo
      ? `<img src="${item.thumbnailUrl}" alt="${item.title}" loading="lazy" />`
      : `<img src="${item.url}" alt="${item.title}" loading="lazy" />`;

    div.innerHTML = `
      ${mediaEl}
      ${isVideo ? '<div class="play-badge">▶</div>' : ''}
      <div class="work-overlay">
        <p class="work-cat">${catLabels[item.category] || item.category}</p>
        <h3 class="work-title">${item.title}</h3>
        ${item.description ? `<p class="work-desc">${item.description}</p>` : ''}
      </div>
      <button class="work-delete" title="Remove" onclick="deleteItem('${item.id}', '${item.resourceType}', event)">✕</button>
    `;

    div.addEventListener('click', e => {
      if (e.target.closest('.work-delete')) return;
      openLightbox(item.id, visible);
    });

    grid.appendChild(div);
    setTimeout(() => div.classList.add('visible'), index * 60 + 50);
  });
}

// ── DELETE ───────────────────────────────────────────────────
window.deleteItem = async function(id, resourceType, e) {
  e.stopPropagation();
  if (!isAdmin) { if (!promptAdmin()) return; }
  if (!confirm('Remove this item from your portfolio?')) return;
  try {
    const res = await fetch('/api/portfolio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, resourceType, adminPassword }),
    });
    if (!res.ok) throw new Error('Delete failed');
    portfolioItems = portfolioItems.filter(item => item.id !== id);
    renderWork();
  } catch (err) {
    alert('Could not delete item: ' + err.message);
  }
};

// ── UPLOAD MODAL ─────────────────────────────────────────────
function initUploadModal() {
  const modal      = document.getElementById('upload-modal');
  const openBtn    = document.getElementById('open-upload-btn');
  const closeBtn   = document.getElementById('modal-close');
  const fileInput  = document.getElementById('file-input');
  const uploadZone = document.getElementById('upload-zone');
  const submitBtn  = document.getElementById('submit-upload');
  const previewEl  = document.getElementById('modal-preview');
  const progressWrap = document.getElementById('upload-progress');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  openBtn.addEventListener('click', () => {
    if (!isAdmin) { if (!promptAdmin()) return; }
    modal.classList.add('open');
  });
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  fileInput.addEventListener('change', e => handleFiles(Array.from(e.target.files)));

  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => {
    e.preventDefault(); uploadZone.classList.remove('dragover');
    handleFiles(Array.from(e.dataTransfer.files));
  });

  function handleFiles(files) {
    stagedFiles = files;
    previewEl.innerHTML = '';
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        if (file.type.startsWith('image/')) {
          const img = document.createElement('img');
          img.src = e.target.result; img.className = 'preview-thumb';
          previewEl.appendChild(img);
        } else {
          const div = document.createElement('div');
          div.className = 'preview-thumb';
          div.style.cssText = 'background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:28px;';
          div.textContent = file.type.startsWith('video/') ? '🎬' : '📄';
          previewEl.appendChild(div);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  submitBtn.addEventListener('click', async () => {
    const title    = document.getElementById('project-title').value.trim() || 'Untitled Project';
    const category = document.getElementById('project-category').value;
    const desc     = document.getElementById('project-desc').value.trim();

    if (stagedFiles.length === 0) { alert('Please select at least one file.'); return; }

    submitBtn.disabled = true;
    progressWrap.style.display = 'block';

    const total = stagedFiles.length;
    let done = 0;

    for (const file of stagedFiles) {
      progressText.textContent = `Uploading ${done + 1} of ${total}...`;
      progressFill.style.width = Math.round((done / total) * 100) + '%';

      try {
        const dataUrl = await fileToBase64(file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataUrl,
            title,
            category,
            description: desc,
            fileType: file.type,
            adminPassword,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Upload failed');
        }

        const item = await res.json();
        portfolioItems.unshift(item);
        done++;
        progressFill.style.width = Math.round((done / total) * 100) + '%';

      } catch (err) {
        alert(`Failed to upload "${file.name}": ${err.message}`);
      }
    }

    progressText.textContent = 'Done!';
    setTimeout(() => {
      renderWork();
      closeModal();
    }, 600);
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function closeModal() {
    modal.classList.remove('open');
    submitBtn.disabled = false;
    progressWrap.style.display = 'none';
    progressFill.style.width = '0%';
    document.getElementById('project-title').value = '';
    document.getElementById('project-desc').value = '';
    document.getElementById('project-category').value = 'graphics';
    document.getElementById('modal-preview').innerHTML = '';
    stagedFiles = [];
    fileInput.value = '';
  }
}

// ── LIGHTBOX ─────────────────────────────────────────────────
function initLightbox() {
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => navigateLightbox(1));
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigateLightbox(-1);
    if (e.key === 'ArrowRight')  navigateLightbox(1);
  });
}

function openLightbox(id, items) {
  lightboxItems = items;
  lightboxIndex = items.findIndex(item => item.id === id);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderLightboxItem();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('lightbox-content').innerHTML = '';
}

function navigateLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
  renderLightboxItem();
}

function renderLightboxItem() {
  const item    = lightboxItems[lightboxIndex];
  const content = document.getElementById('lightbox-content');
  const info    = document.getElementById('lightbox-info');
  content.innerHTML = '';

  if (item.resourceType === 'video') {
    const vid = document.createElement('video');
    vid.src = item.url; vid.controls = true; vid.autoplay = true;
    content.appendChild(vid);
  } else {
    const img = document.createElement('img');
    img.src = item.url; img.alt = item.title;
    content.appendChild(img);
  }

  info.innerHTML = `
    <p class="lb-cat">${catLabels[item.category] || item.category}</p>
    <h3 class="lb-title">${item.title}</h3>
    ${item.description ? `<p class="lb-desc">${item.description}</p>` : ''}
  `;

  const showNav = lightboxItems.length > 1;
  document.getElementById('lightbox-prev').style.display = showNav ? 'flex' : 'none';
  document.getElementById('lightbox-next').style.display = showNav ? 'flex' : 'none';
}
