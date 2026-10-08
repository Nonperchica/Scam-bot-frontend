-- Run in Supabase SQL Editor after reviewing. Does not alter existing vectors.
set search_path = public, extensions;
create table if not exists public.dataset_reviews (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.detection_logs(id),
  status text not null check (status in ('saved', 'skipped')),
  dataset_id bigint references public.scam_dataset(id),
  reviewed_at timestamptz not null default now()
);
alter table public.dataset_reviews enable row level security;
revoke all on public.dataset_reviews from anon, authenticated;
grant all on public.dataset_reviews to service_role;

create or replace function public.review_dataset_candidate(
  p_candidate_id uuid, p_action text, p_message text, p_label text, p_embedding vector(768)
) returns jsonb language plpgsql security invoker set search_path = public, extensions as $$
declare
  prior public.dataset_reviews%rowtype;
  saved public.scam_dataset%rowtype;
begin
  if p_action not in ('saved', 'skipped') then raise exception 'Invalid action'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_candidate_id::text, 0));
  select * into prior from public.dataset_reviews where candidate_id = p_candidate_id;
  if found then
    if prior.status <> p_action then raise exception 'Already reviewed'; end if;
    if prior.status = 'skipped' then return jsonb_build_object('status', 'skipped'); end if;
    select * into saved from public.scam_dataset where id = prior.dataset_id;
  else
    if not exists (select 1 from public.detection_logs where id = p_candidate_id
                   and detection_status in ('risk_found', 'uncertain')) then
      raise exception 'Candidate not eligible';
    end if;
    if p_action = 'skipped' then
      insert into public.dataset_reviews(candidate_id, status) values (p_candidate_id, 'skipped');
      return jsonb_build_object('status', 'skipped');
    end if;
    if p_label is null or p_label not in ('spam','ham') or p_embedding is null
       or p_message is null or length(btrim(p_message)) not between 1 and 5000 then
      raise exception 'Invalid dataset input';
    end if;
    perform pg_advisory_xact_lock(hashtextextended(p_message, 1));
    if exists(select 1 from public.scam_dataset where thai_text = p_message and label <> p_label) then
      raise exception 'Conflicting existing label';
    end if;
    select * into saved from public.scam_dataset where thai_text = p_message and label = p_label order by id limit 1;
    if not found then
      insert into public.scam_dataset(thai_text, label, embedding)
      values (p_message, p_label, p_embedding) returning * into saved;
    end if;
    insert into public.dataset_reviews(candidate_id, status, dataset_id) values (p_candidate_id, 'saved', saved.id);
  end if;
  return jsonb_build_object('status', 'saved', 'entry', jsonb_build_object(
    'id', saved.id::text, 'message', saved.thai_text, 'label', saved.label,
    'category', 'ยังไม่ระบุ', 'source', 'ยังไม่ระบุ', 'confirmed', true));
end;
$$;
revoke all on function public.review_dataset_candidate(uuid,text,text,text,vector) from public, anon, authenticated;
grant execute on function public.review_dataset_candidate(uuid,text,text,text,vector) to service_role;
