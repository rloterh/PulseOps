begin;

alter table public.ai_runs
  drop constraint if exists ai_runs_task_key_check;

alter table public.ai_runs
  add constraint ai_runs_task_key_check
  check (
    task_key in (
      'analytics_overview',
      'analytics_branch_comparison'
    )
  );

commit;
