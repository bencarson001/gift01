import React from "react";
import { motion } from "framer-motion";

const OCCASION_DATA = {
  birthday: { emoji: "🎂", gradient: "from-pink-500 to-orange-400", label: "Birthday" },
  anniversary: { emoji: "💍", gradient: "from-rose-400 to-purple-500", label: "Anniversary" },
  baby: { emoji: "👶", gradient: "from-blue-300 to-pink-300", label: "New Baby" },
  wedding: { emoji: "💒", gradient: "from-amber-200 to-rose-300", label: "Wedding" },
  roast: { emoji: "🔥", gradient: "from-red-500 to-orange-500", label: "Roast / Funny" },
  kids_adventure: { emoji: "🏰", gradient: "from-emerald-400 to-cyan-400", label: "Kids Adventure" },
  couples_love_story: { emoji: "💕", gradient: "from-pink-400 to-red-400", label: "Love Story" },
  corporate_thank_you: { emoji: "🏢", gradient: "from-slate-400 to-blue-500", label: "Corporate Thanks" },
  valentines: { emoji: "❤️", gradient: "from-red-400 to-pink-500", label: "Valentine's Day" },
  retirement: { emoji: "🎉", gradient: "from-yellow-400 to-amber-500", label: "Retirement" },
  graduation: { emoji: "🎓", gradient: "from-indigo-500 to-purple-500", label: "Graduation" },
  new_home: { emoji: "🏡", gradient: "from-green-400 to-emerald-500", label: "New Home" },
  get_well: { emoji: "🌻", gradient: "from-yellow-300 to-green-400", label: "Get Well Soon" },
  christmas: { emoji: "🎄", gradient: "from-red-500 to-green-600", label: "Christmas" },
  mothers_day: { emoji: "🌷", gradient: "from-pink-300 to-purple-400", label: "Mother's Day" },
  fathers_day: { emoji: "👔", gradient: "from-blue-500 to-indigo-500", label: "Father's Day" },
  friendship: { emoji: "🤝", gradient: "from-violet-400 to-pink-400", label: "Friendship" },
  pet_tribute: { emoji: "🐾", gradient: "from-amber-400 to-orange-400", label: "Pet Tribute" },
  travel_memoir: { emoji: "✈️", gradient: "from-sky-400 to-blue-500", label: "Travel Memoir" },
  teacher_appreciation: { emoji: "📚", gradient: "from-teal-400 to-emerald-500", label: "Teacher Thanks" },
};

export default function OccasionCard({ occasion, isSelected, onClick }) {
  const data = OCCASION_DATA[occasion] || { emoji: "📖", gradient: "from-gray-400 to-gray-500", label: occasion };

  return (
    <motion.button
      onClick={() => onClick(occasion)}
      className={`relative group rounded-2xl p-1 transition-all duration-300 ${
        isSelected ? "ring-2 ring-amber-400 ring-offset-2 scale-105" : "hover:scale-105"
      }`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={`bg-gradient-to-br ${data.gradient} rounded-2xl p-5 text-white text-center min-h-[120px] flex flex-col items-center justify-center gap-2 shadow-lg group-hover:shadow-xl transition-shadow`}>
        <span className="text-3xl">{data.emoji}</span>
        <span className="text-sm font-semibold leading-tight">{data.label}</span>
      </div>
      {isSelected && (
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

export { OCCASION_DATA };