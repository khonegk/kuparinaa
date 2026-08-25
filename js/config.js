// ============================================================
// НАСТРОЙКИ — заполни своими значениями из Supabase
// Dashboard -> Project Settings -> API
// ============================================================

const SUPABASE_URL = 'https://ТВОЙ-ПРОЕКТ.supabase.co';
const SUPABASE_ANON_KEY = 'ТВОЙ-ANON-KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Проверка на случай, если в URL или ключ попал лишний символ
// (например, кириллица осталась от плейсхолдера, или зацепился пробел).
// Без этой проверки браузер выдаёт непонятную ошибку про "Headers".
function checkConfigValue(name, value) {
  if (!value || /[^\x00-\x7F]/.test(value) || value.includes('ТВОЙ')) {
    document.addEventListener('DOMContentLoaded', () => {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#D40000;color:#fff;' +
        'padding:12px 18px;font-family:sans-serif;font-size:14px;z-index:9999;text-align:center;';
      banner.textContent = `Ошибка настройки: переменная ${name} в js/config.js содержит недопустимые ` +
        `символы (например, кириллицу) или не заполнена. Открой файл и проверь значение — ` +
        `в нём не должно быть ничего, кроме латинских букв, цифр и обычных символов вроде -_./:`;
      document.body.prepend(banner);
    });
  }
}
checkConfigValue('SUPABASE_URL', SUPABASE_URL);
checkConfigValue('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY);
