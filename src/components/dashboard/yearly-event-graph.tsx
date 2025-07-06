'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Remove mock data import - using API data instead
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { getYearlyEventCountByHost, getEvents } from '@/services/eventService';
import { BarChart3, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

// Dummy data for yearly events - always ensure this is valid
const dummyYearlyData = [
  { year: 2022, count: 15 },
  { year: 2023, count: 28 },
  { year: 2024, count: 42 },
];

// Function removed since we're using API data instead of mock data

// Validate chart data
const validateChartData = (data: any[]): typeof dummyYearlyData => {
  try {
    if (!Array.isArray(data)) return dummyYearlyData;
    
    const validData = data.filter(item => 
      item && 
      typeof item === 'object' && 
      typeof item.year === 'number' && 
      typeof item.count === 'number' &&
      !isNaN(item.year) && 
      !isNaN(item.count) &&
      item.year > 1900 && 
      item.year < 2100
    ).map(item => ({
      year: Number(item.year),
      count: Number(item.count)
    }));

    return validData.length > 0 ? validData : dummyYearlyData;
  } catch {
    return dummyYearlyData;
  }
};

export function YearlyEventGraph() {
  const { user } = useAuth();
  const [yearlyData, setYearlyData] = useState<{ year: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        if (user?.role === 'host' && user?.id) {
          const data = await getYearlyEventCountByHost(user.id);
          setYearlyData(Array.isArray(data) && data.length > 0 ? data : []);
        } else {
          // For admin: fetch all events and group by year
          const allEvents = await getEvents();
          const byYear: Record<number, number> = {};
          for (const event of allEvents) {
            try {
              if (event && event.date) {
                const year = new Date(event.date).getFullYear();
                if (!isNaN(year) && year > 1900 && year < 2100) {
                  byYear[year] = (byYear[year] || 0) + 1;
                }
              }
            } catch {}
          }
          const result = Object.entries(byYear)
            .filter(([year, count]) => !isNaN(Number(year)) && Number(count) > 0)
            .map(([year, count]) => ({ year: Number(year), count: Number(count) }));
          setYearlyData(result);
        }
      } catch {
        setYearlyData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] flex flex-col justify-between group"
      >
        {/* Animated background icon */}
        <BarChart3 className="absolute right-4 bottom-4 w-28 h-28 text-purple-200 opacity-20 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Events by Year</span>
          </div>
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        </div>
      </motion.div>
    );
  }

  if (!yearlyData || yearlyData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] flex flex-col justify-between group"
      >
        {/* Animated background icon */}
        <BarChart3 className="absolute right-4 bottom-4 w-28 h-28 text-purple-200 opacity-20 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Events by Year</span>
          </div>
          <div className="text-center text-muted-foreground py-8">No event data available</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(80, 80, 200, 0.10)' }}
      className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] flex flex-col justify-between group"
    >
      {/* Animated background icon */}
      <BarChart3 className="absolute right-4 bottom-4 w-28 h-28 text-purple-200 opacity-20 z-0" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-5 h-5 text-purple-500" />
          <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Events by Year</span>
        </div>
        <div className="w-full min-h-[160px]">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={yearlyData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="year" tickLine={false} axisLine={false} fontSize={13} stroke="#a21caf" fontWeight={600} />
              <YAxis allowDecimals={false} fontSize={13} stroke="#a21caf" fontWeight={600} />
              <Tooltip cursor={{ fill: '#ede9fe' }} formatter={(value) => `${value} events`} />
              <Bar dataKey="count" fill="url(#yearlyGradient)" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="count" position="top" fontSize={13} fill="#a21caf" fontWeight={700} />
              </Bar>
              <defs>
                <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a21caf" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
