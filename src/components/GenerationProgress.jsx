import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  { id: "story", label: "Writing your personalised story...", emoji: "✍️", weight: 0.35 },
  { id: "images", label: "Generating beautiful illustrations...", emoji: "🎨", weight: 0.55 },
  { id: "saving", label: "Putting your book together...", emoji: "📖", weight: 0.1 },
];

const STORAGE_KEY = "gmb_gen_times";

function getStoredTimes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function addStoredTime(ms) {
  const times = getStoredTimes();
  times.push(ms);
  if (times.length > 10) times.shift();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
}

function getEstimatedTotal() {
  const times = getStoredTimes();
  if (times.length === 0) return 90; // default 90s
  return Math.round(times.reduce((a, b) => a + b, 0) / times.length / 1000);
}

export { addStoredTime };

export default function GenerationProgress({ currentStep, recipientName, startTime }) {
  const [elapsed, setElapsed] = useState(0);
  const estimated = getEstimatedTotal();

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const currentStepIdx = STEPS.findIndex(s => s.id === currentStep);
  const progress = currentStepIdx === -1 ? 0 :
    STEPS.slice(0, currentStepIdx).reduce((a, s) => a + s.weight, 0) * 100 +
    (STEPS[currentStepIdx]?.weight || 0) * 50;

  const remaining = Math.max(0, estimated - elapsed);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Book animation */}
      <motion.div
        animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="text-7xl mb-6"
      >
        📖
      </motion.div>

      <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">
        Creating {recipientName ? `${recipientName}'s book` : "your book"}
      </h2>
      <p className="text-gray-400 text-sm mb-8">Please don't close this page</p>

      {/* Steps */}
      <div className="space-y-3 mb-8 text-left">
        {STEPS.map((step, i) => {
          const isDone = i < currentStepIdx;
          const isActive = i === currentStepIdx;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.3 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive ? "bg-purple-50 border border-purple-200" :
                isDone ? "bg-green-50 border border-green-100" :
                "bg-gray-50 border border-gray-100"
              }`}
            >
              <span className="text-xl">
                {isDone ? "✅" : isActive ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    style={{ display: "inline-block" }}
                  >⚙️</motion.span>
                ) : step.emoji}
              </span>
              <span className={`text-sm font-medium ${
                isActive ? "text-purple-700" : isDone ? "text-green-700" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-full h-3 mb-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full"
          animate={{ width: `${Math.max(5, progress)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 mb-6">
        <span>{Math.round(progress)}% complete</span>
        <span>
          {remaining > 0 ? `~${remaining}s remaining` : "Almost done..."}
        </span>
      </div>

      <p className="text-xs text-gray-300 italic">
        {elapsed > 0 ? `${elapsed}s elapsed` : "Starting..."}
        {getStoredTimes().length > 2 && ` · Based on ${getStoredTimes().length} previous generations`}
      </p>
    </div>
  );
}