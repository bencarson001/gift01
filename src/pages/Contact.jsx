import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Send, CheckCircle, Mail, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    await base44.integrations.Core.SendEmail({
      to: "benjamin@gift-my-book.co.uk",
      from_name: `GiftMyBookUK Contact Form`,
      subject: `[Contact] ${form.subject || "New message"} — from ${form.name}`,
      body: `<p><strong>Name:</strong> ${form.name}</p>
<p><strong>Email:</strong> ${form.email}</p>
<p><strong>Subject:</strong> ${form.subject}</p>
<hr/>
<p>${form.message.replace(/\n/g, "<br/>")}</p>`,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-500" /> Contact Us
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Info strip */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 flex items-start gap-3">
            <Mail className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Email us directly</p>
              <a href="mailto:benjamin@gift-my-book.co.uk" className="text-purple-600 text-sm hover:underline">
                benjamin@gift-my-book.co.uk
              </a>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Response time</p>
              <p className="text-gray-500 text-sm">We aim to reply within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6 md:p-8"
        >
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <h2 className="font-serif text-2xl font-bold text-gray-900">Message Sent!</h2>
              <p className="text-gray-500 max-w-xs">
                Thanks for getting in touch, {form.name}. We'll get back to you within 24 hours.
              </p>
              <Link to={createPageUrl("Home")}>
                <Button variant="outline" className="mt-4 rounded-xl">Back to Home</Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-bold text-gray-900 mb-1">Get in Touch</h2>
              <p className="text-gray-500 text-sm mb-6">Questions, feedback, or anything else — we'd love to hear from you.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your Name *</label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Sarah"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Your Email *</label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="sarah@example.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Subject</label>
                  <Input
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="e.g. Question about my order"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none bg-transparent"
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}