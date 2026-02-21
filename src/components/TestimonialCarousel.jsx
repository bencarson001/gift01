import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "London",
    text: "My mum cried happy tears reading her birthday book. The AI somehow knew exactly how to capture our inside jokes. Absolutely magical!",
    rating: 5,
    occasion: "Birthday",
  },
  {
    name: "James T.",
    location: "Manchester",
    text: "Ordered a roast book for my best mate's 30th. The whole party was in stitches. Best £30 I've ever spent!",
    rating: 5,
    occasion: "Roast",
  },
  {
    name: "Emily R.",
    location: "Edinburgh",
    text: "The kids' adventure story was incredible. My daughter asks to read 'her book' every single night. She thinks she's famous!",
    rating: 5,
    occasion: "Kids Adventure",
  },
  {
    name: "David W.",
    location: "Bristol",
    text: "Created a love story book for our 10th anniversary. My wife said it was the most thoughtful gift she's ever received.",
    rating: 5,
    occasion: "Anniversary",
  },
  {
    name: "Priya K.",
    location: "Birmingham",
    text: "Used this for our team's end-of-year gifts. 15 personalised books in under an hour. Everyone was genuinely moved.",
    rating: 5,
    occasion: "Corporate",
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-center px-8"
        >
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: TESTIMONIALS[current].rating }, (_, i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-lg md:text-xl font-serif italic text-gray-700 leading-relaxed mb-4">
            "{TESTIMONIALS[current].text}"
          </p>
          <div>
            <p className="font-semibold text-gray-900">{TESTIMONIALS[current].name}</p>
            <p className="text-sm text-gray-500">{TESTIMONIALS[current].location} · {TESTIMONIALS[current].occasion}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-6">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-8 bg-amber-400" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}