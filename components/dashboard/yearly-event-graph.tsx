'use client';

import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { useAuth } from '@/contexts/auth-context';
import type { ChartConfig } from '@/components/ui/chart';

const chartConfig = eventCategories.reduce(
  (acc, category, index) => {
    acc[category] = {
      label: category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  },
  {} as ChartConfig
);

const eventsByCategory = events.reduce(
  (acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

const chartData = Object.entries(eventsByCategory).map(([category, count]) => ({
  category,
  count,
  fill: `var(--color-${category})`,
}));

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, count }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't render label for very small slices

  return (
    <text x={x} y={y} fill="hsl(var(--primary-foreground))" textAnchor="middle" dominantBaseline="central" className="text-sm font-bold">
      {count}
    </text>
  );
};


export function YearlyEventGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Events by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              labelLine={false}
              label={renderCustomizedLabel}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-mt-4"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
