'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { format } from 'date-fns';

const eventsByMonth = events.reduce(
  (acc, event) => {
    try {
      const month = format(new Date(event.date), 'MMM');
      acc[month] = (acc[month] || 0) + 1;
    } catch (e) {
      // Ignore invalid dates
    }
    return acc;
  },
  {} as Record<string, number>
);

const monthOrder = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const chartData = monthOrder
  .map((month) => ({
    month,
    events: eventsByMonth[month] || 0,
  }));

const chartConfig = {
  events: {
    label: 'Events',
    color: 'hsl(var(--chart-1))',
  },
};

export function MonthlyEventGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events This Year</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="events" fill="hsl(var(--chart-1))" radius={4}>
              <LabelList
                dataKey="events"
                position="top"
                offset={4}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
