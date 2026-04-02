import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle, Circle, ExternalLink, Rocket, CreditCard, Globe,
  Mail, Shield, BookOpen, Image, Bell, Users, Settings, ArrowLeft
} from "lucide-react";

const CHECKLIST = [
  {
    section: "Payments",
    icon: CreditCard,
    color: "text-green-600 bg-green-50",
    items: [
      { id: "stripe_live", label: "Stripe switched to Live mode", detail: "Live keys are active — payments will be charged for real.", done: true },
      { id: "stripe_test", label: "Test a £0.01 checkout end-to-end", detail: "Place a real test order with a live card to confirm everything works.", done: false },
      { id: "stripe_webhook", label: "Stripe webhook secret configured", detail: "STRIPE_WEBHOOK_SECRET is set in your app secrets.", done: true },
    ],
  },
  {
    section: "Domain & Publishing",
    icon: Globe,
    color: "text-blue-600 bg-blue-50",
    items: [
      { id: "publish", label: "App published", detail: "Click the Publish button in the Base44 editor top-right.", done: false, link: null },
      { id: "domain", label: "Custom domain connected", detail: "Go to Settings → Custom Domain in your Base44 dashboard.", done: false, link: null },
      { id: "ssl", label: "SSL certificate active (HTTPS)", detail: "Auto-provisioned when custom domain is set.", done: false },
    ],
  },
  {
    section: "Branding & Content",
    icon: BookOpen,
    color: "text-purple-600 bg-purple-50",
    items: [
      { id: "favicon", label: "Favicon updated to your logo", detail: "Edit index.html and replace the favicon URL.", done: false },
      { id: "og_tags", label: "Social sharing meta tags set", detail: "Open Graph title, description and image are in index.html.", done: false },
      { id: "footer_links", label: "Privacy Policy & Terms pages linked", detail: "Add real legal pages or link to external docs in the footer.", done: false },
    ],
  },
  {
    section: "Email",
    icon: Mail,
    color: "text-amber-600 bg-amber-50",
    items: [
      { id: "email_test", label: "Test all transactional emails", detail: "Order confirmation, referral invite, gallery reward — send a test for each.", done: false },
      { id: "email_from", label: "From name set to GiftMyBookUK", detail: "Emails are sent from the app name automatically.", done: true },
      { id: "reminders", label: "Occasion reminder automation is active", detail: "Daily automation runs every morning at 8am.", done: true },
      { id: "gallery_email", label: "Gallery request automation is active", detail: "Sends photo upload email 7 days after printed orders.", done: true },
    ],
  },
  {
    section: "Security",
    icon: Shield,
    color: "text-red-600 bg-red-50",
    items: [
      { id: "admin_pw", label: "Change the admin dashboard password", detail: "Update ADMIN_PASSWORD in pages/AdminDashboard.jsx before launch.", done: false },
      { id: "gdpr", label: "GDPR / Cookie consent banner", detail: "Add a cookie consent banner if collecting analytics.", done: false },
    ],
  },
  {
    section: "Gallery & Social Proof",
    icon: Image,
    color: "text-pink-600 bg-pink-50",
    items: [
      { id: "gallery", label: "Product gallery page is live", detail: "Customers can view approved photos at /ProductGallery.", done: true },
      { id: "testimonials", label: "Add real customer testimonials", detail: "Update TestimonialCarousel with real reviews once you have them.", done: false },
    ],
  },
];

export default function LaunchChecklist() {
  const [checked, setChecked] = useState(() => {
    const auto = {};
    CHECKLIST.forEach(s => s.items.forEach(i => { if (i.done) auto[i.id] = true; }));
    return auto;
  });

  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const total = CHECKLIST.reduce((s, sec) => s + sec.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <Rocket className="w-5 h-5 text-purple-600" /> Launch Checklist
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm font-bold text-purple-700">{done}/{total} done</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2D1B4E] to-[#4A2D7A] rounded-3xl p-8 text-white text-center"
        >
          <div className="text-5xl mb-3">{pct === 100 ? "🚀" : "📋"}</div>
          <h2 className="font-serif text-2xl font-bold mb-1">
            {pct === 100 ? "You're ready to launch!" : `${pct}% ready to launch`}
          </h2>
          <p className="text-purple-200 text-sm mb-5">
            {pct === 100
              ? "Everything is checked off — hit Publish and go live! 🎉"
              : `${total - done} item${total - done !== 1 ? "s" : ""} remaining before you go live`}
          </p>
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
            />
          </div>
          <p className="text-amber-300 text-xs mt-2 font-medium">{pct}% complete</p>
        </motion.div>

        {/* Sections */}
        {CHECKLIST.map((section, si) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: si * 0.07 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${section.color}`}>
                <section.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">{section.section}</h3>
              <span className="ml-auto text-xs text-gray-400">
                {section.items.filter(i => checked[i.id]).length}/{section.items.length}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">
                    {checked[item.id]
                      ? <CheckCircle className="w-5 h-5 text-green-500" />
                      : <Circle className="w-5 h-5 text-gray-300" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${checked[item.id] ? "line-through text-gray-400" : "text-gray-900"}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Platform actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-6 space-y-3"
        >
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <Settings className="w-4 h-4" /> Platform Actions (Base44 Dashboard)
          </h3>
          {[
            { label: "Publish your app", desc: "Click the Publish button in the top-right of the Base44 editor" },
            { label: "Set a custom domain", desc: "Settings → Custom Domain → enter your domain and follow DNS instructions" },
            { label: "Get your shareable live link", desc: "After publishing, your live URL appears in Settings → Publish" },
            { label: "Invite team members", desc: "Settings → Team to add collaborators" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <ExternalLink className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">{a.label}</p>
                <p className="text-xs text-amber-600">{a.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {pct === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
            <p className="text-gray-500">GiftMyBookUK is ready for the world. Now go make people's days magical ✨</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}