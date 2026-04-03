import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

export function StarRating({ value, onChange, size = "md", readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`${sz} transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function AverageRatingBadge({ averageRating, totalReviews, size = "md" }) {
  if (!totalReviews) return null;
  return (
    <div className={`flex items-center gap-1.5 ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <StarRating value={Math.round(averageRating)} readOnly size="sm" />
      <span className="font-bold text-amber-600">{averageRating.toFixed(1)}</span>
      <span className="text-gray-400">({totalReviews} review{totalReviews !== 1 ? "s" : ""})</span>
    </div>
  );
}

export default function BookRatingWidget({ book, orderId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.BookReview.create({
      book_id: book.id,
      order_id: orderId || null,
      user_email: user?.email || "",
      rating,
      review_text: text,
      recipient_name: book.recipient_name,
      occasion: book.occasion,
    });
    setSubmitted(true);
    setSubmitting(false);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center"
      >
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="font-semibold text-green-800">Thank you for your review! 🎉</p>
        <p className="text-sm text-green-600 mt-1">Your feedback helps others find the perfect gift book.</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
      <h3 className="font-serif text-base font-bold text-gray-900 mb-1">Rate your book ✨</h3>
      <p className="text-xs text-gray-400 mb-4">How would you rate your personalised book experience?</p>
      <div className="flex items-center gap-3 mb-4">
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <span className="text-sm text-amber-600 font-medium">
            {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
          </span>
        )}
      </div>
      <AnimatePresence>
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience (optional)..."
              className="min-h-[80px] text-sm rounded-xl"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}