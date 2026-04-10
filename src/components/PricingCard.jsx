import React from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = {
  digital: {
    name: "Digital PDF",
    price: "24.99",
    icon: Zap,
    color: "purple",
    features: [
      "Instant PDF download",
      "Beautiful high-res layout",
      "Dedication page included",
      "Email delivery to recipient",
      "Shareable preview link",
    ],
    cta: "Get Digital Book",
  },
  printed: {
    name: "Premium Hardcover",
    price: "39.99",
    icon: Crown,
    color: "amber",
    popular: true,
    features: [
      "Everything in Digital, plus:",
      "Luxury hardcover printing",
      "Premium 170gsm satin pages",
      "Free UK delivery",
      "Gift-wrapped packaging",
      "Tracking number included",
    ],
    cta: "Order Printed Book",
  },
  subscription: {
    name: "Unlimited Monthly",
    price: "10.00",
    period: "/mo",
    icon: Sparkles,
    color: "rose",
    features: [
      "Unlimited digital books",
      "All occasions & styles",
      "Priority AI generation",
      "Printed books at 40% off",
      "Cancel anytime",
    ],
    cta: "Start Unlimited",
  },
};

export default function PricingCard({ plan, onSelect, bookId }) {
  const data = PLANS[plan];
  if (!data) return null;

  const Icon = data.icon;
  const colorClasses = {
    purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600", btn: "bg-purple-600 hover:bg-purple-700" },
    amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", btn: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" },
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", btn: "bg-rose-600 hover:bg-rose-700" },
  };
  const c = colorClasses[data.color];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`relative rounded-2xl border-2 ${data.popular ? "border-amber-400 shadow-xl shadow-amber-100" : "border-gray-200"} bg-white overflow-hidden`}
    >
      {data.popular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold text-center py-1.5 uppercase tracking-wider">
          ✨ Most Popular
        </div>
      )}

      <div className={`p-6 ${data.popular ? "pt-10" : ""}`}>
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>

        <h3 className="font-serif text-xl font-bold text-gray-900">{data.name}</h3>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-gray-900">£{data.price}</span>
          {data.period && <span className="text-gray-500">{data.period}</span>}
        </div>

        <p className="text-xs text-gray-400 mt-1">Inc. VAT</p>

        <ul className="mt-6 space-y-3">
          {data.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className={`w-4 h-4 mt-0.5 ${c.text} flex-shrink-0`} />
              <span className="text-sm text-gray-600">{f}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onSelect(plan)}
          className={`w-full mt-6 ${c.btn} text-white rounded-xl h-12 font-semibold`}
        >
          {data.cta}
        </Button>
      </div>
    </motion.div>
  );
}

export { PLANS };