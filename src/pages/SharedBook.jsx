import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FlipbookPreview from "../components/FlipbookPreview";

export default function SharedBook() {
  const urlParams = new URLSearchParams(window.location.search);
  const shareId = urlParams.get("share");

  const { data: book, isLoading } = useQuery({
    queryKey: ["shared-book", shareId],
    queryFn: () => base44.entities.Book.filter({ share_id: shareId }),
    enabled: !!shareId,
    select: (data) => data[0],
  });

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

  return (
    <div className="min-h-screen gradient-soft">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-purple-600 text-sm font-medium mb-2 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Created with GiftMyBookUK
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {book.title}
          </h1>
          <p className="text-gray-500">
            A personalised book for <span className="text-purple-600 font-semibold">{book.recipient_name}</span>
          </p>
        </motion.div>

        {book.cover_image_url && (
          <div className="max-w-sm mx-auto mb-8 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img src={book.cover_image_url} alt="Book Cover" className="w-full aspect-[3/4] object-cover" />
          </div>
        )}

        <FlipbookPreview book={book} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-10 bg-white rounded-2xl shadow-xl p-8 border border-purple-100"
        >
          <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Want to create your own? ✨
          </h3>
          <p className="text-gray-500 mb-6">
            Make a magical personalised book for someone you love
          </p>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-12 px-8 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl">
              <BookOpen className="w-5 h-5 mr-2" /> Create Your Own Book
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}