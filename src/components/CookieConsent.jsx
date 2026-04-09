import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it doesn't pop immediately on load
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="fixed bottom-20 md:bottom-4 left-0 right-0 z-[300] px-4 flex justify-center pointer-events-none"
        >
          <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4 max-w-xl w-full pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">🍪 We use cookies</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                We use cookies to improve your experience and show relevant ads via Google AdSense. See our{" "}
                <Link to="/PrivacyPolicy" className="text-purple-400 hover:text-purple-300 underline" onClick={accept}>
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
              <Button
                onClick={decline}
                variant="ghost"
                size="sm"
                className="flex-1 sm:flex-none text-gray-400 hover:text-white hover:bg-white/10 rounded-xl text-xs h-9"
              >
                Decline
              </Button>
              <Button
                onClick={accept}
                size="sm"
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs h-9 font-semibold"
              >
                Accept All
              </Button>
            </div>
            <button onClick={decline} className="absolute top-3 right-3 text-gray-500 hover:text-white sm:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}