'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Remove mock data import - using dummy data instead
import { format } from 'date-fns';
import { CalendarDays, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const dummyMonthlyData = [
  { month: 'Jan', events: 3 },
  { month: 'Feb', events: 5 },
  { month: 'Mar', events: 2 },
  { month: 'Apr', events: 7 },
  { month: 'May', events: 4 },
  { month: 'Jun', events: 6 },
  { month: 'Jul', events: 8 },
  { month: 'Aug', events: 3 },
  { month: 'Sep', events: 9 },
  { month: 'Oct', events: 5 },
  { month: 'Nov', events: 4 },
  { month: 'Dec', events: 7 },
];

const monthOrder = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const getEventsByMonth = () => {
  // Using dummy data since mock-data was removed
  return dummyMonthlyData;
};

const validateChartData = (data: any[]): typeof dummyMonthlyData => {
  try {
    if (!Array.isArray(data)) return dummyMonthlyData;
    const validData = data.filter(item =>
      item &&
      typeof item === 'object' &&
      typeof item.month === 'string' &&
      typeof item.events === 'number' &&
      !isNaN(item.events) &&
      monthOrder.includes(item.month)
    ).map(item => ({
      month: item.month,
      events: Number(item.events)
    }));
    return validData.length > 0 ? validData : dummyMonthlyData;
  } catch {
    return dummyMonthlyData;
  }
};

export function MonthlyEventGraph() {
  const chartData = validateChartData(getEventsByMonth());

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] flex flex-col justify-between group"
      >
        {/* Animated background icon */}
        <CalendarDays className="absolute right-4 bottom-4 w-28 h-28 text-blue-200 opacity-20 z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Events This Year</span>
          </div>
          <div className="w-full min-h-[160px]">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={13} stroke="#6366f1" fontWeight={600} />
                <YAxis allowDecimals={false} fontSize={13} stroke="#6366f1" fontWeight={600} />
                <Tooltip cursor={{ fill: '#ede9fe' }} formatter={(value) => `${value} events`} />
                <Bar dataKey="events" fill="url(#monthlyGradient)" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="events" position="top" fontSize={13} fill="#7c3aed" fontWeight={700} />
                </Bar>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(80, 80, 200, 0.10)' }}
      className="relative overflow-hidden rounded-2xl shadow-xl border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white p-4 min-h-[220px] flex flex-col justify-between group"
    >
      {/* Animated background icon */}
      <CalendarDays className="absolute right-4 bottom-4 w-28 h-28 text-blue-200 opacity-20 z-0" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="text-lg font-extrabold uppercase bg-gradient-to-r from-blue-700 via-purple-700 to-blue-400 bg-clip-text text-transparent tracking-wider">Events This Year</span>
        </div>
        <div className="w-full min-h-[160px]">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={13} stroke="#6366f1" fontWeight={600} />
              <YAxis allowDecimals={false} fontSize={13} stroke="#6366f1" fontWeight={600} />
              <Tooltip cursor={{ fill: '#ede9fe' }} formatter={(value) => `${value} events`} />
              <Bar dataKey="events" fill="url(#monthlyGradient)" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="events" position="top" fontSize={13} fill="#7c3aed" fontWeight={700} />
              </Bar>
              <defs>
                <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
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
