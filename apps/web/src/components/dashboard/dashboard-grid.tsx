import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { BranchHealthWidget } from '@/components/dashboard/widgets/branch-health-widget';
import { IncidentsOverviewWidget } from '@/components/dashboard/widgets/incidents-overview-widget';
import { RecentActivityWidget } from '@/components/dashboard/widgets/recent-activity-widget';
import { SlaRiskWidget } from '@/components/dashboard/widgets/sla-risk-widget';
import { UpcomingJobsWidget } from '@/components/dashboard/widgets/upcoming-jobs-widget';

export function DashboardGrid({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.kpis.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <IncidentsOverviewWidget items={summary.incidents} />
        </div>
        <div className="xl:col-span-5">
          <SlaRiskWidget count={summary.slaRiskCount} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <BranchHealthWidget items={summary.branchHealth} />
        </div>
        <div className="xl:col-span-4">
          <UpcomingJobsWidget items={summary.upcomingJobs} />
        </div>
        <div className="xl:col-span-4">
          <RecentActivityWidget items={summary.recentActivity} />
        </div>
      </section>
    </div>
  );
}
