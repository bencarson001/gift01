import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  PoundSterling, BookOpen, TrendingUp, ShoppingBag,
  Lock, RefreshCw, Clock, Bell, MessageSquare, CheckCheck, BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format, startOfDay, startOfMonth, isAfter } from "date-fns";
import InsightsTab from "../components/admin/InsightsTab";

const OCCASION_LABELS = {
  birthday: "🎂 Birthday", anniversary: "💍 Anniversary", baby: "👶 Baby",
  wedding: "💒 Wedding", roast: "🔥 Roast", kids_adventure: "🏰 Kids",
  couples_love_story: "💕 Couples", corporate_thank_you: "🏆 Corporate",
  valentines: "❤️ Valentine", retirement: "🎉 Retirement",
  graduation: "🎓 Graduation", new_home: "🏡 New Home",
  get_well: "🌸 Get Well", christmas: "🎄 Christmas",
  mothers_day: "🌷 Mother's", fathers_day: "⚽ Father's",
  friendship: "🤝 Friendship", pet_tribute: "🐾 Pet",
  travel_memoir: "✈️ Travel", teacher_appreciation: "📚 Teacher",
};

const PLAN_COLORS = { digital: "#7B5EA7", printed: "#D4A853", subscription: "#4ECDC4" };

const TABS = ["Overview", "Feedback", "Insights"];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </motion.div>
  );
}

function PasswordGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const attempt = async () => {
    setChecking(true);
    try {
      const res = await base44.functions.invoke("getAdminPassword", {});
      const correct = res.data?.password;
      if (pw === correct) {
        onUnlock();
      } else {
        setError(true);
        setPw("");
      }
    } catch {
      setError(true);
      setPw("");
    }
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-sm text-center"
      >
        <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-purple-600" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 mb-1">Admin Access</h1>
        <p className="text-gray-400 text-sm mb-6">Enter the admin password to continue</p>
        <Input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === "Enter" && attempt()}
          placeholder="Password"
          className={`h-12 rounded-xl mb-3 ${error ? "border-red-400 focus:border-red-400" : ""}`}
        />
        {error && <p className="text-red-500 text-xs mb-3">Incorrect password</p>}
        <Button onClick={attempt} disabled={checking} className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
          {checking ? "Checking..." : "Unlock Dashboard"}
        </Button>
      </motion.div>
    </div>
  );
}

