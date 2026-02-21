import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function WizardQuestion({ question, value, onChange, index, total }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex gap-1">
          {Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= index ? "w-8 bg-gradient-to-r from-purple-500 to-amber-400" : "w-4 bg-gray-200"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400 ml-auto">{index + 1} of {total}</span>
      </div>

      <Label className="text-lg font-serif text-gray-800 leading-relaxed">
        {question.emoji && <span className="mr-2">{question.emoji}</span>}
        {question.label}
      </Label>

      {question.hint && (
        <p className="text-sm text-gray-400 italic">{question.hint}</p>
      )}

      {question.type === "textarea" ? (
        <Textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="min-h-[100px] text-base border-purple-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl"
        />
      ) : question.type === "select" ? (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <motion.button
              key={opt.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.value)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                value === opt.value
                  ? "border-amber-400 bg-amber-50 text-amber-800"
                  : "border-gray-200 hover:border-purple-300 bg-white"
              }`}
            >
              {opt.emoji && <span className="mr-2">{opt.emoji}</span>}
              <span className="text-sm font-medium">{opt.label}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <Input
          type={question.type || "text"}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="text-base border-purple-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl h-12"
        />
      )}
    </motion.div>
  );
}