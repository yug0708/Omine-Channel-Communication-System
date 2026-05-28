import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  TooltipContentProps
} from 'recharts';

import {
  IncomingCallIcon,
  OutgoingCallIcon,
  NoAnswerIcon,
  TotalCallsIcon,
  FilterIcon
} from '../components/icons/Icons';

import { useTheme } from '../hooks/useTheme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChartDataPoint {
  name: string;
  incoming: number;
  outgoing: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

// ─── Static chart data ───────────────────────────────────────────────────────

const CHART_DATA: ChartDataPoint[] = [
  { name: 'Mon', incoming: 20, outgoing: 12 },
  { name: 'Tue', incoming: 32, outgoing: 18 },
  { name: 'Wed', incoming: 28, outgoing: 25 },
  { name: 'Thu', incoming: 40, outgoing: 30 },
  { name: 'Fri', incoming: 35, outgoing: 22 },
  { name: 'Sat', incoming: 18, outgoing: 10 },
  { name: 'Sun', incoming: 24, outgoing: 15 },
];

const FILTER_OPTIONS = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days'] as const;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
      <p className="text-xs font-bold mb-2 text-slate-700 dark:text-slate-200">{label}</p>
      {payload.map((item) => (
        <div
          key={String(item.dataKey)}
          className="flex items-center justify-between gap-4 text-sm"
          style={{ color: item.color }}
        >
          <span className="capitalize">{item.dataKey}</span>
          <span className="font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div
        className="h-12 w-12 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
    </div>
    <p className="text-sm text-slate-500 mb-1">{title}</p>
    <h2 className="text-4xl font-black text-slate-900 dark:text-white">{value}</h2>
  </div>
);

// ─── Dashboard Page ───────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedFilter, setSelectedFilter] = useState<string>('Last 7 Days');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Chart data is static; swap this for an API call keyed on `selectedFilter` when needed.
  const chartData: ChartDataPoint[] = CHART_DATA;

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-950">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 mt-2">Overview of communication performance</p>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={isFilterOpen}
          >
            <FilterIcon className="h-4 w-4" />
            {selectedFilter}
          </button>

          {isFilterOpen && (
            <div
              role="listbox"
              className="absolute top-14 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50"
            >
              {FILTER_OPTIONS.map((option) => (
                <button
                  key={option}
                  role="option"
                  aria-selected={selectedFilter === option}
                  onClick={() => {
                    setSelectedFilter(option);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedFilter === option
                    ? 'bg-slate-100 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard title="Incoming Calls" value={124} icon={IncomingCallIcon} color="#8B5CF6" />
        <StatCard title="Outgoing Calls" value={98} icon={OutgoingCallIcon} color="#10B981" />
        <StatCard title="No Answer" value={12} icon={NoAnswerIcon} color="#EF4444" />
        <StatCard title="Total Calls" value={234} icon={TotalCallsIcon} color="#06B6D4" />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Call Analytics</h2>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="grad-incoming" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="grad-outgoing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#334155' : '#E2E8F0'}
            />

            <XAxis
              dataKey="name"
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            <Tooltip content={CustomTooltip} />

            <Area
              type="monotone"
              dataKey="incoming"
              stroke="#8B5CF6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#grad-incoming)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />

            <Area
              type="monotone"
              dataKey="outgoing"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#grad-outgoing)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
