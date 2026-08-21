// Подставляет в шапку либо кнопки "Войти/Регистрация",
// либо "Мои рецепты/Выйти" — в зависимости от того, вошёл ли пользователь.
async function renderAuthNav(containerId) {
  const nav = document.getElementById(containerId);
  if (!nav) return;

  const { data } = await supabaseClient.auth.getSession();

  if (data.session) {
    nav.innerHTML = `
      <a href="dashboard.html" class="btn btn-outline btn-sm">Мои рецепты</a>
      <button class="btn btn-sm" onclick="navLogout()">Выйти</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="admin.html" class="btn btn-outline btn-sm">Войти</a>
      <a href="admin.html#register" class="btn btn-sm">Регистрация</a>
    `;
  }
}

function navLogout() {
  supabaseClient.auth.signOut().then(() => window.location.reload());
}
