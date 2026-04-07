import { describe, expect, it } from 'vitest';
import { serializeAnalyticsCsv } from '@/features/analytics/lib/serialize-analytics-csv';

describe('serializeAnalyticsCsv', () => {
  it('serializes rows with stable headers', () => {
    const csv = serializeAnalyticsCsv({
      columns: ['branch_name', 'jobs_created', 'notes'],
      rows: [
        {
          branch_name: 'North Branch',
          jobs_created: 12,
          notes: 'steady',
        },
      ],
    });

    expect(csv).toBe('branch_name,jobs_created,notes\nNorth Branch,12,steady\n');
  });

  it('escapes commas and quotes correctly', () => {
    const csv = serializeAnalyticsCsv({
      columns: ['title'],
      rows: [{ title: 'Pump "A", urgent' }],
    });

    expect(csv).toBe('title\n"Pump ""A"", urgent"\n');
  });
});
