'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, PlayCircle, Timer } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { getEventStatsByHost, getEvents } from '@/services/eventService';

export function OverviewCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ total: number; ongoing: number; upcoming: number } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (user?.role === 'host') {
        const data = await getEventStatsByHost(user.id);
        setStats(data);
      } else {
        // For admin: fetch all events from backend
        const allEvents = await getEvents();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setStats({
          total: allEvents.length,
          ongoing: allEvents.filter((e) => e.status === 'Ongoing').length,
          upcoming: allEvents.filter((e) => e.status === 'Upcoming').length,
        });
      }
    }
    fetchStats();
  }, [user]);

  if (!stats) {
    return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">Loading...</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            All-time events created
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ongoing Events</CardTitle>
          <PlayCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.ongoing}</div>
          <p className="text-xs text-muted-foreground">Currently active events</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.upcoming}</div>
          <p className="text-xs text-muted-foreground">
            Events scheduled to start
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
