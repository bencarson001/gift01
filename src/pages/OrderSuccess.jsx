import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, Download, Truck, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfettiEffect from "../components/ConfettiEffect";
import SparkleParticles from "../components/SparkleParticles";

export default function OrderSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const plan = urlParams.get("plan") || "digital";
  const [book, setBook] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (bookId) {
      base44.entities.Book.filter({ id: bookId }).then((data) => {
        if (data?.[0]) setBook(data[0]);
      });
    }
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [bookId]);

  const planMessages = {
    digital: {
      emoji: "📥",
      title: "Your Book is Ready!",
      subtitle: "Your digital PDF has been sent to your email and is ready to download.",
      icon: Download,
      color: "from-purple-500 to-purple-600",
    },
    printed: {
      emoji: "📦",
      title: "Order Confirmed!",
      subtitle: "Your premium hardcover is being prepared and will be shipped within 3–5 days.",
      icon: Truck,
      color: "from-amber-500 to-amber-600",
    },
    subscription: {
      emoji: "✨",
      title: "Welcome to Unlimited!",
      subtitle: "Your subscription is active. Create as many magical books as you like!",
      icon: Star,
      color: "from-green-500 to-green-600",
    },
  };

  const msg = planMessages[plan] || planMessages.digital;
  const Icon = msg.icon;

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center p-4 relative overflow-hidden">
      <ConfettiEffect active={showConfetti} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden"
      >
        <SparkleParticles active count={12} />

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={`w-24 h-24 bg-gradient-to-br ${msg.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
        >
          <span className="text-4xl">{msg.emoji}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {msg.title} 🎉
          </h1>
          <p className="text-gray-500 text-base mb-2 leading-relaxed">{msg.subtitle}</p>

          {book && (
            <div className="bg-purple-50 rounded-2xl p-4 mb-6 mt-4 border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">
                📖 "{book.title}" for {book.recipient_name}
              </p>
            </div>
          )}
        </motion.div>

        {/* Delivery info bar */}
        {plan === "printed" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left"
          >
            <Truck className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Estimated delivery: 5–7 business days</p>
              <p className="text-xs text-amber-600">We'll email you tracking details once shipped</p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {bookId && (
            <Link to={createPageUrl("BookPreview") + `?id=${bookId}`}>
              <Button className="w-full h-13 text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl shadow-md py-3">
                <BookOpen className="w-5 h-5 mr-2" />
                View My Book
              </Button>
            </Link>
          )}
          <Link to={createPageUrl("MyLibrary")}>
            <Button variant="outline" className="w-full h-12 rounded-2xl border-purple-200 text-purple-700 hover:bg-purple-50">
              Go to My Library
            </Button>
          </Link>
          <Link to={createPageUrl("CreateBook")}>
            <Button variant="ghost" className="w-full h-12 rounded-2xl text-gray-500 hover:text-gray-700">
              ✨ Create Another Book
            </Button>
          </Link>
        </motion.div>

        {/* Referral nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 pt-6 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Share2 className="w-3 h-3" />
            Love your book? Share GiftMyBookUK and earn £5 credit for every friend who orders!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}