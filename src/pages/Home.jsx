import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Sparkles, Truck, Heart, Shield, Clock, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TestimonialCarousel from "../components/TestimonialCarousel";
import SparkleParticles from "../components/SparkleParticles";
import DarkSparkle from "../components/DarkSparkle";

const TRUST_BADGES = [
  { icon: Shield, label: "GDPR Compliant" },
  { icon: Clock, label: "Under 60 Seconds" },
  { icon: Truck, label: "Free UK Delivery" },
  { icon: Award, label: "5★ Rated" },
];

const HOW_IT_WORKS = [
  { step: "1", emoji: "✨", title: "Choose Your Occasion", desc: "Pick from 20+ beautifully designed occasions — birthdays, roasts, kids stories and more." },
  { step: "2", emoji: "💬", title: "Share the Details", desc: "Answer a few fun questions — memories, inside jokes, hobbies — our AI does the magic." },
  { step: "3", emoji: "📖", title: "Preview Your Book", desc: "Instantly see your stunning personalised book with AI illustrations and heartfelt story." },
  { step: "4", emoji: "🎁", title: "Gift It!", desc: "Download digitally or order a premium hardcover delivered straight to their door." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7A] to-[#2D1B4E] text-white">
        <SparkleParticles active count={20} />
        <DarkSparkle active />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm">Trusted by 10,000+ gift-givers across the UK</span>
            </motion.div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
              Turn Memories Into
              <br />
              <span className="shimmer-text">Magical Gift Books</span>
            </h1>

            <p className="text-lg md:text-xl text-purple-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered personalised storybooks that make people laugh, cry & feel truly special. 
              Created in seconds, treasured forever.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("CreateBook")}>
                <Button className="h-14 px-8 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/30 glow-pulse">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Create Your Book — From £9.99
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10 rounded-2xl bg-transparent">
                See Examples
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {TRUST_BADGES.map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-2 text-purple-200"
                >
                  <badge.icon className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How the Magic Works
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Four simple steps to the most unforgettable gift they'll ever receive.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-5xl mb-4">{step.emoji}</div>
                <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 gradient-soft">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Gift-Givers Everywhere
            </h2>
          </motion.div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Occasion Showcase */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            A Book for Every Occasion
          </h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            From heartfelt to hilarious, we've got the perfect book for any moment worth celebrating.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-10">
            {["🎂 Birthday", "🔥 Roast", "👶 New Baby", "💕 Love Story", "🎓 Graduation",
              "🏰 Kids Story", "💍 Anniversary", "🎄 Christmas", "🌷 Mum's Day", "🎉 Retirement"
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-purple-50 to-amber-50 rounded-xl p-4 border border-purple-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </motion.div>
            ))}
          </div>

          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-12 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl">
              Start Creating <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] text-white overflow-hidden">
        <SparkleParticles active count={15} />
        <div className="relative max-w-3xl mx-auto text-center">
          <Heart className="w-12 h-12 text-amber-400 mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            Ready to Create Something Magical?
          </h2>
          <p className="text-purple-200 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of thoughtful gift-givers who've discovered the joy of personalised AI storybooks.
          </p>
          <Link to={createPageUrl("CreateBook")}>
            <Button className="h-14 px-10 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/30">
              Create Your Book Now ✨
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-serif text-xl text-white mb-3">GiftMyBook<span className="text-amber-400">UK</span></h3>
              <p className="text-sm">The UK's favourite AI-powered personalised gift book creator.</p>
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
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 GiftMyBookUK. All rights reserved. 🇬🇧 Made with ❤️ in the UK</p>
          </div>
        </div>
      </footer>
    </div>
  );
}