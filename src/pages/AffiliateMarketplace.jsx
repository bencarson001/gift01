import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Star, ExternalLink, TrendingUp, Sparkles, ArrowLeft, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { key: "all", label: "All Products", emoji: "🛍️" },
  { key: "trending", label: "Trending", emoji: "🔥" },
  { key: "gifts", label: "Gifts", emoji: "🎁" },
  { key: "stationery", label: "Stationery", emoji: "✏️" },
  { key: "personalised", label: "Personalised", emoji: "💝" },
  { key: "home_decor", label: "Home Decor", emoji: "🏡" },
  { key: "cards", label: "Cards & Paper", emoji: "💌" },
  { key: "wrapping", label: "Gift Wrapping", emoji: "🎀" },
  { key: "experiences", label: "Experiences", emoji: "🎟️" },
];

const SORT_OPTIONS = [
  { key: "trending", label: "Trending" },
  { key: "rating", label: "Top Rated" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
  { key: "popular", label: "Most Popular" },
];

const BADGE_COLORS = {
  "Best Seller": "bg-amber-100 text-amber-800 border-amber-200",
  "Top Rated": "bg-purple-100 text-purple-800 border-purple-200",
  "New This Week": "bg-green-100 text-green-800 border-green-200",
  "Trending": "bg-red-100 text-red-800 border-red-200",
};

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  );
}

const ASSOCIATE_TAG = 'giftmybook21-21';

function ensureAffiliateTag(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('tag', ASSOCIATE_TAG);
    return u.toString();
  } catch {
    return url;
  }
}

function ProductCard({ product, onTrackClick }) {
  const handleClick = () => {
    onTrackClick(product.id);
    window.open(ensureAffiliateTag(product.affiliate_url), "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group cursor-pointer flex flex-col"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-amber-50 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">
              {CATEGORIES.find(c => c.key === product.category)?.emoji || "🎁"}
            </span>
          </div>
        )}

        {product.badge && (
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${BADGE_COLORS[product.badge] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {product.badge}
            </span>
          </div>
        )}
        {product.is_trending && !product.badge && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-red-100 text-red-800 border-red-200 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> Trending
            </span>
          </div>
        )}

        {/* Amazon overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
            <ExternalLink className="w-3.5 h-3.5" /> View on Amazon
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-1">{product.title}</p>
        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">{product.description}</p>
        )}

        <div className="mt-auto">
          {product.rating > 0 && (
            <div className="mb-1.5">
              <StarRating rating={product.rating} />
              {product.review_count > 0 && (
                <span className="text-[10px] text-gray-400">({product.review_count?.toLocaleString()} reviews)</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            {product.price_gbp > 0 && (
              <span className="text-base font-bold text-gray-900">£{product.price_gbp?.toFixed(2)}</span>
            )}
            <span className="text-[10px] text-orange-600 font-bold ml-auto">amazon.co.uk</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AffiliateMarketplace() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [priceMax, setPriceMax] = useState(200);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ["affiliate-products"],
    queryFn: () => base44.entities.AffiliateProduct.filter({ is_active: true }, "-performance_score", 300),
  });

  const trackClick = async (productId) => {
    try {
      await base44.functions.invoke("trackAffiliateClick", { product_id: productId });
    } catch {}
  };

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== "all") {
      list = list.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (priceMax < 200) {
      list = list.filter(p => !p.price_gbp || p.price_gbp <= priceMax);
    }

    switch (sortBy) {
      case "trending": list.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0) || (b.performance_score || 0) - (a.performance_score || 0)); break;
      case "rating": list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case "price_asc": list.sort((a, b) => (a.price_gbp || 0) - (b.price_gbp || 0)); break;
      case "price_desc": list.sort((a, b) => (b.price_gbp || 0) - (a.price_gbp || 0)); break;
      case "popular": list.sort((a, b) => (b.click_count || 0) - (a.click_count || 0)); break;
    }

    return list;
  }, [products, activeCategory, search, sortBy, priceMax]);

  const trendingCount = products.filter(p => p.is_trending).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link to={createPageUrl("Home")} className="text-gray-400 hover:text-gray-600 shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="font-serif text-xl font-bold text-gray-900">
                Gift Marketplace <span className="text-amber-500">✨</span>
              </h1>
              <p className="text-xs text-gray-400">Curated Amazon picks · Updated weekly · {products.length} products</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {trendingCount > 0 && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  <TrendingUp className="w-3 h-3" /> {trendingCount} trending
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 rounded-xl"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search gifts, stationery, home decor..."
              className="pl-9 h-10 rounded-xl bg-gray-50 border-gray-200 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-gray-50 overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Sort By</p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSortBy(opt.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${sortBy === opt.key ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300"}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Max Price: £{priceMax === 200 ? "Any" : priceMax}</p>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 20, 50, 100, 200].map(p => (
                      <button
                        key={p}
                        onClick={() => setPriceMax(p)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${priceMax === p ? "bg-amber-400 text-gray-900" : "bg-white border border-gray-200 text-gray-600 hover:border-amber-300"}`}
                      >
                        {p === 200 ? "Any" : `Under £${p}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-0">
          <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat.key
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                }`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state — prompt admin to curate */
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Marketplace is empty</h2>
            <p className="text-gray-500 mb-2 max-w-sm mx-auto">The AI agent hasn't curated products yet. Run the weekly curation from the Admin dashboard.</p>
            <p className="text-xs text-gray-400">Products are automatically refreshed every Monday.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">No products found</h3>
            <p className="text-gray-500 text-sm">Try a different search or category</p>
            <button onClick={() => { setSearch(""); setActiveCategory("all"); setPriceMax(200); }} className="mt-3 text-purple-600 text-sm font-medium hover:underline">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filtered.length}</span> products
                {activeCategory !== "all" && ` in ${CATEGORIES.find(c => c.key === activeCategory)?.label}`}
              </p>
              <p className="text-xs text-gray-400">
                <Sparkles className="w-3 h-3 inline mr-1 text-amber-400" />
                AI-curated weekly · Affiliate links support this site
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} onTrackClick={trackClick} />
              ))}
            </div>

            <div className="mt-8 text-center text-xs text-gray-400">
              <p>As an Amazon Associate we earn from qualifying purchases. Prices and availability may vary.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}