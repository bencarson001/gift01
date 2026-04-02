import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Camera, ArrowLeft, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const OCCASION_LABELS = {
  birthday: "🎂 Birthday", anniversary: "💍 Anniversary", baby: "👶 Baby",
  wedding: "💒 Wedding", roast: "🔥 Roast", kids_adventure: "🏰 Kids Adventure",
  couples_love_story: "💕 Love Story", valentines: "❤️ Valentine's",
  graduation: "🎓 Graduation", christmas: "🎄 Christmas",
  mothers_day: "🌷 Mother's Day", fathers_day: "⚽ Father's Day",
  retirement: "🎉 Retirement", new_home: "🏡 New Home",
};

export default function ProductGallery() {
  const [selected, setSelected] = useState(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["product-gallery-public"],
    queryFn: () => base44.entities.ProductGallery.filter({ status: "approved" }),
  });

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </h1>
          <Link to={createPageUrl("CreateBook")}>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              <BookOpen className="w-4 h-4 mr-1" /> Create Book
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-2 mb-4">
            <Camera className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">Real Books, Real Smiles</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Customer Gallery
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            See how our customers' personalised books have turned out — beautiful, real and truly unique.
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        )}

        {!isLoading && entries.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white/60 backdrop-blur-sm rounded-3xl border border-purple-100"
          >
            <div className="text-7xl mb-5">📸</div>
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Gallery coming soon</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Be the first to share your book photos and earn 5% off your next order!
            </p>
            <Link to={createPageUrl("CreateBook")}>
              <Button className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-2xl px-8 h-12 shadow-lg shadow-amber-200">
                <BookOpen className="w-5 h-5 mr-2" /> Create Your Book ✨
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Gallery grid */}
        {entries.length > 0 && (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="break-inside-avoid bg-white rounded-2xl shadow-sm border border-purple-50 overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                onClick={() => setSelected(entry)}
              >
                {entry.image_urls?.[0] && (
                  <img
                    src={entry.image_urls[0]}
                    alt={entry.book_title}
                    className="w-full object-cover"
                  />
                )}
                <div className="p-3">
                  {entry.occasion && (
                    <span className="text-xs text-purple-600 font-medium">
                      {OCCASION_LABELS[entry.occasion] || entry.occasion}
                    </span>
                  )}
                  {entry.book_title && (
                    <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-1">{entry.book_title}</p>
                  )}
                  {entry.comment && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{entry.comment}"</p>
                  )}
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selected && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {selected.image_urls?.length > 0 && (
                <div className="grid grid-cols-3 gap-1">
                  {selected.image_urls.filter(Boolean).map((url, i) => (
                    <img key={i} src={url} alt="" className={`object-cover w-full ${selected.image_urls.filter(Boolean).length === 1 ? "col-span-3 max-h-80" : "aspect-square"}`} />
                  ))}
                </div>
              )}
              <div className="p-5">
                <p className="font-serif text-lg font-bold text-gray-900">{selected.book_title}</p>
                {selected.occasion && <p className="text-sm text-purple-600">{OCCASION_LABELS[selected.occasion] || selected.occasion}</p>}
                {selected.comment && <p className="text-sm text-gray-600 mt-2 italic">"{selected.comment}"</p>}
                {selected.created_date && (
                  <p className="text-xs text-gray-400 mt-3">{format(new Date(selected.created_date), "MMMM yyyy")}</p>
                )}
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" onClick={() => setSelected(null)} className="flex-1 rounded-xl">Close</Button>
                  <Link to={createPageUrl("CreateBook") + (selected.occasion ? `?occasion=${selected.occasion}` : "")} className="flex-1">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">Create Similar ✨</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] rounded-3xl p-10 text-white"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3">Create Your Own Magical Book</h2>
          <p className="text-purple-200 mb-6">Join thousands of happy gift-givers across the UK</p>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-12 px-8 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-2xl">
              Start Creating ✨
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}