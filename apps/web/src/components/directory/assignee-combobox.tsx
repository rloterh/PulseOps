'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DirectoryUser } from '@/features/directory/types/directory.types';
import { useAssigneeSearch } from '@/features/directory/hooks/use-assignee-search';

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

export function AssigneeCombobox({
  name,
  label,
  locationId,
  initialResults,
}: {
  name: string;
  label: string;
  locationId: string | null;
  initialResults: DirectoryUser[];
}) {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, isLoading, error } = useAssigneeSearch({
    initialResults,
    locationId,
    query,
  });

  useEffect(() => {
    setSelectedUser(null);
    setQuery('');
    setActiveIndex(0);
  }, [locationId]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const helperText = useMemo(() => {
    if (!locationId) {
      return 'Select a branch first to search the assignable team.';
    }

    if (error) {
      return error;
    }

    if (isLoading) {
      return 'Searching the live assignee directory...';
    }

    if (results.length === 0) {
      return 'No eligible assignees found for this branch.';
    }

    return 'Search by name, email, or role.';
  }, [error, isLoading, locationId, results.length]);

  return (
    <div className="space-y-2">
      <label htmlFor={`${name}-search`} className="text-sm font-medium text-white">
        {label}
      </label>
      <input type="hidden" name={name} value={selectedUser?.userId ?? ''} />
      {selectedUser ? (
        <div className="flex items-center justify-between rounded-[1rem] border border-emerald-400/20 bg-emerald-300/10 px-3 py-3 text-sm text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-300/18 text-xs font-semibold tracking-[0.12em] text-emerald-100">
              {getInitials(selectedUser.fullName)}
            </span>
            <span>
              <span className="block font-medium">
                {selectedUser.fullName}
                {selectedUser.isCurrentUser ? ' (You)' : ''}
              </span>
              <span className="block text-xs text-white/56">
                {selectedUser.email ?? selectedUser.role}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setIsOpen(true);
            }}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/72 transition hover:bg-white/10 hover:text-white"
          >
            Clear
          </button>
        </div>
      ) : null}

      <div className="rounded-[1.1rem] border border-white/10 bg-black/18">
        <input
          id={`${name}-search`}
          type="text"
          value={query}
          disabled={!locationId}
          onFocus={() => {
            if (locationId) {
              setIsOpen(true);
            }
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (!isOpen || results.length === 0) {
              return;
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % results.length);
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + results.length) % results.length);
            }

            if (event.key === 'Enter') {
              event.preventDefault();
              const match = results[activeIndex];

              if (match) {
                setSelectedUser(match);
                setQuery('');
                setIsOpen(false);
              }
            }

            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder={
            locationId ? 'Search assignee by name, email, or role' : 'Choose a branch first'
          }
          className="h-11 w-full rounded-[1.1rem] bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/34 disabled:cursor-not-allowed disabled:text-white/38"
        />
      </div>

      <p className="text-xs leading-5 text-white/48">{helperText}</p>

      {isOpen && locationId ? (
        <div className="space-y-2 rounded-[1rem] border border-white/10 bg-[#07111d]/92 p-2 shadow-[0_20px_50px_rgba(2,6,23,0.38)]">
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={result.userId}
                type="button"
                onClick={() => {
                  setSelectedUser(result);
                  setQuery('');
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[0.9rem] px-3 py-3 text-left transition ${
                  index === activeIndex ? 'bg-white/10' : 'hover:bg-white/6'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-white/8 text-xs font-semibold tracking-[0.12em] text-white">
                    {getInitials(result.fullName)}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">
                      {result.fullName}
                      {result.isCurrentUser ? ' (You)' : ''}
                    </span>
                    <span className="block text-xs text-white/48">
                      {result.email ?? 'No email'} / {result.role}
                    </span>
                  </span>
                </span>
                <span className="text-[11px] uppercase tracking-[0.16em] text-white/38">
                  {result.locationName ?? 'Branch'}
                </span>
              </button>
            ))
          ) : (
            <div className="rounded-[0.9rem] border border-dashed border-white/10 bg-white/[0.03] px-3 py-5 text-sm text-white/48">
              No eligible assignees found for the selected branch.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
