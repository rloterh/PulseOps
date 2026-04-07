begin;

do $$
begin
  alter type public.incident_timeline_event_type add value if not exists 'escalation';
exception
  when duplicate_object then null;
end
$$;

alter table public.record_notifications
  drop constraint if exists record_notifications_event_type_check;

alter table public.record_notifications
  add constraint record_notifications_event_type_check
    check (
      event_type in (
        'comment',
        'mention',
        'assignment',
        'status_change',
        'record_created',
        'escalation'
      )
    );

create index if not exists incident_escalations_org_target_idx
  on public.incident_escalations (organization_id, target_user_id, status, triggered_at desc);

commit;
