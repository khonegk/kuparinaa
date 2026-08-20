// ============================================================
// НАСТРОЙКИ — заполни своими значениями из Supabase
// Dashboard -> Project Settings -> API
// ============================================================

const SUPABASE_URL = 'https://sb_publishable_F_CzCJDj5cKhazJsPZZ0-w_OtgmifEn';
const SUPABASE_ANON_KEY = 'ТВОЙ-ANON-KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
