import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen, Sparkles, Loader2, ChevronLeft, ChevronRight,
  Share2, Check, ArrowRight, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";

const OCCASION_EMOJIS = {
  birthday: "🎂", anniversary: "💍", baby: "👶", wedding: "💒",
  roast: "🔥", kids_adventure: "🏰", couples_love_story: "💕",
  corporate_thank_you: "🏆", valentines: "❤️", retirement: "🎉",
  graduation: "🎓", new_home: "🏡", get_well: "🌸", christmas: "🎄",
  mothers_day: "🌷", fathers_day: "⚽", friendship: "🤝", pet_tribute: "🐾",
  travel_memoir: "✈️", teacher_appreciation: "📚",
};

// Inject dynamic OG meta tags into <head>
function injectOgMeta({ title, description, imageUrl, url }) {
  const set = (property, content, isName = false) => {
    const attr = isName ? "name" : "property";
    let el = document.querySelector(`meta[${attr}="${property}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  if (title) document.title = title;
  set("og:title", title || "A Personalised Gift Book");
  set("og:description", description || "Read this magical personalised book, made with GiftMyBookUK.");
  set("og:type", "article");
  if (imageUrl) {
    set("og:image", imageUrl);
    set("twitter:image", imageUrl, false);
  }
  if (url) set("og:url", url);
  set("og:site_name", "GiftMyBookUK");
  set("twitter:card", "summary_large_image", true);
  set("twitter:title", title || "A Personalised Gift Book", true);
  set("twitter:description", description || "Read this magical personalised book.", true);
}

// Single page card component
function PageCard({ page, index, total }) {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="bg-white rounded-3xl shadow-xl border border-purple-50 overflow-hidden"
    >
      {page.image_url && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={page.image_url}
            alt={`Page ${page.page_number}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-purple-400 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            Page {page.page_number} of {total}
          </span>
        </div>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed font-serif">
          {page.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function SharedBook() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get("share");

  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["shared-book", shareId],
    queryFn: () => base44.entities.Book.filter({ share_id: shareId }),
    enabled: !!shareId,
    select: (data) => data?.[0],
  });

  // Inject OG meta tags when book loads
  useEffect(() => {
    if (!book) return;
    const pageUrl = window.location.href;
    const description = book.dedication
      ? `"${book.dedication}" — A personalised ${book.occasion?.replace(/_/g, " ")} book for ${book.recipient_name}.`
      : `A magical personalised ${book.occasion?.replace(/_/g, " ")} book for ${book.recipient_name}, made with love on GiftMyBookUK.`;

    injectOgMeta({
      title: `${book.title} ✨ — GiftMyBookUK`,
      description,
      imageUrl: book.cover_image_url,
      url: pageUrl,
    });
  }, [book]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: book?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const allPages = book?.pages_content || [];
  const PREVIEW_LIMIT = 3;
  const pages = allPages.slice(0, PREVIEW_LIMIT);
  const totalPages = allPages.length;
  const previewPages = pages.length;
  const canPrev = currentPage > 0;
  const canNext = currentPage < previewPages - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <p className="text-gray-500 mb-6">This link may have expired or the book doesn't exist.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              Go to GiftMyBookUK
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const occasionEmoji = OCCASION_EMOJIS[book.occasion] || "📖";

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <Link to={createPageUrl("Home")} className="font-serif text-lg font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-xl gap-1.5 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Share"}
            </Button>
            <Link to={createPageUrl("CreateBook")}>
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-xs gap-1.5 hover:from-amber-500 hover:to-amber-600">
                <Gift className="w-3.5 h-3.5" /> Create Yours
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 pb-24">

        {/* Book header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-1.5 text-purple-600 text-xs font-semibold bg-purple-50 border border-purple-100 px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Created with GiftMyBookUK
          </span>
          <div className="text-4xl mb-3">{occasionEmoji}</div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
            {book.title}
          </h1>
          <p className="text-gray-500 text-base">
            A personalised book for{" "}
            <span className="text-purple-700 font-semibold">{book.recipient_name}</span>
            {book.sender_name && (
              <> from <span className="text-gray-700 font-medium">{book.sender_name}</span></>
            )}
          </p>
        </motion.div>

        {/* Cover image */}
        {book.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-xs mx-auto mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-purple-100"
          >
            <img
              src={book.cover_image_url}
              alt="Book Cover"
              className="w-full aspect-[3/4] object-cover"
            />
          </motion.div>
        )}

        {/* Dedication */}
        {book.dedication && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-10 bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 px-6 py-5"
          >
            <p className="font-serif text-lg italic text-gray-600 leading-relaxed">"{book.dedication}"</p>
          </motion.div>
        )}

        {/* Page reader */}
        {previewPages > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700 text-sm">Preview — first {PREVIEW_LIMIT} pages</h2>
              <span className="text-xs text-gray-400">{currentPage + 1} / {previewPages}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-purple-100 rounded-full mb-5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-amber-400 rounded-full"
                animate={{ width: `${((currentPage + 1) / previewPages) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Screenshot / save protection */}
            <div
              style={{ userSelect: "none", WebkitUserSelect: "none", pointerEvents: "auto" }}
              onContextMenu={(e) => e.preventDefault()}
            >
              <AnimatePresence mode="wait">
                <PageCard
                  key={currentPage}
                  page={pages[currentPage]}
                  index={currentPage}
                  total={previewPages}
                />
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-5">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={!canPrev}
                className="rounded-xl gap-1.5 border-purple-200 text-purple-700 hover:bg-purple-50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </Button>

              <div className="flex items-center gap-1">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentPage ? "bg-purple-600 scale-125" : "bg-purple-200 hover:bg-purple-300"
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!canNext}
                className="rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-30"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* "Rest is locked" nudge */}
            {totalPages > PREVIEW_LIMIT && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-5 bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-100 rounded-2xl p-4 text-center"
              >
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  📖 {totalPages - PREVIEW_LIMIT} more pages in the full book
                </p>
                <p className="text-xs text-gray-500 mb-3">Purchase to unlock all {totalPages} pages + download or print your copy.</p>
                <Link to={createPageUrl("CreateBook")}>
                  <Button size="sm" className="bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-600">
                    Create Your Own Book ✨
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] rounded-3xl shadow-2xl p-8 text-white"
        >
          <div className="text-4xl mb-3">✨</div>
          <h3 className="font-serif text-2xl font-bold mb-2">
            Create your own magical book
          </h3>
          <p className="text-purple-200 text-sm mb-6 max-w-xs mx-auto">
            Personalised AI storybooks ready in 60 seconds — digital PDF from £9.99 or premium hardcover with free UK delivery.
          </p>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-12 px-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-800/20">
              <BookOpen className="w-5 h-5 mr-2" /> Start Creating Free <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}