// Подключается на все страницы, куда нельзя заходить без входа.
// requireAuth() возвращает объект пользователя, либо отправляет
// на страницу входа и возвращает null.
async function requireAuth() {
  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = 'admin.html';
    return null;
  }
  return data.session.user;
}
