import React from "react";
import { motion } from "framer-motion";

export default function AppleGooglePay({ amount, onSelect, selected }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-center text-gray-400 font-medium uppercase tracking-wider">Express checkout</p>
      <div className="grid grid-cols-2 gap-3">
        {/* Apple Pay */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("apple")}
          className={`h-12 rounded-xl border-2 flex items-center justify-center font-semibold text-sm transition-all ${
            selected === "apple"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 bg-black hover:border-gray-400"
          }`}
        >
          <span className={`font-medium text-base ${selected === "apple" ? "text-purple-700" : "text-white"}`}>
            {selected === "apple" ? "✓ Apple Pay" : " Pay"}
          </span>
        </motion.button>

        {/* Google Pay */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("google")}
          className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
            selected === "google"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 bg-white hover:border-gray-400"
          }`}
        >
          {selected === "google" ? (
            <span className="font-medium text-purple-700 text-sm">✓ Google Pay</span>
          ) : (
            <span className="font-bold text-sm">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
              <span className="text-gray-700"> Pay</span>
            </span>
          )}
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">or pay by card</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
    </div>
  );
}