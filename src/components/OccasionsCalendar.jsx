import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, BookOpen, CalendarDays } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday, addMonths } from "date-fns";

// Public UK gifting occasions keyed by MM-DD
const PUBLIC_OCCASIONS = {
  "01-01": { label: "New Year's Day", emoji: "🎆", occasion: "graduation" },
  "02-14": { label: "Valentine's Day", emoji: "❤️", occasion: "valentines" },
  "03-17": { label: "St Patrick's Day", emoji: "🍀", occasion: "friendship" },
  "03-30": { label: "Easter Sunday 2025", emoji: "🐣", occasion: "birthday" },
  "04-05": { label: "Easter Sunday 2026", emoji: "🐣", occasion: "birthday" },
  "05-11": { label: "Mother's Day", emoji: "🌷", occasion: "mothers_day" },
  "06-15": { label: "Father's Day", emoji: "⚽", occasion: "fathers_day" },
  "10-31": { label: "Halloween", emoji: "🎃", occasion: "roast" },
  "11-05": { label: "Bonfire Night", emoji: "🎇", occasion: "friendship" },
  "12-25": { label: "Christmas Day", emoji: "🎄", occasion: "christmas" },
  "12-26": { label: "Boxing Day", emoji: "🎁", occasion: "birthday" },
  "12-31": { label: "New Year's Eve", emoji: "🥂", occasion: "graduation" },
};

function getOccasionsForMonth(year, month) {
  const result = [];
  const daysInMonth = endOfMonth(new Date(year, month, 1)).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const key = `${mm}-${dd}`;
    if (PUBLIC_OCCASIONS[key]) {
      result.push({ day: d, ...PUBLIC_OCCASIONS[key] });
    }
  }
  return result;
}

function getNextUpcomingOccasion(fromDate) {
  const today = fromDate || new Date();
  for (let offset = 0; offset <= 365; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const key = `${mm}-${dd}`;
    if (PUBLIC_OCCASIONS[key]) {
      return { date: d, ...PUBLIC_OCCASIONS[key], daysAway: offset };
    }
  }
  return null;
}

export default function OccasionsCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [displayDate, setDisplayDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const firstDay = startOfMonth(displayDate);
  const lastDay = endOfMonth(displayDate);
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  const startPadding = (getDay(firstDay) + 6) % 7; // Monday start

  const occasionsThisMonth = getOccasionsForMonth(year, month);

  // If no occasions this month, peek at next
  const displayMonth = occasionsThisMonth.length === 0
    ? addMonths(displayDate, 1)
    : displayDate;

  const nextOccasion = getNextUpcomingOccasion(today);

  const getDayOccasion = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return PUBLIC_OCCASIONS[`${mm}-${dd}`];
  };

  const prevMonth = () => setDisplayDate(d => addMonths(d, -1));
  const nextMonth = () => setDisplayDate(d => addMonths(d, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      {/* Heading */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-3">
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-purple-200">Plan Ahead</span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
          Upcoming Gifting Occasions
        </h2>
        <p className="text-purple-200 text-sm">
          Never miss an opportunity to make someone's day magical
        </p>
      </div>

      {/* Next upcoming banner */}
      {nextOccasion && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-400/20 border border-amber-400/40 rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{nextOccasion.emoji}</span>
            <div>
              <p className="text-white font-bold text-sm">{nextOccasion.label}</p>
              <p className="text-amber-300 text-xs">
                {nextOccasion.daysAway === 0 ? "Today!" : nextOccasion.daysAway === 1 ? "Tomorrow!" : `In ${nextOccasion.daysAway} days · ${format(nextOccasion.date, "d MMM")}`}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(createPageUrl("CreateBook") + `?occasion=${nextOccasion.occasion}`)}
            className="shrink-0 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" /> Create Book
          </button>
        </motion.div>
      )}

      {/* Calendar */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <button onClick={prevMonth} className="text-white/60 hover:text-white p-1 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-serif text-lg font-bold text-white">
            {format(displayDate, "MMMM yyyy")}
          </h3>
          <button onClick={nextMonth} className="text-white/60 hover:text-white p-1 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/10">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
            <div key={d} className="text-center text-xs text-purple-300 font-medium py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Padding */}
          {[...Array(startPadding)].map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {/* Days */}
          {days.map((day) => {
            const d = day.getDate();
            const occ = getDayOccasion(d);
            const todayFlag = isToday(day);
            return (
              <div
                key={d}
                onClick={occ ? () => navigate(createPageUrl("CreateBook") + `?occasion=${occ.occasion}`) : undefined}
                className={`flex flex-col items-center justify-start text-xs relative py-1 px-0.5 min-h-[52px]
                  ${occ ? "cursor-pointer hover:bg-white/20 transition-colors rounded-xl" : ""}
                  ${todayFlag ? "bg-amber-400/20 rounded-xl" : ""}
                `}
              >
                <span className={`font-medium ${todayFlag ? "text-amber-300" : "text-white/80"} ${occ ? "text-white font-bold" : ""}`}>
                  {d}
                </span>
                {occ && (
                  <div className="flex flex-col items-center mt-0.5">
                    <span className="text-base leading-none">{occ.emoji}</span>
                    <span className="text-white/90 font-medium text-center leading-tight mt-0.5" style={{ fontSize: "9px" }}>
                      {occ.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {occasionsThisMonth.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10 space-y-2">
            {occasionsThisMonth.map((occ) => (
              <button
                key={occ.day}
                onClick={() => navigate(createPageUrl("CreateBook") + `?occasion=${occ.occasion}`)}
                className="w-full flex items-center justify-between gap-2 hover:bg-white/10 rounded-xl px-3 py-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{occ.emoji}</span>
                  <span className="text-sm text-white font-medium">{occ.label}</span>
                  <span className="text-xs text-purple-300">— {format(new Date(year, month, occ.day), "d MMM")}</span>
                </div>
                <span className="text-xs text-amber-300 font-medium shrink-0">Create Book →</span>
              </button>
            ))}
          </div>
        )}

        {occasionsThisMonth.length === 0 && (
          <div className="px-5 py-4 border-t border-white/10 text-center text-purple-300 text-sm">
            No major occasions this month — check {format(addMonths(displayDate, 1), "MMMM")} →
          </div>
        )}
      </div>

      {/* Login nudge */}
      <p className="text-center text-purple-300 text-xs mt-4">
        <a href={createPageUrl("UserProfile")} className="underline hover:text-amber-300 transition-colors">
          Sign in to add your own occasions
        </a>{" "}
        & get email reminders 🔔
      </p>
    </motion.div>
  );
}