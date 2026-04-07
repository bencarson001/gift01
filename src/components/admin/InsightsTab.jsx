import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Eye, Users, BookOpen, MousePointerClick } from 'lucide-react';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#7B5EA7', '#D4A853', '#4ECDC4', '#F59E0B', '#10B981', '#EF4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function InsightsTab() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: () => base44.entities.AnalyticsEvent.list('-created_date', 1000),
  });

  const stats = useMemo(() => {
    const byType = events.reduce((acc, e) => { acc[e.event_type] = (acc[e.event_type] || 0) + 1; return acc; }, {});
    const byPage = events.reduce((acc, e) => { if (e.page) acc[e.page] = (acc[e.page] || 0) + 1; return acc; }, {});
    const byDevice = events.reduce((acc, e) => { if (e.device_type) acc[e.device_type] = (acc[e.device_type] || 0) + 1; return acc; }, {});
    const byOccasion = events.reduce((acc, e) => { if (e.occasion) acc[e.occasion] = (acc[e.occasion] || 0) + 1; return acc; }, {});

    const topPages = Object.entries(byPage).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topOccasions = Object.entries(byOccasion).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Daily views last 30 days
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    const dailyViews = days.map(day => ({
      date: format(day, 'd MMM'),
      Views: events.filter(e =>
        e.event_type === 'page_view' &&
        startOfDay(new Date(e.created_date)).getTime() === day.getTime()
      ).length,
      Sessions: events.filter(e =>
        e.event_type === 'session_end' &&
        startOfDay(new Date(e.created_date)).getTime() === day.getTime()
      ).length,
    }));

    // Page views breakdown for bar chart
    const pageViewData = topPages.map(([page, count]) => ({ page, Views: count }));

    // Device pie
    const deviceData = Object.entries(byDevice).map(([name, value]) => ({ name, value }));

    const uniqueSessions = new Set(events.map(e => e.session_id).filter(Boolean)).size;
    const pageViews = byType['page_view'] || 0;
    const booksStarted = byType['book_created'] || 0;
    const purchases = byType['purchase_started'] || 0;

    return { byType, topPages, topOccasions, dailyViews, pageViewData, deviceData, uniqueSessions, pageViews, booksStarted, purchases, totalEvents: events.length };
  }, [events]);

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Page Views', value: stats.pageViews.toLocaleString(), icon: Eye, color: 'bg-purple-500' },
          { label: 'Unique Sessions', value: stats.uniqueSessions.toLocaleString(), icon: Users, color: 'bg-blue-500' },
          { label: 'Books Started', value: stats.booksStarted.toLocaleString(), icon: BookOpen, color: 'bg-amber-400' },
          { label: 'Checkout Clicks', value: stats.purchases.toLocaleString(), icon: MousePointerClick, color: 'bg-green-500' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{card.label}</span>
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily views chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 text-sm">📈 Page Views — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.dailyViews} margin={{ left: -20, right: 0 }}>
            <defs>
              <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B5EA7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
              interval={Math.floor(stats.dailyViews.length / 6)} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="Views" stroke="#7B5EA7" strokeWidth={2} fill="url(#viewsGrad)" />
            <Area type="monotone" dataKey="Sessions" stroke="#D4A853" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Page views bar chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 text-sm">🏆 Top Pages by Views</h3>
          {stats.pageViewData.length === 0 ? (
            <p className="text-gray-400 text-sm">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.pageViewData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="page" width={90} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Views" radius={[0, 6, 6, 0]}>
                  {stats.pageViewData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${270 - i * 22}, 58%, ${52 + i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Device + Occasions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm">📱 Device Split</h3>
            {stats.deviceData.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={100}>
                  <PieChart>
                    <Pie data={stats.deviceData} cx="50%" cy="50%" innerRadius={28} outerRadius={45} dataKey="value" paddingAngle={3}>
                      {stats.deviceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {stats.deviceData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize text-gray-600">{d.name}</span>
                      <span className="font-bold text-gray-900 ml-auto pl-3">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">🎂 Top Occasions Searched</h3>
            <div className="space-y-2">
              {stats.topOccasions.map(([occ, count], i) => {
                const max = stats.topOccasions[0]?.[1] || 1;
                return (
                  <div key={occ}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize text-gray-600">{occ.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / max) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
              {stats.topOccasions.length === 0 && <p className="text-gray-400 text-xs">No data yet</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Recent Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                <th className="pb-3 text-left font-medium">Type</th>
                <th className="pb-3 text-left font-medium">Page</th>
                <th className="pb-3 text-left font-medium">Device</th>
                <th className="pb-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.slice(0, 25).map((ev) => (
                <tr key={ev.id} className="hover:bg-gray-50/50">
                  <td className="py-2">
                    <span className="bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="py-2 text-gray-600 text-xs">{ev.page || '—'}</td>
                  <td className="py-2 text-gray-500 capitalize text-xs">{ev.device_type || '—'}</td>
                  <td className="py-2 text-gray-400 text-xs">
                    {ev.created_date ? format(new Date(ev.created_date), 'd MMM, HH:mm') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}