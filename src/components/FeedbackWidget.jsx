import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", comment: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setLoading(true);
    await base44.entities.Feedback.create({
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      comment: form.comment.trim(),
      page: window.location.pathname,
      is_read: false,
    });
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ name: "", email: "", comment: "" });
    }, 2000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-5 right-5 z-50 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition-colors"
        aria-label="Leave feedback"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Feedback
      </button>

      {/* Overlay + modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-32 md:bottom-16 right-5 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-semibold text-sm">Leave Feedback</span>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="font-semibold text-gray-900">Thanks for your feedback!</p>
                    <p className="text-xs text-gray-500">We really appreciate it.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="e.g. Sarah"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Comments *</label>
                      <textarea
                        required
                        value={form.comment}
                        onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                        placeholder="Tell us what you think..."
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Email <span className="text-gray-400">(optional)</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {loading ? "Sending..." : "Send Feedback"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}