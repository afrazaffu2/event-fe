'use client';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { MonthlyEventGraph } from '@/components/dashboard/monthly-event-graph';
import { YearlyEventGraph } from '@/components/dashboard/yearly-event-graph';
import { UpcomingOngoingEvents } from '@/components/dashboard/upcoming-ongoing-events';


export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
      <OverviewCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MonthlyEventGraph />
        {/* <YearlyEventGraph /> */}
      </div>
      <UpcomingOngoingEvents />
    </div>
  );
}
