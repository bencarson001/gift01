import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { label: "Writing your story…", emoji: "✍️", delay: 0 },
  { label: "Painting illustrations…", emoji: "🎨", delay: 3 },
  { label: "Binding the pages…", emoji: "📖", delay: 6 },
  { label: "Adding the magic…", emoji: "✨", delay: 9 },
];

export default function BookOpeningLoader({ recipientName }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((s, i) =>
      setTimeout(() => setActiveStep(i), s.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Creating your personalised book"
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Animated book */}
      <div className="relative w-40 h-48 mb-10" aria-hidden="true">
        {/* Book spine / back cover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-purple-900 rounded-r-lg rounded-l-sm shadow-2xl" />

        {/* Left page (back) */}
        <motion.div
          className="absolute inset-y-2 left-2 right-[45%] bg-amber-50 rounded-l-sm origin-right"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: [0, -25, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1 px-2 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-1 bg-gray-400 rounded w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </motion.div>

        {/* Right page (front, opening) */}
        <motion.div
          className="absolute inset-y-2 left-[45%] right-2 bg-amber-50 rounded-r-sm origin-left shadow-lg"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: [0, 25, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        >
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-1 px-2 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-1 bg-gray-400 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </motion.div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-400 text-xs select-none pointer-events-none"
            style={{
              left: `${15 + i * 14}%`,
              top: `${10 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-6, 6, -6],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.35,
              ease: "easeInOut",
            }}
          >
            ✦
          </motion.div>
        ))}

        {/* Title on cover */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-white/80 text-xs font-serif font-medium px-2 leading-tight">
            {recipientName ? `For ${recipientName}` : "Your Book"}
          </p>
        </div>
      </div>

      <motion.h2
        className="font-serif text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Creating Your Magic ✨
      </motion.h2>
      <p className="text-gray-500 text-base mb-8 text-center max-w-xs">
        Our AI is crafting a one-of-a-kind book{recipientName ? ` for ${recipientName}` : ""}…
      </p>

      {/* Steps */}
      <div className="space-y-3 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{
              opacity: activeStep >= i ? 1 : 0.3,
              x: 0,
            }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-center gap-3"
            aria-hidden={activeStep < i}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors duration-500 ${
              activeStep > i
                ? "bg-green-100"
                : activeStep === i
                ? "bg-purple-100 ring-2 ring-purple-300 ring-offset-1"
                : "bg-gray-100"
            }`}>
              {activeStep > i ? "✓" : step.emoji}
            </div>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              activeStep === i ? "text-gray-900" : activeStep > i ? "text-green-600" : "text-gray-400"
            }`}>
              {step.label}
            </span>
            {activeStep === i && (
              <motion.div
                className="ml-auto"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}