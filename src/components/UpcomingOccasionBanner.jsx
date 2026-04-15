import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";

// UK public holidays & gifting occasions with book occasion keys
// Dates without year are recurring (MM-DD)
const OCCASIONS = [
  { mmdd: "02-14", label: "Valentine's Day", emoji: "❤️", occasion: "valentines" },
  { mmdd: "03-17", label: "St Patrick's Day", emoji: "🍀", occasion: "friendship" },
  { mmdd: "04-05", label: "Easter Sunday", emoji: "🐣", occasion: "birthday", year: 2026 },
  { mmdd: "05-10", label: "Mother's Day", emoji: "🌷", occasion: "mothers_day", year: 2026 },
  { mmdd: "05-04", label: "May Bank Holiday", emoji: "🌸", occasion: "friendship" },
  { mmdd: "06-21", label: "Father's Day", emoji: "⚽", occasion: "fathers_day", year: 2026 },
  { mmdd: "08-25", label: "Summer Bank Holiday", emoji: "☀️", occasion: "friendship" },
  { mmdd: "10-31", label: "Halloween", emoji: "🎃", occasion: "roast" },
  { mmdd: "11-05", label: "Bonfire Night", emoji: "🎇", occasion: "friendship" },
  { mmdd: "12-25", label: "Christmas Day", emoji: "🎄", occasion: "christmas" },
  { mmdd: "12-31", label: "New Year's Eve", emoji: "🥂", occasion: "graduation" },
  { mmdd: "01-01", label: "New Year's Day", emoji: "🎆", occasion: "graduation" },
];

function getNextOccasion() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();

  const candidates = OCCASIONS.map((occ) => {
    const year = occ.year || currentYear;
    const [mm, dd] = occ.mmdd.split("-").map(Number);
    let d = new Date(year, mm - 1, dd);
    // If recurring and already passed this year, try next year
    if (!occ.year && d < today) {
      d = new Date(currentYear + 1, mm - 1, dd);
    }
    const daysAway = Math.round((d - today) / (1000 * 60 * 60 * 24));
    return { ...occ, date: d, daysAway };
  });

  // Filter to future/today and sort by soonest
  const upcoming = candidates
    .filter((o) => o.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);

  return upcoming[0] || null;
}

export default function UpcomingOccasionBanner({ variant = "dark" }) {
  const next = useMemo(() => getNextOccasion(), []);

  if (!next) return null;

  const urgencyText =
    next.daysAway === 0
      ? "Today!"
      : next.daysAway === 1
      ? "Tomorrow!"
      : next.daysAway <= 7
      ? `In ${next.daysAway} days`
      : next.daysAway <= 14
      ? "Coming up soon"
      : `${next.daysAway} days away`;

  const isDark = variant === "dark";

  const urgencyColor = isDark
    ? next.daysAway <= 3
      ? "from-red-500/20 to-red-600/10 border-red-400/40"
      : next.daysAway <= 10
      ? "from-amber-400/20 to-amber-500/10 border-amber-400/40"
      : "from-purple-500/20 to-purple-600/10 border-purple-400/30"
    : next.daysAway <= 3
      ? "from-red-50 to-red-100 border-red-300"
      : next.daysAway <= 10
      ? "from-amber-50 to-amber-100 border-amber-300"
      : "from-purple-50 to-purple-100 border-purple-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className={`bg-gradient-to-r ${urgencyColor} border rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-center gap-3 max-w-lg mx-auto mt-6`}
    >
      <span className="text-3xl">{next.emoji}</span>
      <div className="flex-1 text-center sm:text-left">
        <p className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>
          {next.label} is coming up — {urgencyText}
        </p>
        <p className={`text-xs mt-0.5 ${isDark ? "text-purple-200" : "text-gray-500"}`}>
          Create a personalised book before it's too late!
        </p>
      </div>
      <Link
        to={createPageUrl("CreateBook")}
        className="shrink-0 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-sm px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
      >
        Create now
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}qn