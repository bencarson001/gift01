import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { ArrowLeft, TrendingUp, BookOpen, PoundSterling, Star, Loader2 } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

const OCCASION_LABELS = {
  birthday: "Birthday", anniversary: "Anniversary", baby: "Baby",
  wedding: "Wedding", roast: "Roast", kids_adventure: "Kids Story",
  couples_love_story: "Love Story", valentines: "Valentine's",
  graduation: "Graduation", christmas: "Christmas",
  mothers_day: "Mother's Day", fathers_day: "Father's Day",
  retirement: "Retirement", new_home: "New Home", get_well: "Get Well",
  friendship: "Friendship", pet_tribute: "Pet", travel_memoir: "Travel",
  teacher_appreciation: "Teacher", corporate_thank_you: "Corporate",
};

const OCCASION_EMOJIS = {
  birthday: "🎂", anniversary: "💍", baby: "👶", wedding: "💒",
  roast: "🔥", kids_adventure: "🏰", couples_love_story: "💕",
  valentines: "❤️", graduation: "🎓", christmas: "🎄",
  mothers_day: "🌷", fathers_day: "⚽", retirement: "🎉",
  new_home: "🏡", get_well: "🌸", friendship: "🤝",
  pet_tribute: "🐾", travel_memoir: "✈️", teacher_appreciation: "📚",
  corporate_thank_you: "🏆",
};

const COLORS = ["#7B5EA7", "#D4A853", "#4ECDC4", "#FF6B9D", "#A78BFA", "#34D399", "#F97316", "#60A5FA"];

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
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
          {p.name}: {typeof p.value === "number" && p.name?.includes("£") ? `£${p.value.toFixed(2)}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Insights() {
  const { data: books = [], isLoading: loadingBooks } = useQuery({
    queryKey: ["insights-books"],
    queryFn: () => base44.entities.Book.list("-created_date", 500),
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["insights-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const { data: feedback = [], isLoading: loadingFeedback } = useQuery({
    queryKey: ["insights-feedback"],
    queryFn: () => base44.entities.Feedback.list("-created_date", 200),
  });

  const isLoading = loadingBooks || loadingOrders || loadingFeedback;

  const stats = useMemo(() => {
    const paidOrders = orders.filter(o => ["paid", "processing", "shipped", "delivered"].includes(o.status));
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.price_gbp || 0), 0);
    const conversionRate = books.length > 0 ? ((paidOrders.length / books.length) * 100).toFixed(1) : 0;
    const avgOrderValue = paidOrders.length > 0 ? (totalRevenue / paidOrders.length).toFixed(2) : 0;

    // Books created per day (last 30 days)
    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 29);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    const booksPerDay = days.map(day => {
      const label = format(day, "d MMM");
      const count = books.filter(b => {
        const d = startOfDay(new Date(b.created_date));
        return d.getTime() === day.getTime();
      }).length;
      return { date: label, Books: count };
    });

    // Revenue per month (last 6 months)
    const sixMonthsAgo = subMonths(startOfMonth(new Date()), 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: new Date() });
    const revenuePerMonth = months.map(month => {
      const label = format(month, "MMM yy");
      const revenue = paidOrders
        .filter(o => {
          const d = new Date(o.created_date);
          return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
        })
        .reduce((s, o) => s + (o.price_gbp || 0), 0);
      return { month: label, "£ Revenue": parseFloat(revenue.toFixed(2)) };
    });

    // Occasions breakdown
    const occasionMap = {};
    books.forEach(b => {
      if (b.occasion) occasionMap[b.occasion] = (occasionMap[b.occasion] || 0) + 1;
    });
    const occasionData = Object.entries(occasionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, value]) => ({
        name: `${OCCASION_EMOJIS[key] || ""} ${OCCASION_LABELS[key] || key}`,
        value,
      }));

    // Product split
    const productMap = { digital: 0, printed: 0, subscription: 0 };
    paidOrders.forEach(o => { if (productMap[o.product_type] !== undefined) productMap[o.product_type]++; });
    const productData = Object.entries(productMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Art style popularity
    const artMap = {};
    books.forEach(b => { if (b.art_style) artMap[b.art_style] = (artMap[b.art_style] || 0) + 1; });
    const artData = Object.entries(artMap)
      .sort((a, b) => b[1] - a[1])
      .map(([style, count]) => ({ style: style.charAt(0).toUpperCase() + style.slice(1), count }));

    return {
      totalRevenue, conversionRate, avgOrderValue,
      totalBooks: books.length,
      totalOrders: paidOrders.length,
      feedbackCount: feedback.length,
      booksPerDay,
      revenuePerMonth,
      occasionData,
      productData,
      artData,
    };
  }, [books, orders, feedback]);

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("MyLibrary")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" /> Insights
          </h1>
          <span className="text-xs text-gray-400 ml-1">Analytics & Trends</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={PoundSterling} label="Total Revenue" value={`£${stats.totalRevenue.toFixed(2)}`} sub={`${stats.totalOrders} paid orders`} color="bg-purple-500" delay={0} />
            <StatCard icon={BookOpen} label="Books Created" value={stats.totalBooks} sub="all time" color="bg-amber-400" delay={0.05} />
            <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate}%`} sub="books → purchases" color="bg-emerald-500" delay={0.1} />
            <StatCard icon={Star} label="Avg. Order Value" value={`£${stats.avgOrderValue}`} sub={`${stats.feedbackCount} feedback items`} color="bg-rose-400" delay={0.15} />
          </div>

          {/* Books per day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Books Created — Last 30 Days</h2>
            <p className="text-xs text-gray-400 mb-5">Daily book creation activity</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stats.booksPerDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="booksGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B5EA7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7B5EA7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                  interval={Math.floor(stats.booksPerDay.length / 6)} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Books" stroke="#7B5EA7" strokeWidth={2} fill="url(#booksGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue per month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-1">Revenue — Last 6 Months</h2>
            <p className="text-xs text-gray-400 mb-5">Monthly paid order revenue in GBP</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenuePerMonth} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="£ Revenue" fill="#D4A853" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Occasions breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-1">Top Occasions</h2>
              <p className="text-xs text-gray-400 mb-5">Most popular book types</p>
              {stats.occasionData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.occasionData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" name="Books" radius={[0, 6, 6, 0]}>
                      {stats.occasionData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Product split pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-1">Sales by Product</h2>
              <p className="text-xs text-gray-400 mb-5">Digital vs Printed vs Subscription</p>
              {stats.productData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No sales yet</p>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={stats.productData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        dataKey="value" paddingAngle={3}>
                        {stats.productData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {stats.productData.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600">{d.name}</span>
                        <span className="font-bold text-gray-900 ml-auto pl-4">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Art style popularity */}
          {stats.artData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="font-semibold text-gray-900 mb-1">Art Style Popularity</h2>
              <p className="text-xs text-gray-400 mb-5">Which illustration styles customers prefer</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats.artData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="style" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Books" radius={[6, 6, 0, 0]}>
                    {stats.artData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}