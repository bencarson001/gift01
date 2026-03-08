import React, { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function ReferralCard({ user }) {
  const [copied, setCopied] = useState(false);

  const referralCode = user?.email
    ? btoa(user.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()
    : "GIFT8UK";

  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
  });

  const credited = referrals.filter((r) => r.status === "credited").length;
  const pending = referrals.filter((r) => r.status === "pending").length;
  const totalCredit = credited * 5;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7A] to-[#2D1B4E] rounded-3xl p-6 text-white overflow-hidden"
    >
      {/* Background sparkle */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-300 rounded-full"
            style={{ left: `${10 + i * 11}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity, repeatDelay: 1 }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-400/30">
            <Gift className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold">Refer Friends, Earn £5</h3>
            <p className="text-purple-200 text-xs">For every friend who purchases</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Referrals", value: referrals.length, IconComp: Users },
            { label: "Pending", value: pending, IconComp: Sparkles },
            { label: "Earned", value: `£${totalCredit}`, IconComp: Gift },
          ].map(({ label, value, IconComp }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm border border-white/10">
              <IconComp className="w-4 h-4 text-amber-300 mx-auto mb-1" />
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-purple-200">{label}</p>
            </div>
          ))}
        </div>

        {/* Referral link */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
          <p className="text-xs text-purple-200 mb-1.5">Your unique referral link</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono flex-1 truncate text-amber-200">{referralLink}</p>
            <Button
              size="sm"
              onClick={copyLink}
              className="bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-xl px-3 shrink-0 h-8"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {copied && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-amber-300 text-center mt-2"
          >
            ✓ Link copied — share it with friends!
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}