import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, HelpCircle } from "lucide-react";
import PricingCard from "../components/PricingCard";
import SparkleParticles from "../components/SparkleParticles";

const FAQ = [
  { q: "How long does generation take?", a: "Most books are generated in under 60 seconds. Complex stories with many illustrations may take slightly longer." },
  { q: "Can I edit my book after generation?", a: "Absolutely! Use the 'Refine with AI' feature to make unlimited changes before purchasing." },
  { q: "How is the printed book quality?", a: "We use premium 170gsm satin paper with a luxury hardcover binding. It's genuinely beautiful." },
  { q: "What if I'm not happy?", a: "We stand by the quality of every book. If there's an issue with your order, please contact us and we'll do our best to make it right." },
  { q: "How long does delivery take?", a: "Printed books are typically delivered within 5-7 working days to UK addresses. Free delivery included!" },
  { q: "Is my data safe?", a: "Yes! We're fully GDPR compliant and never share your personal stories or data with anyone." },
];

export default function Pricing() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    navigate(createPageUrl("CreateBook"));
  };

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900">
            GiftMyBook<span className="text-amber-500">UK</span>
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 relative"
        >
          <SparkleParticles active count={10} />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Magical Pricing ✨
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Every option includes a fully personalised AI book with custom illustrations. All prices include VAT.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          {["digital", "printed", "subscription"].map((plan, i) => (
            <motion.div
              key={plan}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <PricingCard plan={plan} onSelect={handleSelectPlan} />
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-gray-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-purple-50"
              >
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-purple-500" />
                  {item.q}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed pl-6">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}