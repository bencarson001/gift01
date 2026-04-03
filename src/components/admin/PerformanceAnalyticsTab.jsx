import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ComposedChart, Area, AreaChart
} from 'recharts';
import { TrendingUp, Users, Clock, Eye, Target, Zap, Smartphone, Monitor, AlertCircle } from 'lucide-react';

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

function MetricRow({ icon: Icon, label, value, unit = '', trend = null, color = 'text-gray-600' }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-${color.split('-')[1]}-100 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900">{value}{unit}</span>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function PerformanceAnalyticsTab() {
  // Simulated performance data - in production, this would come from analytics API
  const performanceData = useMemo(() => {
    // Page load time data (last 14 days)
    const pageLoadData = [
      { day: 'Mon', home: 1.2, create: 2.1, checkout: 2.8 },
      { day: 'Tue', home: 1.1, create: 2.0, checkout: 2.6 },
      { day: 'Wed', home: 1.3, create: 2.3, checkout: 2.9 },
      { day: 'Thu', home: 1.0, create: 1.9, checkout: 2.5 },
      { day: 'Fri', home: 1.4, create: 2.4, checkout: 3.1 },
      { day: 'Sat', home: 1.5, create: 2.5, checkout: 3.2 },
      { day: 'Sun', home: 1.2, create: 2.0, checkout: 2.7 },
    ];

    // Traffic by source
    const trafficData = [
      { source: 'Direct', value: 2400, percentage: 35 },
      { source: 'Organic', value: 1800, percentage: 26 },
      { source: 'Social', value: 1200, percentage: 17 },
      { source: 'Referral', value: 900, percentage: 13 },
      { source: 'Email', value: 600, percentage: 9 },
    ];

    // Device breakdown
    const deviceData = [
      { name: 'Desktop', value: 3800, percentage: 54 },
      { name: 'Mobile', value: 2600, percentage: 37 },
      { name: 'Tablet', value: 600, percentage: 9 },
    ];

    // Conversion funnel
    const conversionFunnel = [
      { stage: 'Home Visit', users: 7000, conversion: 100 },
      { stage: 'Create Book', users: 3500, conversion: 50 },
      { stage: 'Preview', users: 2100, conversion: 30 },
      { stage: 'Checkout', users: 1470, conversion: 21 },
      { stage: 'Purchase', users: 588, conversion: 8.4 },
    ];

    // User engagement hourly
    const hourlyData = [
      { hour: '00:00', users: 120 },
      { hour: '04:00', users: 85 },
      { hour: '08:00', users: 450 },
      { hour: '12:00', users: 820 },
      { hour: '16:00', users: 950 },
      { hour: '20:00', users: 1200 },
      { hour: '23:59', users: 400 },
    ];

    // Core metrics
    const metrics = {
      totalSessionsToday: 2847,
      avgSessionDuration: '4m 32s',
      bounceRate: 42.3,
      conversionRate: 8.4,
      avgPageLoad: 1.8,
      mobileTraffic: 37,
      peakHour: '16:00-17:00',
      avgOrderValue: 24.87,
    };

    return {
      pageLoadData,
      trafficData,
      deviceData,
      conversionFunnel,
      hourlyData,
      metrics,
    };
  }, []);

  const colors = {
    primary: '#7B5EA7',
    secondary: '#D4A853',
    accent: '#4ECDC4',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  const chartColors = ['#7B5EA7', '#D4A853', '#4ECDC4', '#F59E0B', '#10B981'];

  return (
    <div className="space-y-8">

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Eye, label: 'Sessions Today', value: '2,847', trend: 12 },
          { icon: Users, label: 'Avg Session', value: '4m 32s', trend: -3 },
          { icon: Target, label: 'Conversion Rate', value: '8.4%', trend: 5 },
          { icon: TrendingUp, label: 'Avg Order Value', value: '£24.87', trend: 8 },
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
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <kpi.icon className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</p>
            <p className={`text-xs font-semibold ${kpi.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.trend > 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}% vs yesterday
            </p>
          </motion.div>
        ))}
      </div>

      {/* Page Load Performance & Traffic Source */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsCard title="📊 Page Load Time (seconds)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData.pageLoadData}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v}s`} />
              <Legend />
              <Line type="monotone" dataKey="home" stroke={colors.primary} dot={{ r: 3 }} name="Home" />
              <Line type="monotone" dataKey="create" stroke={colors.secondary} dot={{ r: 3 }} name="Create Book" />
              <Line type="monotone" dataKey="checkout" stroke={colors.danger} dot={{ r: 3 }} name="Checkout" />
            </LineChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="🌍 Traffic by Source">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={performanceData.trafficData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {performanceData.trafficData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={chartColors[i % chartColors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </AnalyticsCard>
      </div>

      {/* Device Breakdown & Conversion Funnel */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsCard title="📱 Device Breakdown">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={performanceData.deviceData}
              layout="horizontal"
              margin={{ left: 80, right: 20 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v} visitors`} />
              <Bar dataKey="value" fill={colors.primary} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {performanceData.deviceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-semibold text-gray-900">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="🎯 Conversion Funnel">
          <div className="space-y-3">
            {performanceData.conversionFunnel.map((stage, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-xs text-gray-400">{stage.users.toLocaleString()} users</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.conversion}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Conversion: {stage.conversion}%</span>
                  {i < performanceData.conversionFunnel.length - 1 && (
                    <span className="text-amber-600 font-semibold">
                      {(((performanceData.conversionFunnel[i + 1].users / stage.users) * 100 - 100) * -1).toFixed(1)}% drop
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      {/* Hourly Engagement & Performance Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <AnalyticsCard title="⏰ Hourly User Activity">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceData.hourlyData}>
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `${v} users`} />
              <Area type="monotone" dataKey="users" fill={colors.accent} stroke={colors.accent} />
            </AreaChart>
          </ResponsiveContainer>
        </AnalyticsCard>

        <AnalyticsCard title="⚡ Core Metrics">
          <div className="space-y-1">
            <MetricRow icon={Eye} label="Total Sessions (Today)" value="2,847" color="text-blue-600" />
            <MetricRow icon={Clock} label="Avg Page Load" value={`${performanceData.metrics.avgPageLoad}s`} color="text-purple-600" />
            <MetricRow icon={Users} label="Mobile Traffic" value={`${performanceData.metrics.mobileTraffic}%`} color="text-pink-600" />
            <MetricRow icon={AlertCircle} label="Bounce Rate" value={`${performanceData.metrics.bounceRate}%`} color="text-orange-600" />
            <MetricRow icon={Target} label="Peak Hour" value={performanceData.metrics.peakHour} color="text-green-600" />
          </div>
        </AnalyticsCard>
      </div>

      {/* Performance Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">⚠️ Performance Insights</h3>
            <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
              <li>Checkout page load time increased 12% vs last week — optimize images</li>
              <li>Mobile bounce rate at 48% — consider mobile-first redesign</li>
              <li>Peak traffic 16:00-17:00 — ensure capacity for rush hours</li>
              <li>Social traffic down 8% — review recent campaigns</li>
            </ul>
          </div>
        </div>
      </motion.div>

    </div>
  );
}