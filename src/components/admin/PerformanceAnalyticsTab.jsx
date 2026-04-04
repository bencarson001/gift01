import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, BookOpen, PoundSterling, Target, Zap, Loader2 } from 'lucide-react';
import {
  format, subDays, startOfDay, eachDayOfInterval,
  startOfMonth, eachMonthOfInterval, subMonths, getHours
} from 'date-fns';

const CHART_COLORS = ['#7B5EA7', '#D4A853', '#4ECDC4', '#F59E0B', '#10B981', '#EF4444'];

function AnalyticsCard({ title, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h3 className="font-semibold text-gray-900 mb-5 text-sm">{title}</h3>
      {children}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function PerformanceAnalyticsTab() {
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ['perf-books'],
    queryFn: () => base44.entities.Book.list('-created_date', 500),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['perf-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
  });

  const isLoading = loadingBooks || loadingOrders;

  const stats = useMemo(() => {
    const paidOrders = orders.filter(o =>
      ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)
    );

    const totalRevenue = paidOrders.reduce((s, o) => s + (o.price_gbp || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const conversionRate = books.length > 0 ? (paidOrders.length / books.length) * 100 : 0;

    // Books created per day (last 30 days)
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });
    const booksPerDay = days.map(day => ({
      date: format(day, 'd MMM'),
      Books: books.filter(b => startOfDay(new Date(b.created_date)).getTime() === day.getTime()).length,
      Orders: paidOrders.filter(o => startOfDay(new Date(o.created_date)).getTime() === day.getTime()).length,
    }));

    // Revenue per month (last 6 months)
    const sixMonthsAgo = subMonths(startOfMonth(new Date()), 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: new Date() });
    const revenuePerMonth = months.map(month => ({
      month: format(month, 'MMM yy'),
      Revenue: parseFloat(paidOrders.filter(o => {
        const d = new Date(o.created_date);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      }).reduce((s, o) => s + (o.price_gbp || 0), 0).toFixed(2)),
      Books: books.filter(b => {
        const d = new Date(b.created_date);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      }).length,
    }));

    // Orders by hour of day
    const hourBuckets = Array.from({ length: 8 }, (_, i) => ({
      hour: `${i * 3}:00`,
      Orders: 0,
    }));
    paidOrders.forEach(o => {
      const h = getHours(new Date(o.created_date));
      const bucket = Math.floor(h / 3);
      if (hourBuckets[bucket]) hourBuckets[bucket].Orders++;
    });

    // Product split
    const productMap = { digital: 0, printed: 0, subscription: 0 };
    paidOrders.forEach(o => { if (productMap[o.product_type] !== undefined) productMap[o.product_type]++; });
    const productData = Object.entries(productMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Art style
    const artMap = {};
    books.forEach(b => { if (b.art_style) artMap[b.art_style] = (artMap[b.art_style] || 0) + 1; });
    const artData = Object.entries(artMap).sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

    // Status breakdown
    const statusMap = {};
    orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    return {
      totalRevenue,
      avgOrderValue,
      conversionRate,
      totalBooks: books.length,
      totalOrders: paidOrders.length,
      booksPerDay,
      revenuePerMonth,
      hourBuckets,
      productData,
      artData,
      statusData,
    };
  }, [books, orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: PoundSterling, label: 'Total Revenue', value: `£${stats.totalRevenue.toFixed(2)}`, sub: `${stats.totalOrders} paid orders`, color: 'bg-purple-500' },
          { icon: BookOpen, label: 'Books Created', value: stats.totalBooks, sub: 'all time', color: 'bg-amber-400' },
          { icon: Target, label: 'Conversion Rate', value: `${stats.conversionRate.toFixed(1)}%`, sub: 'books → purchases', color: 'bg-emerald-500' },
          { icon: TrendingUp, label: 'Avg Order Value', value: `£${stats.avgOrderValue.toFixed(2)}`, sub: 'per paid order', color: 'bg-rose-400' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{kpi.label}</span>
              <div className={`w-8 h-8 ${kpi.color} rounded-lg flex items-center justify-center`}>
                <kpi.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Books & Orders per day */}
      <AnalyticsCard title="📅 Daily Activity — Last 30 Days">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={stats.booksPerDay} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="booksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B5EA7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A853" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4A853" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(stats.booksPerDay.length / 6)} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="Books" stroke="#7B5EA7" strokeWidth={2} fill="url(#booksGrad)" />
            <Area type="monotone" dataKey="Orders" stroke="#D4A853" strokeWidth={2} fill="url(#ordersGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </AnalyticsCard>

      {/* Revenue per month & Product split */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsCard title="💰 Monthly Revenue — Last 6 Months">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.revenuePerMonth} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Revenue" name="£ Revenue" fill="#7B5EA7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="🛍️ Sales by Product Type">
          {stats.productData.length === 0 ? (
            <p className="text-gray-400 text-sm py-12 text-center">No sales yet</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={stats.productData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {stats.productData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {stats.productData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                    <span className="font-bold text-gray-900 ml-auto pl-3">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AnalyticsCard>
      </div>

      {/* Hourly orders & Art styles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsCard title="⏰ Orders by Time of Day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.hourBuckets} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Orders" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        {stats.artData.length > 0 && (
          <AnalyticsCard title="🎨 Art Style Popularity">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.artData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Books" radius={[6, 6, 0, 0]}>
                  {stats.artData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        )}
      </div>

      {/* Order status breakdown */}
      {stats.statusData.length > 0 && (
        <AnalyticsCard title="📦 Order Status Breakdown">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.statusData.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{s.name}</p>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      )}

    </div>
  );
}