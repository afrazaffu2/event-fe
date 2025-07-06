'use client';

import { OverviewCards } from '@/components/dashboard/overview-cards';
import { MonthlyEventGraph } from '@/components/dashboard/monthly-event-graph';
import { YearlyEventGraph } from '@/components/dashboard/yearly-event-graph';
import { UpcomingOngoingEvents } from '@/components/dashboard/upcoming-ongoing-events';
import { useAuth } from '@/contexts/auth-context';
import { Badge } from '@/components/ui/badge';
import { User, Crown } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Extract name from email (everything before @)
  const getUserName = (email: string) => {
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  };

  const getRoleDisplay = (role: string) => {
    return role === 'admin' ? 'Administrator' : 'Event Host';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Dashboard
      </h1>

      {/* Welcome Message */}
      {user && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
          <div className="relative p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <div className="text-white">
                  {getRoleIcon(user.role)}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Welcome back, {getUserName(user.email)}!
                </h2>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium">
                    <div className="flex items-center space-x-1.5">
                      {getRoleIcon(user.role)}
                      <span>{getRoleDisplay(user.role)}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <OverviewCards />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <MonthlyEventGraph />
        <YearlyEventGraph />
      </div>
      <UpcomingOngoingEvents />
    </div>
  );
}
