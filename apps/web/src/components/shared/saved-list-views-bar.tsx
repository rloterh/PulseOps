'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createSavedListViewAction } from '@/features/list-views/actions/create-saved-list-view-action';
import { deleteSavedListViewAction } from '@/features/list-views/actions/delete-saved-list-view-action';
import type {
  SavedListViewActionState,
  SavedListViewRecord,
  SavedListViewResource,
} from '@/features/list-views/types/list-view.types';

const initialState: SavedListViewActionState = {};

function SaveViewButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving...' : 'Save view'}
    </button>
  );
}

export function SavedListViewsBar<TResource extends SavedListViewResource>({
  resourceType,
  pageHref,
  filtersPayload,
  views,
}: {
  resourceType: TResource;
  pageHref: string;
  filtersPayload: string;
  views: SavedListViewRecord<TResource>[];
}) {
  const [state, formAction] = useActionState(createSavedListViewAction, initialState);
  const [name, setName] = useState('');

  useEffect(() => {
    if (state.success) {
      setName('');
    }
  }, [state.success]);

  return (
    <section className="rounded-[1.6rem] border border-white/8 bg-white/[0.035] p-5 shadow-[0_18px_55px_rgba(2,6,23,0.22)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">
              Saved views
            </p>
            <p className="mt-2 text-sm text-white/56">
              Reuse the current search, filters, and sort state without rebuilding the list every time.
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="resourceType" value={resourceType} />
            <input type="hidden" name="filtersPayload" value={filtersPayload} />
            <input
              type="text"
              name="name"
              value={name}
              onChange={(event) => {
                setName(event.currentTarget.value);
              }}
              placeholder="Morning triage"
              className="h-10 min-w-[13rem] rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/30"
            />
            <SaveViewButton />
          </form>
        </div>

        {state.error ? (
          <p className="text-sm text-red-200">{state.error}</p>
        ) : state.success ? (
          <p className="text-sm text-emerald-200">{state.success}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={pageHref as Route}
            className="inline-flex items-center rounded-full border border-white/10 bg-black/18 px-3 py-2 text-sm text-white/68 transition hover:bg-black/28 hover:text-white"
          >
            Base view
          </Link>

          {views.map((view) => (
            <div
              key={view.id}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                view.isActive
                  ? 'border-white/30 bg-white/10 text-white'
                  : 'border-white/10 bg-black/18 text-white/68'
              }`}
            >
              <Link href={view.href as Route} className="transition hover:text-white">
                {view.name}
              </Link>
              <form action={deleteSavedListViewAction}>
                <input type="hidden" name="resourceType" value={resourceType} />
                <input type="hidden" name="savedViewId" value={view.id} />
                <button
                  type="submit"
                  className="rounded-full px-1 text-xs text-white/44 transition hover:text-white"
                  aria-label={`Delete ${view.name} saved view`}
                >
                  Remove
                </button>
              </form>
            </div>
          ))}

          {views.length === 0 ? (
            <p className="text-sm text-white/42">
              No saved views yet. Save your current list setup to pin a repeatable operating view.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
