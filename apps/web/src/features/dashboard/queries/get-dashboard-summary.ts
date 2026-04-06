import 'server-only';

import { createSupabaseServerClient } from '@pulseops/supabase/server';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';

interface Input {
  tenantId: string;
  _branchId: string | null;
  branchName: string | null;
}

export async function getDashboardSummary({
  tenantId,
  _branchId,
  branchName,
}: Input): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const [locationsResult, membersResult] = await Promise.all([
    supabase
      .from('locations')
      .select('id, name', { count: 'exact' })
      .eq('organization_id', tenantId),
    supabase
      .from('organization_members')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', tenantId),
  ]);

  if (locationsResult.error) {
    throw new Error(locationsResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  const branchTotal = locationsResult.count ?? 0;
  const memberTotal = membersResult.count ?? 0;
  const branchLabel = branchName ?? 'selected branch';
  const scheduledJobs = branchTotal * 3 + 4;
  const atRiskCount = Math.max(1, Math.ceil(branchTotal / 2));

  return {
    kpis: [
      {
        label: 'Active branches',
        value: String(branchTotal),
        delta: '+1',
        direction: 'up',
        helperText: 'Provisioned in the current workspace',
      },
      {
        label: 'Operators',
        value: String(memberTotal),
        delta: '+0',
        direction: 'neutral',
        helperText: 'Members with authenticated app access',
      },
      {
        label: 'Scheduled jobs',
        value: String(scheduledJobs),
        delta: '+6',
        direction: 'up',
        helperText: `Planned workload around ${branchLabel}`,
      },
      {
        label: 'SLA at risk',
        value: String(atRiskCount),
        delta: '-1',
        direction: 'down',
        helperText: 'Scaffolded operational watchlist',
      },
    ],
    incidents: [
      {
        id: 'inc_hvac_outage',
        title: `HVAC outage review for ${branchLabel}`,
        severity: 'critical',
        status: 'investigating',
        openedLabel: '12 min ago',
      },
      {
        id: 'inc_water_pressure',
        title: 'Water pressure alert near loading zone',
        severity: 'high',
        status: 'open',
        openedLabel: '34 min ago',
      },
      {
        id: 'inc_generator_followup',
        title: 'Generator compliance follow-up',
        severity: 'medium',
        status: 'open',
        openedLabel: '2 hrs ago',
      },
    ],
    upcomingJobs: [
      {
        id: 'job_pm_cooling',
        title: 'Preventive maintenance for cooling plant',
        dueLabel: 'Today, 2:00 PM',
        assigneeLabel: 'Field Ops Team',
        status: 'scheduled',
      },
      {
        id: 'job_vendor_walkthrough',
        title: 'Vendor walkthrough and handoff',
        dueLabel: 'Tomorrow, 9:30 AM',
        assigneeLabel: 'Regional lead',
        status: 'scheduled',
      },
      {
        id: 'job_spares_waiting',
        title: 'Lift lighting replacement',
        dueLabel: 'Tomorrow, 11:15 AM',
        assigneeLabel: 'Maintenance queue',
        status: 'blocked',
      },
    ],
    recentActivity: [
      {
        id: 'activity_1',
        title: 'Incident escalated',
        description: `Leadership review requested for ${branchLabel}.`,
        timestamp: '8 min ago',
      },
      {
        id: 'activity_2',
        title: 'Branch sync completed',
        description: 'Daily branch summary prepared for the dashboard shell.',
        timestamp: '26 min ago',
      },
      {
        id: 'activity_3',
        title: 'Customer note added',
        description: 'After-hours access request captured for follow-up.',
        timestamp: '1 hr ago',
      },
    ],
    branchHealth: [
      { label: 'Response time', value: '14m', tone: 'success' },
      { label: 'First-time fix', value: '74%', tone: 'default' },
      { label: 'Escalations', value: String(Math.max(1, branchTotal - 1)), tone: 'warning' },
      { label: 'Blocked jobs', value: '2', tone: 'danger' },
    ],
    slaRiskCount: atRiskCount,
  };
}
