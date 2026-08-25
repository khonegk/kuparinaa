-- ============================================================
-- Схема базы данных для сайта рецептов (версия 3: RU/EN как
-- отдельные поля внутри одного рецепта, а не как метка).
-- Выполнить в Supabase: Dashboard -> SQL Editor -> New query
--
-- Это ломающее изменение структуры таблицы. Если recipes уже
-- существует (любая более ранняя версия) - сначала выполни:
--   drop table if exists recipes cascade;
-- и только потом запускай этот файл целиком.
-- ============================================================

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,

  category text default 'Разное',

  title_ru text,
  ingredients_ru text,
  instructions_ru text,

  title_en text,
  ingredients_en text,
  instructions_en text,

  image_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- у рецепта должна быть заполнена хотя бы одна языковая версия
  constraint has_at_least_one_language check (
    coalesce(title_ru, '') <> '' or coalesce(title_en, '') <> ''
  )
);

create index if not exists idx_recipes_public on recipes (is_public, created_at desc);
create index if not exists idx_recipes_user on recipes (user_id, created_at desc);

alter table recipes enable row level security;

create policy "anon_read_public_recipes"
  on recipes for select
  to anon
  using (is_public = true);

create policy "auth_read_public_and_own"
  on recipes for select
  to authenticated
  using (is_public = true or user_id = auth.uid());

create policy "auth_insert_own"
  on recipes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "auth_update_own"
  on recipes for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "auth_delete_own"
  on recipes for delete
  to authenticated
  using (user_id = auth.uid());

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
-- Хранилище картинок (Storage) — без изменений с прошлой версии.
-- Если бакет recipe-images и политики уже созданы раньше,
-- этот блок можно не перезапускать.
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
