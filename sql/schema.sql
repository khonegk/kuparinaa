-- ============================================================
-- Схема базы данных для сайта рецептов (версия 2: логин+пароль)
-- Выполнить в Supabase: Dashboard -> SQL Editor -> New query
--
-- Если таблица recipes уже создавалась раньше (первая версия
-- проекта, только с паролем) - сначала выполни:
--   drop table if exists recipes cascade;
-- и только потом запускай этот файл целиком.
-- ============================================================

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text default 'Разное',
  language text not null default 'ru' check (language in ('ru', 'en')),
  ingredients text not null,      -- список ингредиентов, каждый с новой строки
  instructions text not null,     -- шаги приготовления, каждый с новой строки
  image_url text,                 -- ссылка на картинку в Storage
  is_public boolean not null default false,  -- показывать ли рецепт по публичной ссылке
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recipes_public on recipes (is_public, created_at desc);
create index if not exists idx_recipes_user on recipes (user_id, created_at desc);

alter table recipes enable row level security;

-- Гость (не вошёл в аккаунт) видит только публичные рецепты
create policy "anon_read_public_recipes"
  on recipes for select
  to anon
  using (is_public = true);

-- Вошедший пользователь видит: чужие публичные + все свои (и приватные тоже)
create policy "auth_read_public_and_own"
  on recipes for select
  to authenticated
  using (is_public = true or user_id = auth.uid());

-- Добавлять можно только от своего имени
create policy "auth_insert_own"
  on recipes for insert
  to authenticated
  with check (user_id = auth.uid());

-- Редактировать можно только свои рецепты
create policy "auth_update_own"
  on recipes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Удалять можно только свои рецепты
create policy "auth_delete_own"
  on recipes for delete
  to authenticated
  using (user_id = auth.uid());

-- Автоматическое обновление updated_at при изменении записи
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_recipes_updated_at on recipes;
create trigger trg_recipes_updated_at
  before update on recipes
  for each row execute function set_updated_at();

-- ============================================================
-- Хранилище картинок (Storage)
-- Bucket нужно создать вручную: Dashboard -> Storage -> New bucket
-- Имя: recipe-images, Public bucket: включить
-- После создания выполнить политики ниже.
--
-- Картинки каждого пользователя лежат в своей "папке" внутри
-- бакета (папка = его user_id), поэтому один пользователь не
-- может стереть или заменить чужую картинку.
-- ============================================================

create policy "anon_read_recipe_images"
  on storage.objects for select
  to anon
  using (bucket_id = 'recipe-images');

create policy "auth_read_recipe_images"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'recipe-images');

create policy "owner_upload_recipe_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_update_recipe_images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "owner_delete_recipe_images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
