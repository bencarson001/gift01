import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Loader2, BookOpen, PoundSterling, ShoppingBag, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, isAfter } from "date-fns";

const COLORS = ["#7B5EA7", "#D4A853", "#E8A0BF", "#4A2D7A", "#F0D88A", "#FF6B6B", "#4ECDC4"];

export default function Dashboard() {
  const { data: books = [], isLoading: booksLoading } = useQuery({
    queryKey: ["all-books"],
    queryFn: () => base44.entities.Book.list("-created_date", 500),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["all-orders"],
    queryFn: () => base44.entities.Order.list("-created_date", 500),
  });

  const isLoading = booksLoading || ordersLoading;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.price_gbp || 0), 0);
    const totalBooks = books.length;
    const paidOrders = orders.filter(o => o.status === "paid").length;
    const last30Days = orders.filter(o => o.created_date && isAfter(new Date(o.created_date), subDays(new Date(), 30)));
    const monthlyRevenue = last30Days.reduce((sum, o) => sum + (o.price_gbp || 0), 0);

    return { totalRevenue, totalBooks, paidOrders, monthlyRevenue };
  }, [books, orders]);

  const occasionData = useMemo(() => {
    const counts = {};
    books.forEach(b => {
      const occ = b.occasion || "other";
      counts[occ] = (counts[occ] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [books]);

  const revenueByDay = useMemo(() => {
    const last14 = [];
    for (let i = 13; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOrders = orders.filter(o => o.created_date && format(new Date(o.created_date), "yyyy-MM-dd") === dateStr);
      const revenue = dayOrders.reduce((sum, o) => sum + (o.price_gbp || 0), 0);
      last14.push({ date: format(date, "d MMM"), revenue, orders: dayOrders.length });
    }
    return last14;
  }, [orders]);

  const productSplit = useMemo(() => {
    const counts = { digital: 0, printed: 0, subscription: 0 };
    orders.forEach(o => { if (counts[o.product_type] !== undefined) counts[o.product_type]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `£${stats.totalRevenue.toFixed(2)}`, icon: PoundSterling, color: "text-green-600 bg-green-100" },
            { label: "Books Created", value: stats.totalBooks, icon: BookOpen, color: "text-purple-600 bg-purple-100" },
            { label: "Orders", value: stats.paidOrders, icon: ShoppingBag, color: "text-amber-600 bg-amber-100" },
            { label: "This Month", value: `£${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, color: "text-blue-600 bg-blue-100" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{stat.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Revenue (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#7B5EA7" strokeWidth={2} dot={{ fill: "#D4A853" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Top Occasions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occasionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#7B5EA7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Product Split</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={productSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {productSplit.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}