import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Sparkles, Star, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestimonialCarousel from "../components/TestimonialCarousel";
import AffiliateOffers from "../components/AffiliateOffers";
import AdSenseUnit from "../components/AdSenseUnit";
import SparkleParticles from "../components/SparkleParticles";
import UpcomingOccasionBanner from "../components/UpcomingOccasionBanner";

const OCCASIONS = [
  { emoji: "🎂", label: "Birthday", key: "birthday" },
  { emoji: "🔥", label: "Roast", key: "roast" },
  { emoji: "👶", label: "New Baby", key: "baby" },
  { emoji: "💕", label: "Love Story", key: "couples_love_story" },
  { emoji: "🎓", label: "Graduation", key: "graduation" },
  { emoji: "🏰", label: "Kids Story", key: "kids_adventure" },
  { emoji: "💍", label: "Anniversary", key: "anniversary" },
  { emoji: "🎄", label: "Christmas", key: "christmas" },
  { emoji: "🌷", label: "Mum's Day", key: "mothers_day" },
  { emoji: "🎉", label: "Retirement", key: "retirement" },
];

const HOW_IT_WORKS = [
  { emoji: "✨", title: "Choose an Occasion", desc: "Pick from 20+ occasions — birthdays, roasts, kids stories and more." },
  { emoji: "💬", title: "Share the Details", desc: "Tell us memories, inside jokes & hobbies — our AI does the magic." },
  { emoji: "📖", title: "Preview Your Book", desc: "See your stunning personalised book with AI illustrations instantly." },
  { emoji: "🎁", title: "Gift It!", desc: "Download digitally or order a premium hardcover with free UK delivery." },
];

const STATS = [
  { value: "10,000+", label: "Books Created" },
  { value: "60s", label: "Average Creation Time" },
  { value: "4.9★", label: "Customer Rating" },
  { value: "Free", label: "UK Delivery" },
];

export default function Home() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7A] to-[#2D1B4E] text-white"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <SparkleParticles active count={12} />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80')] bg-cover bg-center opacity-10" />

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Trusted by 10,000+ gift-givers across the UK
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-5">
              Turn Memories Into
              <br />
              <span className="shimmer-text">Magical Gift Books</span>
            </h1>

            <p className="text-lg md:text-xl text-purple-200 max-w-xl mx-auto mb-8 leading-relaxed">
              AI-powered personalised storybooks that make people laugh, cry & feel truly special.
              Created in seconds, treasured forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("CreateBook")}>
                <Button className="h-14 px-8 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/30 glow-pulse">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Create Your Book — From £9.99
                </Button>
              </Link>
            </div>

            {/* Upcoming occasion banner */}
            <UpcomingOccasionBanner />

            {/* Social proof stars */}
            <div className="flex items-center justify-center gap-1 mt-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
              <span className="text-purple-200 text-sm ml-2">4.9/5 from 500+ reviews</span>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 80L60 73C120 67 240 53 360 47C480 40 600 40 720 43C840 47 960 53 1080 57C1200 60 1320 60 1380 60L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-white py-6 px-4 border-b border-gray-100">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="font-serif text-2xl font-bold text-purple-700">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── OCCASIONS PICKER ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              What's the Occasion?
            </h2>
            <p className="text-gray-500 text-sm">Tap one to start your personalised book instantly.</p>
          </motion.div>

          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
            {OCCASIONS.map((occ, i) => (
              <motion.div
                key={occ.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={createPageUrl("CreateBook") + `?occasion=${occ.key}`}
                  className="flex flex-col items-center gap-1.5 bg-gradient-to-b from-purple-50 to-white border border-purple-100 hover:border-purple-300 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-2xl py-3 px-1 text-center group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{occ.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{occ.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link to={createPageUrl("CreateBook")} className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium">
              See all 20+ occasions <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-gray-500 text-sm">Four simple steps to the most unforgettable gift.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-purple-100 z-0" />
                )}
                <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-amber-50 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-purple-100">
                  {step.emoji}
                </div>
                <div className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                  {i + 1}
                </div>
                <h3 className="font-serif text-base font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to={createPageUrl("CreateBook")}>
              <Button className="h-12 px-8 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold">
                Start Creating <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Loved by Gift-Givers Everywhere
            </h2>
          </motion.div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-14 px-4 bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] text-white overflow-hidden">
        <SparkleParticles active count={10} />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">🎁</div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Ready to Create Something Magical?
          </h2>
          <p className="text-purple-200 text-lg mb-8 max-w-md mx-auto">
            Join thousands of thoughtful gift-givers across the UK.
          </p>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-14 px-10 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/30 glow-pulse">
              Create Your Book Now ✨
            </Button>
          </Link>
          <p className="text-purple-300 text-sm mt-4">From £9.99 · Digital PDF or Premium Hardcover · Free UK Delivery</p>
        </div>
      </section>

      {/* ── AFFILIATE + ADS ── */}
      <section className="py-8 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto space-y-5">
          <AffiliateOffers title="Pair Your Book With the Perfect Gift 🎁" />
          <AdSenseUnit />
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 pb-24 md:pb-8"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-xl text-white mb-3">GiftMyBook<span className="text-amber-400">UK</span></h3>
              <p className="text-sm">The UK's favourite AI-powered personalised gift book creator.</p>
              <Link to={createPageUrl("ProductGallery")} className="inline-block mt-3 text-amber-400 hover:text-amber-300 text-sm font-medium">
                📸 Customer Gallery
              </Link>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Create</h4>
              <ul className="space-y-2 text-sm">
                <li>Birthday Books</li>
                <li>Wedding Books</li>
                <li>Kids Adventures</li>
                <li>Roast Books</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>About Us</li>
                <li>Pricing</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>GDPR</li>
                <li>Cookie Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-sm">
            <p>© 2026 GiftMyBookUK. All rights reserved. 🇬🇧 Made with ❤️ in the UK</p>
          </div>
        </div>
      </footer>

    </div>
  );
}