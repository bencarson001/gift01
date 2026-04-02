import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookQRPage from "./BookQRPage";

const PAGE_VARIANTS = {
  enter: (dir) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

const PAGE_TRANSITION = { duration: 0.35, ease: [0.32, 0.72, 0, 1] };

export default function FlipbookPreview({ book, onRefine, onShare }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(null);

  const pages = book?.pages_content || [];
  const hasQRPage = !!book?.share_id;
  const totalPages = pages.length + (hasQRPage ? 1 : 0);

  const goToPage = useCallback((newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  }, [currentPage, totalPages]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") goToPage(currentPage + 1);
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPage(currentPage - 1);
  };

  // Touch swipe
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) goToPage(currentPage + (delta > 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const isQRPage = hasQRPage && currentPage === totalPages - 1;
  const currentPageData = pages[currentPage];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Soft shadow glow */}
      <div
        className="absolute inset-0 rounded-3xl -z-10 scale-105 blur-2xl opacity-40"
        style={{ background: "linear-gradient(135deg, rgba(74,45,122,0.3), rgba(212,168,83,0.2))" }}
        aria-hidden="true"
      />

      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2"
        role="region"
        aria-label={`Book preview: ${book?.title || "Your book"}. Page ${currentPage + 1} of ${totalPages}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Page area */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "3/4", backgroundColor: "#FFF8F0" }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {isQRPage ? (
              <motion.div
                key="qr-page"
                custom={direction}
                variants={PAGE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_TRANSITION}
                className="absolute inset-0"
                style={{ willChange: "transform, opacity" }}
              >
                <BookQRPage book={book} />
              </motion.div>
            ) : currentPageData ? (
              <motion.div
                key={currentPage}
                custom={direction}
                variants={PAGE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={PAGE_TRANSITION}
                className="absolute inset-0 flex flex-col"
                style={{ willChange: "transform, opacity" }}
                aria-label={`Page ${currentPage + 1}: ${currentPageData.text?.substring(0, 80)}…`}
              >
                {currentPageData.image_url && (
                  <div className="flex-1 relative overflow-hidden">
                    <img
                      src={currentPageData.image_url}
                      alt={`Illustration for page ${currentPage + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#FFF8F0]/90" aria-hidden="true" />
                  </div>
                )}
                <div className={`p-5 md:p-6 ${currentPageData.image_url ? "" : "flex-1 flex items-center justify-center"}`}>
                  <p className="font-serif text-gray-800 text-base md:text-lg leading-relaxed text-center italic">
                    {currentPageData.text}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="text-6xl mb-4" aria-hidden="true">📖</div>
                  <h3 className="font-serif text-2xl text-gray-800 mb-2">{book?.title || "Your Book"}</h3>
                  <p className="text-gray-500">For {book?.recipient_name}</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Page number pill */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none select-none"
            aria-hidden="true"
          >
            {currentPage + 1} / {totalPages || 1}
          </div>
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between px-3 py-3 bg-white border-t border-amber-100/80">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="text-purple-600 hover:bg-purple-50 rounded-xl h-9 w-9 p-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Page dots */}
          <div className="flex gap-1 items-center" aria-hidden="true">
            {Array.from({ length: Math.min(totalPages, 20) }).map((_, i) => (
              <button
                key={i}
                onClick={() => goToPage(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === currentPage
                    ? "w-4 h-2 bg-purple-500"
                    : "w-2 h-2 bg-purple-200 hover:bg-purple-300"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-1.5">
            {onRefine && (
              <Button variant="outline" size="sm" onClick={onRefine} className="text-purple-600 border-purple-200 rounded-xl text-xs h-8 px-2.5" aria-label="Refine book with AI">
                <ZoomIn className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Refine
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare} className="text-amber-600 border-amber-200 rounded-xl text-xs h-8 px-2.5" aria-label="Share book">
                <Share2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" /> Share
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            className="text-purple-600 hover:bg-purple-50 rounded-xl h-9 w-9 p-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile swipe hint */}
      <p className="text-center text-xs text-gray-400 mt-2 md:hidden select-none" aria-hidden="true">
        Swipe to turn pages
      </p>
    </div>
  );
}