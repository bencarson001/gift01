import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus, Eye, Download, Clock, Loader2, Repeat, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import ReferralCard from "../components/ReferralCard";

const STATUS_CONFIG = {
  draft:      { label: "Draft",      className: "bg-gray-100 text-gray-600 border-gray-200" },
  generating: { label: "Generating", className: "bg-blue-100 text-blue-600 border-blue-200" },
  preview:    { label: "Preview",    className: "bg-purple-100 text-purple-600 border-purple-200" },
  purchased:  { label: "Purchased",  className: "bg-green-100 text-green-600 border-green-200" },
  printed:    { label: "Printed",    className: "bg-amber-100 text-amber-700 border-amber-200" },
};

const OCCASION_EMOJIS = {
  birthday: "🎂", anniversary: "💍", baby: "👶", wedding: "💒",
  roast: "🔥", kids_adventure: "🏰", couples_love_story: "💕",
  corporate_thank_you: "🏆", valentines: "❤️", retirement: "🎉",
  graduation: "🎓", new_home: "🏡", get_well: "🌸", christmas: "🎄",
  mothers_day: "🌷", fathers_day: "⚽", friendship: "🤝", pet_tribute: "🐾",
  travel_memoir: "✈️", teacher_appreciation: "📚",
};

// Bookshelf row background stripes
function BookshelfStripes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.03]">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full"
          style={{
            top: `${i * 10}%`,
            height: "40px",
            background: "linear-gradient(180deg, rgba(74,45,122,0.6) 0%, rgba(74,45,122,0.3) 50%, transparent 100%)",
          }}
        />
      ))}
    </div>
  );
}

export default function MyLibrary() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [filter, setFilter] = useState("all");

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ["my-books"],
    queryFn: () => base44.entities.Book.list("-created_date", 50),
  });

  const filtered = filter === "all" ? books : books.filter((b) => b.status === filter);

  const filterOptions = [
    { key: "all", label: "All Books" },
    { key: "purchased", label: "Purchased" },
    { key: "preview", label: "Preview" },
    { key: "draft", label: "Drafts" },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 40%, #fffbeb 100%)" }}>
      <BookshelfStripes />

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Referrals")} className="text-sm text-purple-600 hover:text-purple-800 font-medium hidden sm:block">
              🎁 Earn £5
            </Link>
            <Link to={createPageUrl("CreateBook")}>
              <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl shadow-md shadow-purple-200">
                <Plus className="w-4 h-4 mr-1.5" /> New Book
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Hero header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    My Library
                  </h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    {books.length} magical {books.length === 1 ? "creation" : "creations"}
                  </p>
                </div>
                {/* Shelf decoration */}
                <div className="flex items-center gap-2 text-3xl">
                  📚 📖 📕 📗
                </div>
              </div>
            </motion.div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {filterOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filter === opt.key
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-purple-200 hover:text-purple-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-100"
              >
                <div className="text-7xl mb-5">📖</div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
                  {filter === "all" ? "Your library is empty" : `No ${filter} books yet`}
                </h3>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Create your first magical personalised book — it only takes 60 seconds!
                </p>
                <Link to={createPageUrl("CreateBook")}>
                  <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-2xl px-8 h-12 shadow-lg shadow-amber-200">
                    <BookOpen className="w-5 h-5 mr-2" /> Create Your First Book ✨
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((book, i) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, type: "spring", stiffness: 180 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(createPageUrl("BookPreview") + `?id=${book.id}`)}
                  >
                    {/* Book card with 3D lift effect */}
                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-purple-50/80 overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-purple-200">
                      {/* Cover */}
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 via-purple-50 to-amber-50 flex flex-col items-center justify-center gap-2">
                            <span className="text-4xl">{OCCASION_EMOJIS[book.occasion] || "📖"}</span>
                            <p className="text-xs text-purple-300 font-medium">{book.occasion?.replace(/_/g, " ")}</p>
                          </div>
                        )}
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 gap-2">
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("BookPreview") + `?id=${book.id}`); }}
                            className="bg-white/90 text-gray-800 hover:bg-white rounded-xl text-xs h-8 px-3"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          {book.status === "purchased" && (
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); navigate(createPageUrl("Checkout") + `?id=${book.id}&plan=printed`); }}
                              className="bg-amber-400/90 text-gray-900 hover:bg-amber-400 rounded-xl text-xs h-8 px-3"
                            >
                              <Repeat className="w-3.5 h-3.5 mr-1" /> Reorder
                            </Button>
                          )}
                        </div>
                        {/* Status badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm bg-white/80 ${STATUS_CONFIG[book.status]?.className}`}>
                            {STATUS_CONFIG[book.status]?.label || book.status}
                          </span>
                        </div>
                        {book.status === "purchased" && (
                          <div className="absolute top-2.5 right-2.5">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-4">
                        <h3 className="font-serif text-base font-bold text-gray-900 mb-0.5 line-clamp-1 group-hover:text-purple-700 transition-colors">
                          {book.title || "Untitled Book"}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          For <span className="text-gray-600 font-medium">{book.recipient_name}</span>
                          {book.total_pages ? ` · ${book.total_pages} pages` : ""}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {book.created_date ? format(new Date(book.created_date), "d MMM yyyy") : ""}
                          </span>
                          <div className="flex gap-1.5">
                            {book.pdf_url && (
                              <a href={book.pdf_url} download onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-7 px-2 text-purple-500 hover:bg-purple-50 rounded-lg">
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </a>
                            )}
                            <Button
                              variant="ghost" size="sm"
                              className="h-7 px-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${window.location.origin}${createPageUrl("SharedBook")}?share=${book.share_id}`);
                              }}
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-purple-50 p-5"
            >
              <h3 className="font-serif text-base font-bold text-gray-900 mb-4">Your Stats</h3>
              <div className="space-y-3">
                {[
                  { label: "Total books", value: books.length, emoji: "📚" },
                  { label: "Purchased", value: books.filter(b => b.status === "purchased").length, emoji: "✅" },
                  { label: "In draft", value: books.filter(b => b.status === "draft").length, emoji: "✏️" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{stat.emoji}</span>{stat.label}
                    </span>
                    <span className="font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Referral card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ReferralCard user={user} />
            </motion.div>

            {/* Upgrade nudge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-5 border border-amber-200"
            >
              <p className="text-sm font-bold text-amber-800 mb-1">✨ Go Unlimited</p>
              <p className="text-xs text-amber-700 mb-3">Create unlimited books for just £7.99/month</p>
              <Link to={createPageUrl("Checkout") + "?plan=subscription"}>
                <Button size="sm" className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-xl">
                  Upgrade Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}