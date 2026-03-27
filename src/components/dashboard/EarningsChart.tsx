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
    <ResponsiveContainer width='100%' height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='rgba(0,0,0,0.06)'
          vertical={false}
        />
        <XAxis
          dataKey='label'
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            // border: '1px solid rgba(0,0,0,0.1)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
          cursor={{ fill: 'transparent' }}
        />
        {/* <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                    }}
                    itemStyle={{
                      color: '#e2e8f0',
                      fontSize: '13px',
                    }}
                    labelStyle={{
                      color: '#94a3b8',
                      fontSize: '12px',
                      marginBottom: '4px',
                    }}
                    cursor={{ fill: 'transparent' }}
                  /> */}
        <Legend
          iconType='square'
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
        <Bar
          dataKey='earnings'
          name='Earnings'
          fill='#1D9E75'
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
        <Bar
          dataKey='expenses'
          name='Expenses'
          fill='#F0997B'
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
