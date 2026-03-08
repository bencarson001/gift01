import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Gift, Users, Copy, Check, ArrowLeft, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import SparkleParticles from "../components/SparkleParticles";

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const referralCode = user?.email
    ? btoa(user.email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()
    : "GIFT8UK";
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const { data: referrals = [] } = useQuery({
    queryKey: ["referrals", user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
  });

  const credited = referrals.filter((r) => r.status === "credited");
  const pending = referrals.filter((r) => r.status === "pending");
  const totalEarned = credited.length * 5;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sendInvite = async () => {
    if (!friendEmail || !user) return;
    setSending(true);

    // Create referral record
    await base44.entities.Referral.create({
      referrer_email: user.email,
      referred_email: friendEmail,
      referral_code: referralCode,
      status: "pending",
      credit_amount_gbp: 5,
    });

    // Send invite email
    await base44.integrations.Core.SendEmail({
      to: friendEmail,
      subject: `${user.full_name || "A friend"} has invited you to GiftMyBookUK ✨`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
          <div style="background: white; border-radius: 24px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🎁</div>
            <h1 style="color: #2D1B4E; font-size: 26px; margin: 0 0 16px;">You've been invited to create something magical!</h1>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
              <strong>${user.full_name || "Your friend"}</strong> thinks you'd love GiftMyBookUK — 
              where you can create beautiful AI-powered personalised gift books in under 60 seconds.
            </p>
            <p style="color: #4A2D7A; font-size: 15px; font-weight: bold; margin-bottom: 32px;">
              🎉 Use code <span style="background: #F3E8FF; padding: 4px 12px; border-radius: 8px; font-family: monospace;">${referralCode}</span> for a special welcome gift!
            </p>
            <a href="${referralLink}" style="background: linear-gradient(135deg, #D4A853, #F0D88A); color: #1a1a1a; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-size: 16px; font-weight: bold; display: inline-block;">
              Create My Free Book Preview ✨
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px;">GiftMyBookUK · Made with ❤️ in the UK 🇬🇧</p>
          </div>
        </div>
      `,
    });

    setSending(false);
    setSent(true);
    setFriendEmail("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("MyLibrary")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900">Refer Friends & Earn</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7A] to-[#3D2060] rounded-3xl p-8 text-white overflow-hidden text-center"
        >
          <SparkleParticles active count={12} />
          <div className="relative z-10">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="font-serif text-3xl font-bold mb-3">Earn £5 per friend</h2>
            <p className="text-purple-200 text-base max-w-md mx-auto">
              Share your unique link. When a friend makes their first purchase, you both get £5 credit automatically.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Total Referrals", value: referrals.length, color: "text-purple-600 bg-purple-50" },
            { icon: Clock, label: "Pending", value: pending.length, color: "text-amber-600 bg-amber-50" },
            { icon: TrendingUp, label: "Total Earned", value: `£${totalEarned}`, color: "text-green-600 bg-green-50" },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Share link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">Your referral link</h3>
          <p className="text-sm text-gray-500 mb-4">Share this anywhere — social, WhatsApp, email</p>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="h-12 rounded-xl font-mono text-sm bg-gray-50 border-gray-200" />
            <Button onClick={copyLink} className="h-12 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {copied && <p className="text-xs text-purple-600 mt-2 font-medium">✓ Copied to clipboard!</p>}
        </motion.div>

        {/* Direct invite */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">Invite by email</h3>
          <p className="text-sm text-gray-500 mb-4">We'll send them a beautiful invite on your behalf</p>
          <div className="flex gap-2">
            <Input
              type="email"
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="friend@example.com"
              className="h-12 rounded-xl border-gray-200"
            />
            <Button
              onClick={sendInvite}
              disabled={sending || !friendEmail}
              className="h-12 px-4 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl shrink-0"
            >
              {sent ? <Check className="w-4 h-4" /> : sending ? "Sending..." : "Invite"}
            </Button>
          </div>
          {sent && <p className="text-xs text-green-600 mt-2 font-medium">✓ Invite sent!</p>}
        </motion.div>

        {/* Referral history */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-4">Referral history</h3>
            <div className="space-y-3">
              {referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                      {r.referred_email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.referred_email}</p>
                      <p className="text-xs text-gray-400">{r.created_date ? format(new Date(r.created_date), "d MMM yyyy") : ""}</p>
                    </div>
                  </div>
                  <Badge className={
                    r.status === "credited" ? "bg-green-100 text-green-700 border-green-200" :
                    r.status === "completed" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  }>
                    {r.status === "credited" ? `+£${r.credit_amount_gbp}` : r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}