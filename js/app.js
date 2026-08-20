let allRecipes = [];
let activeCategory = 'all';
let activeLang = 'all';

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

  if (list.length === 0) {
    grid.innerHTML = '<div class="empty-state">Пока нет публичных рецептов с этими фильтрами.</div>';
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

loadRecipes();
