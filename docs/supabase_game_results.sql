-- Tabela de resultados anônimos do jogo (sem nome, e-mail ou IP)
create table if not exists public.game_results (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  age_group text not null check (age_group in ('young', 'adult', 'senior')),
  gender text not null check (gender in ('female', 'male')),
  case_id text not null check (length(case_id) <= 60),
  is_scam boolean not null,
  correct boolean not null,
  clues_inspected smallint not null check (clues_inspected between 0 and 20)
);

alter table public.game_results enable row level security;

-- Qualquer visitante pode inserir e ler (dados agregados e anônimos); ninguém altera ou apaga
create policy "insert anon" on public.game_results for insert to anon with check (true);
create policy "select anon" on public.game_results for select to anon using (true);
