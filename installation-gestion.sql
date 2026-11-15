-- =====================================================================
--  B.CREA · Gestion boutique (commandes, clients, devis, factures…)
--  À exécuter APRÈS installation.sql, en une fois :
--  Supabase → SQL Editor → New query → coller → Run
--
--  Ces données sont PRIVÉES : contrairement aux contenus du site,
--  personne ne peut les lire sans être connecté avec le compte autorisé
--  (et le code de double authentification s'il est activé).
-- =====================================================================

create table if not exists public.gestion (
  col   text not null,
  id    text not null,
  data  jsonb not null default '{}'::jsonb,
  maj   timestamptz not null default now(),
  primary key (col, id)
);
alter table public.gestion enable row level security;

drop policy if exists "gestion lecture" on public.gestion;
create policy "gestion lecture" on public.gestion
  for select to authenticated using (public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion ajout" on public.gestion;
create policy "gestion ajout" on public.gestion
  for insert to authenticated with check (public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion modif" on public.gestion;
create policy "gestion modif" on public.gestion
  for update to authenticated using (public.est_admin() and public.double_auth_ok())
  with check (public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion suppression" on public.gestion;
create policy "gestion suppression" on public.gestion
  for delete to authenticated using (public.est_admin() and public.double_auth_ok());

-- Le visiteur anonyme n'a aucun droit sur cette table.
revoke all on public.gestion from anon;

-- Vérification d'accès utilisée par la page de gestion
create or replace function public.acces_gestion() returns boolean
language sql stable as $$ select public.est_admin() and public.double_auth_ok() $$;

-- ---------------------------------------------------------------------
--  Fichiers privés (photos des produits, justificatifs, preuves de paiement)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('gestion', 'gestion', false, 20971520)
on conflict (id) do update set public = false;

drop policy if exists "gestion fichiers lecture" on storage.objects;
create policy "gestion fichiers lecture" on storage.objects
  for select to authenticated
  using (bucket_id = 'gestion' and public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion fichiers ajout" on storage.objects;
create policy "gestion fichiers ajout" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gestion' and public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion fichiers modif" on storage.objects;
create policy "gestion fichiers modif" on storage.objects
  for update to authenticated
  using (bucket_id = 'gestion' and public.est_admin() and public.double_auth_ok());

drop policy if exists "gestion fichiers suppression" on storage.objects;
create policy "gestion fichiers suppression" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gestion' and public.est_admin() and public.double_auth_ok());
