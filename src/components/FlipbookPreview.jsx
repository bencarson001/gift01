import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FlipbookPreview({ book, onRefine, onShare }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const pages = book?.pages_content || [];
  const totalPages = pages.length;

  const goToPage = (newPage) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
  };

  const pageVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0, rotateY: dir > 0 ? 30 : -30 }),
    center: { x: 0, opacity: 1, rotateY: 0 },
    exit: (dir) => ({ x: dir > 0 ? -300 : 300, opacity: 0, rotateY: dir > 0 ? -30 : 30 }),
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Book cover shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-amber-900/20 rounded-3xl blur-2xl -z-10 transform scale-105" />

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100">
        {/* Page display */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-cream to-amber-50 overflow-hidden" style={{ backgroundColor: "#FFF8F0" }}>
          <AnimatePresence mode="wait" custom={direction}>
            {currentPageData ? (
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.645, 0.045, 0.355, 1] }}
                className="absolute inset-0 flex flex-col"
              >
                {currentPageData.image_url && (
                  <div className="flex-1 relative overflow-hidden">
                    <img
                      src={currentPageData.image_url}
                      alt={`Page ${currentPage + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80" />
                  </div>
                )}
                <div className={`p-6 ${currentPageData.image_url ? "" : "flex-1 flex items-center"}`}>
                  <p className="font-serif text-gray-800 text-lg leading-relaxed text-center italic">
                    {currentPageData.text}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="font-serif text-2xl text-gray-800 mb-2">{book?.title || "Your Book"}</h3>
                  <p className="text-gray-500">For {book?.recipient_name}</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Page number */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm">
            {currentPage + 1} / {totalPages || 1}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-white border-t border-amber-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            className="text-purple-600"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex gap-2">
            {onRefine && (
              <Button variant="outline" size="sm" onClick={onRefine} className="text-purple-600 border-purple-200">
                <ZoomIn className="w-4 h-4 mr-1" /> Refine with AI
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={onShare} className="text-amber-600 border-amber-200">
                <Share2 className="w-4 h-4 mr-1" /> Share
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className="text-purple-600"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}