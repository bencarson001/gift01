import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

// Affiliate partner offers — update hrefs with your real affiliate links
const OFFERS = [
  {
    name: "Photobox",
    logo: "📷",
    tagline: "Turn your book photos into prints",
    cta: "Shop Photobox →",
    bg: "from-orange-50 to-orange-100",
    border: "border-orange-200",
    textColor: "text-orange-800",
    ctaColor: "text-orange-600 hover:text-orange-800",
    // Replace with your Photobox affiliate link
    href: "https://www.photobox.co.uk/?utm_source=giftmybookuk&utm_medium=affiliate",
  },
  {
    name: "Moonpig",
    logo: "🐷",
    tagline: "Pair your book with a personalised card",
    cta: "Shop Moonpig →",
    bg: "from-pink-50 to-pink-100",
    border: "border-pink-200",
    textColor: "text-pink-800",
    ctaColor: "text-pink-600 hover:text-pink-800",
    // Replace with your Moonpig affiliate link
    href: "https://www.moonpig.com/?utm_source=giftmybookuk&utm_medium=affiliate",
  },
  {
    name: "Amazon Gifts",
    logo: "🎁",
    tagline: "Complete the gift with something extra",
    cta: "Browse Amazon →",
    bg: "from-amber-50 to-amber-100",
    border: "border-amber-200",
    textColor: "text-amber-800",
    ctaColor: "text-amber-600 hover:text-amber-800",
    // Replace with your Amazon Associates link
    href: "https://www.amazon.co.uk/gifts?tag=YOURTAG-21",
  },
];

export default function AffiliateOffers({ title = "Complete the Perfect Gift 🎁" }) {
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
        {title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OFFERS.map((offer, i) => (
          <motion.a
            key={offer.name}
            href={offer.href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`bg-gradient-to-br ${offer.bg} border ${offer.border} rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-all group`}
          >
            <span className="text-2xl shrink-0">{offer.logo}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold ${offer.textColor}`}>{offer.name}</p>
              <p className="text-xs text-gray-500 leading-tight">{offer.tagline}</p>
              <p className={`text-xs font-semibold mt-1 ${offer.ctaColor} flex items-center gap-1`}>
                {offer.cta} <ExternalLink className="w-3 h-3" />
              </p>
            </div>
          </motion.a>
        ))}
      </div>
      <p className="text-center text-xs text-gray-300 mt-2">Affiliate links — we may earn a small commission</p>
    </div>
  );
}