function FeedbackTab({ feedback, onMarkRead, onMarkAllRead }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{feedback.length} total submissions</p>
        <Button variant="outline" size="sm" onClick={onMarkAllRead} className="rounded-xl gap-2 text-xs">
          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
        </Button>
      </div>
      {feedback.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedback.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                !item.is_read ? "border-purple-200 shadow-sm shadow-purple-100" : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700 shrink-0">
                    {item.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                    {item.email && <p className="text-xs text-gray-400">{item.email}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!item.is_read && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full" title="Unread" />
                  )}
                  <p className="text-xs text-gray-400">
                    {item.created_date ? format(new Date(item.created_date), "d MMM, HH:mm") : "—"}
                  </p>
                  {!item.is_read && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{item.comment}</p>
              {item.page && (
                <p className="mt-2 text-xs text-gray-400 font-mono">Page: {item.page}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const queryClient = useQueryClient();

  const { data: orders = [], refetch: refetchOrders, isFetching: fetchingOrders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 200),
    enabled: unlocked,
    refetchInterval: 30000,
  });

  const { data: books = [], refetch: refetchBooks } = useQuery({
    queryKey: ["admin-books"],
    queryFn: () => base44.entities.Book.list("-created_date", 200),
    enabled: unlocked,
    refetchInterval: 30000,
  });

  const { data: feedback = [], refetch: refetchFeedback } = useQuery({
    queryKey: ["admin-feedback"],
    queryFn: () => base44.entities.Feedback.list("-created_date", 200),
    enabled: unlocked,
    refetchInterval: 30000,
  });

  const unreadCount = feedback.filter(f => !f.is_read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Feedback.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = feedback.filter(f => !f.is_read);
      await Promise.all(unread.map(f => base44.entities.Feedback.update(f.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const monthStart = startOfMonth(now);

    const paidOrders = orders.filter(o => o.status === "paid" || o.status === "processing" || o.status === "shipped" || o.status === "delivered");
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.price_gbp || 0), 0);

    const todayOrders = paidOrders.filter(o => isAfter(new Date(o.created_date), todayStart));
    const monthOrders = paidOrders.filter(o => isAfter(new Date(o.created_date), monthStart));

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.price_gbp || 0), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.price_gbp || 0), 0);

    const occasionCounts = {};
    books.forEach(b => {
      if (b.occasion) occasionCounts[b.occasion] = (occasionCounts[b.occasion] || 0) + 1;
    });
    const topOccasions = Object.entries(occasionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([key, count]) => ({ name: OCCASION_LABELS[key] || key, count }));

    const planCounts = { digital: 0, printed: 0, subscription: 0 };
    paidOrders.forEach(o => { if (planCounts[o.product_type] !== undefined) planCounts[o.product_type]++; });

    return {
      totalRevenue, todayRevenue, monthRevenue,
      totalOrders: paidOrders.length,
      todayOrders: todayOrders.length,
      monthOrders: monthOrders.length,
      totalBooks: books.length,
      topOccasions,
      planCounts,
      recentOrders: orders.slice(0, 10),
    };
  }, [orders, books]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const refetchAll = () => { refetchOrders(); refetchBooks(); refetchFeedback(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-xl font-bold text-gray-900">
              GiftMyBook<span className="text-amber-500">UK</span>
              <span className="ml-2 text-sm font-normal text-gray-400">Admin</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Notification bell */}
            <button
              onClick={() => setActiveTab("Feedback")}
              className="relative p-2 rounded-xl hover:bg-purple-50 transition-colors"
              title="Feedback notifications"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <a href="/LaunchChecklist" className="text-xs font-medium text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition-colors hidden sm:flex items-center gap-1.5">
              🚀 Launch Checklist
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={refetchAll}
              className="text-gray-500 rounded-xl gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchingOrders ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
                activeTab === tab
                  ? "border-purple-600 text-purple-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "Feedback" && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === "Insights" && <BarChart2 className="w-3.5 h-3.5" />}
              {tab}
              {tab === "Feedback" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {activeTab === "Overview" && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={PoundSterling} label="Total Revenue" value={`£${stats.totalRevenue.toFixed(2)}`} sub={`${stats.totalOrders} paid orders`} color="bg-purple-500" />
              <StatCard icon={TrendingUp} label="Revenue Today" value={`£${stats.todayRevenue.toFixed(2)}`} sub={`${stats.todayOrders} orders`} color="bg-amber-400" />
              <StatCard icon={ShoppingBag} label="This Month" value={`£${stats.monthRevenue.toFixed(2)}`} sub={`${stats.monthOrders} orders`} color="bg-green-500" />
              <StatCard icon={BookOpen} label="Books Created" value={stats.totalBooks} sub="all time" color="bg-rose-400" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Occasions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Top Occasions</h2>
                {stats.topOccasions.length === 0 ? (
                  <p className="text-gray-400 text-sm">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.topOccasions} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                        {stats.topOccasions.map((_, i) => (
                          <Cell key={i} fill={`hsl(${270 - i * 18}, 60%, ${55 + i * 3}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Product Split */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-5">Sales by Product</h2>
                <div className="space-y-4 mt-2">
                  {Object.entries(stats.planCounts).map(([plan, count]) => {
                    const total = Object.values(stats.planCounts).reduce((a, b) => a + b, 0) || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize font-medium text-gray-700">{plan}</span>
                          <span className="text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: PLAN_COLORS[plan] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">Recent Orders</h2>
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-400 text-sm">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                        <th className="pb-3 text-left font-medium">Order ID</th>
                        <th className="pb-3 text-left font-medium">Product</th>
                        <th className="pb-3 text-left font-medium">Email</th>
                        <th className="pb-3 text-left font-medium">Amount</th>
                        <th className="pb-3 text-left font-medium">Status</th>
                        <th className="pb-3 text-left font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-mono text-xs text-gray-400">{order.id?.slice(0, 8)}…</td>
                          <td className="py-3">
                            <span className="capitalize font-medium text-gray-700">{order.product_type}</span>
                          </td>
                          <td className="py-3 text-gray-500">{order.recipient_email || "—"}</td>
                          <td className="py-3 font-semibold text-gray-900">£{(order.price_gbp || 0).toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "paid" ? "bg-green-100 text-green-700" :
                              order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.created_date ? format(new Date(order.created_date), "d MMM, HH:mm") : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Feedback" && (
          <FeedbackTab
            feedback={feedback}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onMarkAllRead={() => markAllReadMutation.mutate()}
          />
        )}

        {activeTab === "Insights" && <InsightsTab />}
      </div>
    </div>
  );
}