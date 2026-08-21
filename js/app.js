let allRecipes = [];
let activeCategory = 'all';
let activeLang = 'all';
let searchQuery = '';

const SOCIAL_ICONS = {
  instagram: {
    label: 'Instagram',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg>'
  },
  youtube: {
    label: 'YouTube',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l6 3-6 3V9z" fill="currentColor" stroke="none"/></svg>'
  },
  tiktok: {
    label: 'TikTok',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3.5c0 2.7 2.1 4.9 4.8 5"/></svg>'
  },
  telegram: {
    label: 'Telegram',
    svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 4L3 11l6 2.2M21 4l-4.2 16L9 13.2M21 4L9 13.2"/></svg>'
  }
};

function renderProfile() {
  const cover = document.getElementById('coverImg');
  cover.src = SITE_PROFILE.coverUrl;
  cover.alt = SITE_PROFILE.name;

  const avatar = document.getElementById('avatarImg');
  avatar.src = SITE_PROFILE.avatarUrl;
  avatar.alt = SITE_PROFILE.name;

  document.getElementById('profileName').textContent = SITE_PROFILE.name;
  document.getElementById('profileBio').textContent = SITE_PROFILE.bio;

  const socialEl = document.getElementById('profileSocial');
  socialEl.innerHTML = Object.entries(SITE_PROFILE.social)
    .filter(([, url]) => url)
    .map(([key, url]) => {
      const icon = SOCIAL_ICONS[key];
      if (!icon) return '';
      return `<a class="social-btn" href="${url}" target="_blank" rel="noopener" title="${icon.label}">${icon.svg}</a>`;
    })
    .join('');
}

function pluralizeRecipes(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'рецепт';
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return 'рецепта';
  return 'рецептов';
}

async function loadRecipes() {
  const grid = document.getElementById('cardGrid');
  const { data, error } = await supabaseClient
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    grid.innerHTML = `<div class="empty-state">Не получилось загрузить рецепты: ${error.message}</div>`;
    return;
  }

  allRecipes = data || [];
  document.getElementById('recipeCount').innerHTML =
    `<strong>${allRecipes.length}</strong> ${pluralizeRecipes(allRecipes.length)}`;

  buildFilters();
  renderGrid();
}

function buildFilters() {
  const row = document.getElementById('filterRow');
  const cats = [...new Set(allRecipes.map(r => r.category || 'Разное'))];
  row.innerHTML = '';

  const allChip = document.createElement('button');
  allChip.className = 'filter-chip' + (activeCategory === 'all' ? ' active' : '');
  allChip.textContent = 'Все';
  allChip.onclick = () => { activeCategory = 'all'; buildFilters(); renderGrid(); };
  row.appendChild(allChip);

  cats.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (activeCategory === cat ? ' active' : '');
    chip.textContent = cat;
    chip.onclick = () => { activeCategory = cat; buildFilters(); renderGrid(); };
    row.appendChild(chip);
  });
}

function setLangFilter(lang) {
  activeLang = lang;
  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('cardGrid');
  let list = activeCategory === 'all'
    ? allRecipes
    : allRecipes.filter(r => (r.category || 'Разное') === activeCategory);

  if (activeLang !== 'all') {
    list = list.filter(r => (r.language || 'ru') === activeLang);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(r => (r.title || '').toLowerCase().includes(q));
  }

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state">Ничего не нашлось с такими фильтрами.</div>';
    return;
  }

  grid.innerHTML = list.map((r, i) => `
    <a class="recipe-card anim-fade-up" style="animation-delay:${Math.min(i * 45, 400)}ms" href="recipe.html?id=${r.id}">
      ${r.image_url
        ? `<img src="${r.image_url}" alt="${escapeHtml(r.title)}">`
        : `<div class="no-image">без фото</div>`}
      <h3>${escapeHtml(r.title)}</h3>
      <div class="card-meta">
        <span>${escapeHtml(r.category || 'Разное')}</span>
        <span class="lang-badge">${r.language === 'en' ? 'EN' : 'RU'}</span>
      </div>
    </a>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderGrid();
});

renderProfile();
loadRecipes();
renderAuthNav('navAuth');
