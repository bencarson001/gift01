import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { BookOpen, Download, Truck, Share2, Star, Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SparkleParticles from "../components/SparkleParticles";

// Big confetti burst using pure CSS + framer-motion
const CONFETTI_COLORS = ["#D4A853", "#E8A0BF", "#7B5EA7", "#4ECDC4", "#FF6B6B", "#F0D88A", "#4A2D7A", "#FF9F43"];
const SHAPES = ["circle", "rect", "star"];

function MegaConfetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (active) {
      const p = Array.from({ length: 120 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: Math.random() * 12 + 5,
        delay: Math.random() * 1.5,
        rotation: Math.random() * 720,
        shape: SHAPES[Math.floor(Math.random() * 3)],
        drift: (Math.random() - 0.5) * 200,
      }));
      setPieces(p);
      const t = setTimeout(() => setPieces([]), 6000);
      return () => clearTimeout(t);
    }
  }, [active]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ left: `${p.x}%`, top: -30 }}
            initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            animate={{ y: "120vh", x: p.drift, rotate: p.rotation, opacity: [1, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4 + Math.random() * 2, delay: p.delay, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {p.shape === "circle" && (
              <div style={{ width: p.size, height: p.size, backgroundColor: p.color, borderRadius: "50%" }} />
            )}
            {p.shape === "rect" && (
              <div style={{ width: p.size, height: p.size * 0.5, backgroundColor: p.color, borderRadius: 2 }} />
            )}
            {p.shape === "star" && (
              <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.color}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const PLAN_CONFIG = {
  digital: {
    emoji: "📥",
    title: "Your Book is Ready!",
    subtitle: "Your digital PDF has been sent to your email inbox.",
    color: "from-purple-500 to-purple-700",
    ringColor: "ring-purple-200",
  },
  printed: {
    emoji: "📦",
    title: "Print Order Confirmed!",
    subtitle: "Your premium hardcover is being prepared and will ship within 3–5 working days.",
    color: "from-amber-400 to-amber-600",
    ringColor: "ring-amber-200",
  },
  subscription: {
    emoji: "✨",
    title: "Welcome to Unlimited!",
    subtitle: "Create as many magical books as you like, every single month.",
    color: "from-green-400 to-green-600",
    ringColor: "ring-green-200",
  },
};

export default function OrderSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const plan = urlParams.get("plan") || "digital";
  const [book, setBook] = useState(null);
  const [confettiActive, setConfettiActive] = useState(true);
  const [referralCopied, setReferralCopied] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (bookId) base44.entities.Book.filter({ id: bookId }).then((d) => d?.[0] && setBook(d[0]));
    base44.auth.me().then(async (me) => {
      setUser(me);
      // Credit the referrer £1 if this user was referred and hasn't been credited yet
      if (me?.email) {
        const referrals = await base44.entities.Referral.filter({ referred_email: me.email, status: "pending" });
        for (const referral of referrals) {
          await base44.entities.Referral.update(referral.id, {
            status: "credited",
            credit_amount_gbp: 1,
            credited_at: new Date().toISOString(),
          });
        }
      }
    }).catch(() => {});
    const t = setTimeout(() => setConfettiActive(false), 6000);
    return () => clearTimeout(t);
  }, [bookId]);

  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.digital;

  const referralCode = user?.email
    ? btoa(user.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()
    : "GIFT8UK";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}
    >
      <MegaConfetti active={confettiActive} />

      {/* Background sparkle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 18 }}
          className={`bg-white rounded-3xl shadow-2xl overflow-hidden ring-4 ${cfg.ringColor}`}
        >
          {/* Header gradient */}
          <div className={`bg-gradient-to-br ${cfg.color} px-8 pt-10 pb-8 text-center relative overflow-hidden`}>
            <SparkleParticles active count={15} />
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 220 }}
              className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30 shadow-xl"
            >
              <span className="text-5xl">{cfg.emoji}</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-serif text-3xl font-bold text-white mb-2"
            >
              {cfg.title} 🎉
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/80 text-sm leading-relaxed max-w-xs mx-auto"
            >
              {cfg.subtitle}
            </motion.p>
          </div>

          <div className="px-8 py-6">
            {/* Book details */}
            {book && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-100"
              >
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt="" className="w-14 h-16 object-cover rounded-xl shadow-md" />
                ) : (
                  <div className="w-14 h-16 bg-gradient-to-br from-purple-200 to-amber-100 rounded-xl flex items-center justify-center text-2xl shadow-md">📖</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-bold text-gray-900 truncate">{book.title}</p>
                  <p className="text-sm text-gray-500">A magical gift for <span className="text-purple-600 font-medium">{book.recipient_name}</span></p>
                </div>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
              </motion.div>
            )}

            {/* Printed delivery info */}
            {plan === "printed" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5"
              >
                <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Estimated delivery: 5–7 working days</p>
                  <p className="text-xs text-amber-600 mt-0.5">We'll email you a tracking link once it's shipped 📬</p>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3 mb-5"
            >
              {bookId && (
                <Link to={createPageUrl("BookPreview") + `?id=${bookId}`}>
                  <Button className="w-full h-13 py-3 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl shadow-lg shadow-purple-200">
                    <BookOpen className="w-5 h-5 mr-2" />
                    View My Book
                  </Button>
                </Link>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Link to={createPageUrl("MyLibrary")}>
                  <Button variant="outline" className="w-full h-11 rounded-2xl border-purple-200 text-purple-700 hover:bg-purple-50 text-sm">
                    My Library
                  </Button>
                </Link>
                <Link to={createPageUrl("CreateBook")}>
                  <Button variant="outline" className="w-full h-11 rounded-2xl border-gray-200 text-gray-600 hover:bg-gray-50 text-sm">
                    ✨ New Book
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Referral invite */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-r from-purple-50 to-amber-50 rounded-2xl p-4 border border-purple-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-bold text-gray-800">Share & earn £5 credit</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">Send friends your link — earn £5 for every person who purchases</p>
              <div className="flex items-center gap-2">
                <p className="text-xs font-mono text-purple-600 bg-white rounded-xl px-3 py-2 flex-1 truncate border border-purple-100">
                  {referralLink}
                </p>
                <Button
                  size="sm"
                  onClick={copyReferral}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-3 h-9 shrink-0"
                >
                  {referralCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {referralCopied && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-purple-600 mt-1.5 font-medium"
                >
                  ✓ Copied! Share it with friends 🎉
                </motion.p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom brand */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-xs text-gray-400 mt-5"
        >
          With love, GiftMyBook<span className="text-amber-500">UK</span> 📖✨
        </motion.p>
      </div>
    </div>
  );
}