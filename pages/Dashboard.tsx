import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import {
  IncomingCallIcon,
  OutgoingCallIcon,
  NoAnswerIcon,
  TotalCallsIcon,
  FilterIcon
} from '../components/icons/Icons';

import { useTheme } from '../hooks/useTheme';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
      <p className="text-xs font-bold mb-2">{label}</p>

      {payload.map((item: any) => (
        <div
          key={item.dataKey}
          className="flex items-center justify-between gap-4 text-sm"
          style={{ color: item.color }}
        >
          <span>{item.dataKey}</span>
          <span className="font-bold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  color
}: any) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-1">{title}</p>

      <h2 className="text-4xl font-black text-slate-900 dark:text-white">
        {value}
      </h2>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const [selectedFilter, setSelectedFilter] = useState('Last 7 Days');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days'
  ];

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const data = [
      { name: 'Mon', incoming: 20, outgoing: 12 },
      { name: 'Tue', incoming: 32, outgoing: 18 },
      { name: 'Wed', incoming: 28, outgoing: 25 },
      { name: 'Thu', incoming: 40, outgoing: 30 },
      { name: 'Fri', incoming: 35, outgoing: 22 },
      { name: 'Sat', incoming: 18, outgoing: 10 },
      { name: 'Sun', incoming: 24, outgoing: 15 }
    ];

    setChartData(data);
  }, [selectedFilter]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Overview of communication performance
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-2xl"
          >
            <FilterIcon className="h-4 w-4" />
            {selectedFilter}
          </button>

          {isFilterOpen && (
            <div className="absolute top-14 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedFilter(option);
                    setIsFilterOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Incoming Calls"
          value={124}
          icon={IncomingCallIcon}
          color="#8B5CF6"
        />

        <StatCard
          title="Outgoing Calls"
          value={98}
          icon={OutgoingCallIcon}
          color="#10B981"
        />

        <StatCard
          title="No Answer"
          value={12}
          icon={NoAnswerIcon}
          color="#EF4444"
        />

        <StatCard
          title="Total Calls"
          value={234}
          icon={TotalCallsIcon}
          color="#06B6D4"
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
          Call Analytics
        </h2>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incoming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>

                <linearGradient id="outgoing" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#E2E8F0'}
              />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="incoming"
                stroke="#8B5CF6"
                fillOpacity={1}
                fill="url(#incoming)"
              />

              <Area
                type="monotone"
                dataKey="outgoing"
                stroke="#10B981"
                fillOpacity={1}
                fill="url(#outgoing)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
