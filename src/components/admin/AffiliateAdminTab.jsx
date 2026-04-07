import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, ShoppingBag, TrendingUp, MousePointerClick, PoundSterling, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const CATEGORY_LABELS = {
  gifts: "🎁 Gifts",
  stationery: "✏️ Stationery",
  home_decor: "🏡 Home Decor",
  personalised: "💝 Personalised",
  trending: "🔥 Trending",
  wrapping: "🎀 Gift Wrapping",
  cards: "💌 Cards & Paper",
  experiences: "🎟️ Experiences",
};

export default function AffiliateAdminTab() {
  const [curating, setCurating] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-affiliate-products"],
    queryFn: () => base44.entities.AffiliateProduct.list("-performance_score", 500),
  });

  const activeProducts = products.filter(p => p.is_active);
  const inactiveProducts = products.filter(p => !p.is_active);
  const totalClicks = products.reduce((s, p) => s + (p.click_count || 0), 0);
  const totalRevenue = products.reduce((s, p) => s + (p.estimated_revenue_gbp || 0), 0);

  const handleCurate = async () => {
    setCurating(true);
    try {
      const res = await base44.functions.invoke("curateAffiliateProducts", {});
      toast.success(`Curation complete! Added ${res.data?.added || 0} products, removed ${res.data?.deactivated || 0} low performers.`);
      queryClient.invalidateQueries({ queryKey: ["admin-affiliate-products"] });
    } catch (err) {
      toast.error("Curation failed: " + err.message);
    }
    setCurating(false);
  };

  const toggleActive = async (product) => {
    await base44.entities.AffiliateProduct.update(product.id, { is_active: !product.is_active });
    queryClient.invalidateQueries({ queryKey: ["admin-affiliate-products"] });
  };

  const deleteProduct = async (id) => {
    await base44.entities.AffiliateProduct.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-affiliate-products"] });
  };

  const filtered = filterCat === "all" ? activeProducts : activeProducts.filter(p => p.category === filterCat);

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShoppingBag, label: "Active Products", value: activeProducts.length, color: "bg-purple-500" },
          { icon: TrendingUp, label: "Trending Items", value: activeProducts.filter(p => p.is_trending).length, color: "bg-red-400" },
          { icon: MousePointerClick, label: "Total Clicks", value: totalClicks.toLocaleString(), color: "bg-blue-500" },
          { icon: PoundSterling, label: "Est. Revenue", value: `£${totalRevenue.toFixed(2)}`, color: "bg-green-500" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-semibold text-gray-900">Weekly AI Curation</h3>
            <p className="text-xs text-gray-400 mt-0.5">Runs automatically every Monday at 6am · Refreshes bottom 40% with new AI picks</p>
          </div>
          <Button
            onClick={handleCurate}
            disabled={curating}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl gap-2"
          >
            {curating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {curating ? "Curating..." : "Run Curation Now"}
          </Button>
        </div>
        {curating && (
          <div className="mt-4 bg-purple-50 rounded-xl p-4 text-sm text-purple-700">
            🤖 AI is researching UK Amazon bestsellers and curating products for each category... This takes about 1-2 minutes.
          </div>
        )}
      </div>

      {/* Product list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-900">Active Products ({activeProducts.length})</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterCat("all")}
              className={`px-3 py-1 rounded-xl text-xs font-medium ${filterCat === "all" ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              All
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={`px-3 py-1 rounded-xl text-xs font-medium ${filterCat === key ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wide border-b border-gray-50">
                  <th className="pb-3 text-left font-medium">Product</th>
                  <th className="pb-3 text-left font-medium">Category</th>
                  <th className="pb-3 text-left font-medium">Price</th>
                  <th className="pb-3 text-left font-medium">Clicks</th>
                  <th className="pb-3 text-left font-medium">Score</th>
                  <th className="pb-3 text-left font-medium">Week</th>
                  <th className="pb-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.slice(0, 50).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 max-w-[200px]">
                      <p className="font-medium text-gray-900 truncate text-xs">{p.title}</p>
                      {p.badge && <span className="text-[10px] text-amber-600 font-medium">{p.badge}</span>}
                    </td>
                    <td className="py-2.5 text-xs text-gray-500">{CATEGORY_LABELS[p.category] || p.category}</td>
                    <td className="py-2.5 font-semibold text-gray-700">{p.price_gbp ? `£${p.price_gbp.toFixed(2)}` : "—"}</td>
                    <td className="py-2.5 text-gray-600">{p.click_count || 0}</td>
                    <td className="py-2.5 font-medium text-purple-700">{(p.performance_score || 0).toFixed(1)}</td>
                    <td className="py-2.5 text-xs text-gray-400">{p.week_added || "—"}</td>
                    <td className="py-2.5">
                      <div className="flex gap-1">
                        <button onClick={() => toggleActive(p)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Toggle visibility">
                          {p.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" className="p-1 rounded-lg hover:bg-amber-50 text-amber-500" title="View on Amazon">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </a>
                        <button onClick={() => deleteProduct(p.id)} className="p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No products yet — run curation to populate</p>}
          </div>
        )}
      </div>
    </div>
  );
}