'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Remove mock data import - using API data instead
import { Calendar, PlayCircle, Timer } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { getEventStatsByHost, getEvents } from '@/services/eventService';
import { motion } from 'framer-motion';

const cardData = [
  {
    title: 'Total Events',
    valueKey: 'total',
    icon: Calendar,
    gradient: 'from-blue-500 via-purple-500 to-blue-400',
    svg: (
      <svg className="absolute right-2 bottom-2 w-16 h-8 opacity-30" viewBox="0 0 64 32" fill="none"><path d="M0 24 Q 16 8 32 24 T 64 24" stroke="url(#grad1)" strokeWidth="3" fill="none"/><defs><linearGradient id="grad1" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#3b82f6"/><stop offset="0.5" stopColor="#a21caf"/><stop offset="1" stopColor="#60a5fa"/></linearGradient></defs></svg>
    ),
  },
  {
    title: 'Ongoing Events',
    valueKey: 'ongoing',
    icon: PlayCircle,
    gradient: 'from-green-500 via-emerald-500 to-green-400',
    svg: (
      <svg className="absolute right-2 bottom-2 w-16 h-8 opacity-30" viewBox="0 0 64 32" fill="none"><path d="M0 28 Q 16 10 32 28 T 64 28" stroke="url(#grad2)" strokeWidth="3" fill="none"/><defs><linearGradient id="grad2" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#22c55e"/><stop offset="0.5" stopColor="#059669"/><stop offset="1" stopColor="#4ade80"/></linearGradient></defs></svg>
    ),
  },
  {
    title: 'Upcoming Events',
    valueKey: 'upcoming',
    icon: Timer,
    gradient: 'from-orange-500 via-pink-500 to-yellow-400',
    svg: (
      <svg className="absolute right-2 bottom-2 w-16 h-8 opacity-30" viewBox="0 0 64 32" fill="none"><path d="M0 20 Q 16 4 32 20 T 64 20" stroke="url(#grad3)" strokeWidth="3" fill="none"/><defs><linearGradient id="grad3" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#f59e42"/><stop offset="0.5" stopColor="#ec4899"/><stop offset="1" stopColor="#fde047"/></linearGradient></defs></svg>
    ),
  },
];

// Helper to compare only the date part (local)
const isSameLocalDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

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
          ongoing: allEvents.filter((e) => {
            const eventDate = new Date(e.date);
            return isSameLocalDay(eventDate, today);
          }).length,
          upcoming: allEvents.filter((e) => {
            const eventDate = new Date(e.date);
            return eventDate > today &&
              !isSameLocalDay(eventDate, today);
          }).length,
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
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.6, type: 'spring' }}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(80, 80, 200, 0.15)' }}
            className={
              `relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br ${card.gradient} p-4 min-h-[120px] flex flex-col justify-between group transition-all duration-300`
            }
          >
            {/* Icon in accent circle */}
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md border-2 border-white shadow-lg mb-2 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-white drop-shadow-lg" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-0.5">{card.title}</div>
              <div className="text-2xl font-extrabold text-white drop-shadow-lg mb-0.5">
                {stats[card.valueKey as keyof typeof stats]}
              </div>
              <div className="text-xs text-white/70">
                {card.valueKey === 'total' && `All-time events created${user?.role === 'host' ? ' (for you)' : ''}`}
                {card.valueKey === 'ongoing' && `Currently active events${user?.role === 'host' ? ' (for you)' : ''}`}
                {card.valueKey === 'upcoming' && `Events scheduled to start${user?.role === 'host' ? ' (for you)' : ''}`}
              </div>
            </div>
            {/* Decorative SVG graph accent */}
            {card.svg}
          </motion.div>
        );
      })}
    </div>
  );
}
