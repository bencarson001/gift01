import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Wand2, ShoppingBag, Loader2, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FlipbookPreview from "../components/FlipbookPreview";
import SparkleParticles from "../components/SparkleParticles";
import FloatingHearts from "../components/FloatingHearts";
import VoiceoverPanel from "../components/VoiceoverPanel";
import BookRatingWidget, { AverageRatingBadge } from "../components/BookRatingWidget";

export default function BookPreview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");

  const [showRefineDialog, setShowRefineDialog] = useState(false);
  const [refineInstructions, setRefineInstructions] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRating, setShowRating] = useState(false);

  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    enabled: !!bookId,
    select: (data) => data[0],
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["book-reviews", bookId],
    queryFn: () => base44.entities.BookReview.filter({ book_id: bookId }),
    enabled: !!bookId,
  });

  const averageRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleRefine = async () => {
    if (!refineInstructions.trim() || !book) return;
    setIsRefining(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are refining a personalised gift book. Here's the current book:
Title: ${book.title}
Pages: ${JSON.stringify(book.pages_content?.map(p => ({ page_number: p.page_number, text: p.text })))}

User's refinement request: "${refineInstructions}"

Apply the changes and return the updated book. Keep the same structure but modify the content as requested.
Return the full updated pages array.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          pages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                page_number: { type: "number" },
                text: { type: "string" },
              },
            },
          },
        },
      },
    });

    const updatedPages = book.pages_content.map((page, i) => ({
      ...page,
      text: result.pages[i]?.text || page.text,
    }));

    await base44.entities.Book.update(book.id, {
      title: result.title || book.title,
      pages_content: updatedPages,
    });

    queryClient.invalidateQueries({ queryKey: ["book", bookId] });
    setIsRefining(false);
    setShowRefineDialog(false);
    setRefineInstructions("");
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${createPageUrl("SharedBook")}?share=${book?.share_id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !book) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const isCouplesOccasion = book?.occasion === "couples_love_story" || book?.occasion === "valentines" || book?.occasion === "anniversary" || book?.occasion === "wedding";

  return (
    <div className="min-h-screen gradient-soft">
      <FloatingHearts active={isCouplesOccasion} count={12} />
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl("Home"))} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <h1 className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Book Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {book.title}
          </h2>
          <p className="text-gray-500 mb-2">
            A personalised book for <span className="text-purple-600 font-semibold">{book.recipient_name}</span>
          </p>
          {reviews.length > 0 && (
            <div className="flex justify-center">
              <AverageRatingBadge averageRating={averageRating} totalReviews={reviews.length} />
            </div>
          )}
        </motion.div>

        {/* Cover Image */}
        {book.cover_image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img src={book.cover_image_url} alt="Book Cover" className="w-full aspect-[3/4] object-cover" />
            </div>
          </motion.div>
        )}

        {/* Flipbook */}
        <div className="mb-10">
          <FlipbookPreview
            book={book}
            onRefine={() => setShowRefineDialog(true)}
            onShare={handleShare}
          />
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-3"
            >
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                <Check className="w-4 h-4" /> Link copied!
              </span>
            </motion.div>
          )}
        </div>

        {/* Voiceover Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <VoiceoverPanel book={book} />
        </motion.div>

        {/* Rating widget — show for purchased books */}
        {book.status === "purchased" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            {!showRating ? (
              <button
                onClick={() => setShowRating(true)}
                className="w-full text-center py-3 text-sm text-purple-600 hover:text-purple-800 font-medium border border-purple-100 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                ⭐ Rate & review this book
              </button>
            ) : (
              <BookRatingWidget book={book} onSubmitted={() => setShowRating(false)} />
            )}
          </motion.div>
        )}

        {/* PDF Download for purchased digital books */}
        {book.status === "purchased" && book.pdf_url && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mb-6 text-center"
          >
            <a href={book.pdf_url} download target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold gap-2">
                <Download className="w-4 h-4" /> Download as PDF
              </Button>
            </a>
          </motion.div>
        )}

        {/* Purchase CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          {book.status !== "purchased" && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100 relative overflow-hidden">
            <SparkleParticles active count={10} />
            <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Love it? Make it real! 🎁</h3>
            <p className="text-gray-500 mb-6">Choose how you'd like to gift this magical book</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate(createPageUrl("Checkout") + `?id=${book.id}&plan=digital`)}
                className="h-12 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
              >
                Digital PDF — £24.99
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Checkout") + `?id=${book.id}&plan=printed`)}
                className="h-12 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-xl shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Premium Hardcover — £39.99
              </Button>
            </div>
          </div>
          )}
        </motion.div>
      </div>

      {/* Refine Dialog */}
      <Dialog open={showRefineDialog} onOpenChange={setShowRefineDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-purple-500" /> Refine with AI
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Tell us what you'd like to change and we'll update your book instantly.
          </p>
          <Textarea
            value={refineInstructions}
            onChange={(e) => setRefineInstructions(e.target.value)}
            placeholder="e.g. Make it funnier, add more references to their love of cats, change the ending..."
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRefineDialog(false)}>Cancel</Button>
            <Button
              onClick={handleRefine}
              disabled={isRefining || !refineInstructions.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isRefining ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
              Refine
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}