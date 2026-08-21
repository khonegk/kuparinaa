// ============================================================
// НАСТРОЙКИ — заполни своими значениями из Supabase
// Dashboard -> Project Settings -> API
// ============================================================

const SUPABASE_URL = 'https://ТВОЙ-ПРОЕКТ.supabase.co';
const SUPABASE_ANON_KEY = 'ТВОЙ-ANON-KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
