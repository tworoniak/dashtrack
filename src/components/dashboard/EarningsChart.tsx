import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { DailyPoint } from '@/types';

interface Props {
  data: DailyPoint[];
}

export default function EarningsChart({ data }: Props) {
  return (
    <div role="img" aria-label="Bar chart comparing daily earnings and expenses">
    <ResponsiveContainer width='100%' height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='#f5f5f5'
          vertical={false}
        />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 12, fill: '#929292' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#929292' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            backgroundColor: '#ffffff',
            border: 'none',
            boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.08) 0px 4px 8px',
            color: '#222222',
          }}
          cursor={{ fill: 'transparent' }}
        />
        <Legend
          iconType='square'
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar
          dataKey='earnings'
          name='Earnings'
          fill='#00a67e'
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey='expenses'
          name='Expenses'
          fill='#ff385c'
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}
