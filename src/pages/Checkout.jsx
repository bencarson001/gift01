import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Loader2, CreditCard, Truck, Download, Star,
  Shield, Lock, CheckCircle, Info, Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StripeCardForm from "../components/checkout/StripeCardForm";
import AppleGooglePay from "../components/checkout/AppleGooglePay";

const PLAN_DETAILS = {
  digital: {
    name: "Digital PDF",
    price: 9.99,
    vat: 1.67,
    icon: Download,
    color: "from-purple-500 to-purple-700",
    badge: "Instant Download",
    badgeColor: "bg-purple-100 text-purple-700",
    features: ["Instant PDF download", "Email delivery", "Share with friends", "Redownload anytime"],
  },
  printed: {
    name: "Premium Hardcover",
    price: 29.99,
    vat: 5.00,
    icon: Truck,
    color: "from-amber-500 to-amber-700",
    badge: "Free UK Delivery",
    badgeColor: "bg-amber-100 text-amber-700",
    features: ["Museum-quality hardcover", "Free UK delivery", "Gift-ready packaging", "Includes digital PDF too"],
  },
  subscription: {
    name: "Unlimited Monthly",
    price: 7.99,
    vat: 1.33,
    icon: Star,
    color: "from-green-500 to-green-700",
    badge: "Best Value",
    badgeColor: "bg-green-100 text-green-700",
    features: ["Unlimited books/month", "All occasions", "Priority generation", "Cancel anytime"],
  },
};

const STRIPE_MODES = {
  test: { label: "Test Mode", color: "text-amber-600 bg-amber-50 border-amber-200" },
  live: { label: "Live Mode", color: "text-green-700 bg-green-50 border-green-200" },
};

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const planType = urlParams.get("plan") || "digital";

  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");
  const [expressMethod, setExpressMethod] = useState(null);
  const [stripeMode] = useState("test"); // toggled by admin via env
  const [shippingAddress, setShippingAddress] = useState({
    name: "", line1: "", line2: "", city: "", postcode: "",
  });
  const [user, setUser] = React.useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsToUse, setCouponsToUse] = useState(0);

  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setUser(me);
      if (me?.email) {
        const credited = await base44.entities.Referral.filter({ referrer_email: me.email, status: "credited" });
        setAvailableCoupons(credited.length);
      }
    }).catch(() => {});
  }, []);

  const { data: book } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    enabled: !!bookId,
    select: (d) => d?.[0],
  });

  const plan = PLAN_DETAILS[planType] || PLAN_DETAILS.digital;
  const PlanIcon = plan.icon;
  const subtotal = plan.price - plan.vat;
  const couponDiscount = Math.min(couponsToUse, availableCoupons);
  const finalPrice = Math.max(0, plan.price - couponDiscount);

  const isFormValid = () => {
    if (!email) return false;
    if (planType === "printed") {
      return shippingAddress.name && shippingAddress.line1 && shippingAddress.postcode;
    }
    return true;
  };

  const handlePurchase = async () => {
    if (!isFormValid()) return;
    setIsProcessing(true);

    // Mark used coupons as spent
    if (couponDiscount > 0 && user?.email) {
      const creditedReferrals = await base44.entities.Referral.filter({ referrer_email: user.email, status: "credited" });
      const toSpend = creditedReferrals.slice(0, couponDiscount);
      await Promise.all(toSpend.map((r) => base44.entities.Referral.update(r.id, { status: "spent" })));
    }

    // Create order record
    await base44.entities.Order.create({
      book_id: bookId,
      product_type: planType,
      price_gbp: finalPrice,
      vat_amount: plan.vat,
      status: "paid",
      recipient_email: email,
      shipping_address: planType === "printed" ? { ...shippingAddress, country: "GB" } : undefined,
    });

    // Update book status
    if (book) {
      await base44.entities.Book.update(book.id, { status: "purchased" });
    }

    // Send confirmation email
    const bookTitle = book?.title || "Your Personalised Book";
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `🎉 "${bookTitle}" is ready — GiftMyBookUK`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
          <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 4px 24px rgba(74,45,122,0.08);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4A2D7A, #7B5EA7); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                <span style="font-size: 36px;">📖</span>
              </div>
              <h1 style="color: #2D1B4E; font-size: 28px; margin: 0 0 8px;">Your book is ready! ✨</h1>
              <p style="color: #6B7280; font-size: 16px; margin: 0;">"${bookTitle}"</p>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.8;">
              ${planType === "digital" ? `Your digital PDF is ready in your <a href="${window.location.origin}${createPageUrl("MyLibrary")}" style="color: #D4A853; font-weight: bold;">My Library</a>. Download and share it with ${book?.recipient_name || "your recipient"} — we hope it makes them smile! 😊` : ""}
              ${planType === "printed" ? `Your premium hardcover is being prepared with love and will be shipped within 3–5 working days. We'll send you a tracking link as soon as it's on its way! 📦` : ""}
              ${planType === "subscription" ? `Welcome to GiftMyBookUK Unlimited! You can now create as many magical personalised books as you like. Your subscription renews monthly. 🌟` : ""}
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${window.location.origin}${createPageUrl("MyLibrary")}" style="background: linear-gradient(135deg, #4A2D7A, #7B5EA7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: bold;">View My Library →</a>
            </div>
            <p style="color: #9CA3AF; font-size: 13px; text-align: center; border-top: 1px solid #F3F4F6; padding-top: 24px; margin-top: 24px;">
              With love, GiftMyBookUK 📖✨<br/>
              <span style="font-size: 12px;">© 2026 GiftMyBookUK · Made with ❤️ in the UK</span>
            </p>
          </div>
        </div>
      `,
    });

    setIsProcessing(false);
    navigate(createPageUrl("OrderSuccess") + `?id=${bookId}&plan=${planType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-amber-50/20">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-xl font-bold text-gray-900">Secure Checkout</h1>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${STRIPE_MODES[stripeMode].color}`}>
              {STRIPE_MODES[stripeMode].label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
            <Shield className="w-4 h-4" /> Secure
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">

          {/* LEFT: Payment Form */}
          <div className="lg:col-span-3 space-y-5">

            {/* Express checkout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <AppleGooglePay
                amount={plan.price}
                selected={expressMethod}
                onSelect={(m) => setExpressMethod(expressMethod === m ? null : m)}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center justify-center font-bold">1</span>
                Contact details
              </h3>
              <div>
                <Label className="text-sm text-gray-600">Email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.co.uk"
                  className="mt-1 h-12 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" /> We'll send your book and receipt here
                </p>
              </div>
            </motion.div>

            {/* Shipping Address (printed only) */}
            <AnimatePresence>
              {planType === "printed" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                    Delivery address
                    <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      🇬🇧 UK only
                    </span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600">Recipient's full name</Label>
                      <Input value={shippingAddress.name} onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })} placeholder="Sarah Johnson" className="mt-1 h-12 rounded-xl border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Address line 1</Label>
                      <Input value={shippingAddress.line1} onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })} placeholder="42 Oak Avenue" className="mt-1 h-12 rounded-xl border-gray-200" />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Address line 2 (optional)</Label>
                      <Input value={shippingAddress.line2} onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })} placeholder="Flat 3" className="mt-1 h-12 rounded-xl border-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">City</Label>
                        <Input value={shippingAddress.city} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} placeholder="London" className="mt-1 h-12 rounded-xl border-gray-200" />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Postcode</Label>
                        <Input value={shippingAddress.postcode} onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })} placeholder="SW1A 1AA" className="mt-1 h-12 rounded-xl border-gray-200" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Card Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center justify-center font-bold">
                  {planType === "printed" ? "3" : "2"}
                </span>
                Payment details
                <div className="ml-auto flex items-center gap-1.5">
                  {["visa", "mc", "amex"].map((c) => (
                    <div key={c} className="h-6 px-2 bg-gray-100 rounded text-xs flex items-center font-medium text-gray-500">
                      {c === "visa" ? "VISA" : c === "mc" ? "MC" : "AMEX"}
                    </div>
                  ))}
                </div>
              </h3>
              <StripeCardForm />
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span>256-bit SSL encryption · Powered by Stripe</span>
              </div>
            </motion.div>

            {/* Pay Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Button
                onClick={handlePurchase}
                disabled={isProcessing || !isFormValid()}
                className="w-full h-14 text-base bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing payment...</>
                ) : (
                  <><Lock className="w-4 h-4 mr-2" /> Pay £{finalPrice.toFixed(2)} now{couponDiscount > 0 ? ` (saved £${couponDiscount})` : ""}</>
                )}
              </Button>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure payment</span>
                <span>·</span>
                <span>100% satisfaction guarantee</span>
                <span>·</span>
                <span>Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="sticky top-24 space-y-4"
            >
              {/* Plan card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${plan.color} p-5 text-white`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <PlanIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold mt-1">
                    £{plan.price.toFixed(2)}
                    {planType === "subscription" && <span className="text-base font-normal opacity-80">/mo</span>}
                  </p>
                </div>

                <div className="p-5">
                  {book && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 mb-4">
                      {book.cover_image_url ? (
                        <img src={book.cover_image_url} alt="cover" className="w-12 h-14 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-14 bg-gradient-to-br from-purple-200 to-amber-200 rounded-lg flex items-center justify-center text-xl">📖</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{book.title}</p>
                        <p className="text-xs text-gray-500">For {book.recipient_name}</p>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-2.5 mb-5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal</span>
                      <span>£{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>VAT (20%)</span>
                      <span>£{plan.vat.toFixed(2)}</span>
                    </div>
                    {planType === "printed" && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Delivery</span>
                        <span>FREE</span>
                      </div>
                    )}

                    {/* Referral coupons */}
                    {availableCoupons > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                          <p className="text-xs font-semibold text-amber-800">
                            You have {availableCoupons} referral coupon{availableCoupons > 1 ? "s" : ""} (£{availableCoupons} total)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-700">Apply:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setCouponsToUse(Math.max(0, couponsToUse - 1))}
                              className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-bold text-sm flex items-center justify-center hover:bg-amber-300"
                            >−</button>
                            <span className="text-sm font-bold text-amber-900 w-6 text-center">{couponsToUse}</span>
                            <button
                              onClick={() => setCouponsToUse(Math.min(availableCoupons, couponsToUse + 1))}
                              className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-bold text-sm flex items-center justify-center hover:bg-amber-300"
                            >+</button>
                          </div>
                          <span className="text-xs text-amber-700 ml-auto">
                            {couponsToUse > 0 ? `−£${couponsToUse} off` : "none applied"}
                          </span>
                        </div>
                      </div>
                    )}

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>Referral coupons ({couponDiscount}×£1)</span>
                        <span>−£{couponDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                      <span>Total{planType === "subscription" ? "/month" : ""}</span>
                      <span>£{finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="space-y-3">
                  {[
                    { icon: "🔒", text: "Payments secured by Stripe" },
                    { icon: "🇬🇧", text: "UK company, GDPR compliant" },
                    { icon: "⭐", text: "4.9/5 from 10,000+ customers" },
                    { icon: "↩️", text: "30-day money-back guarantee" },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="text-base">{t.icon}</span>
                      <span>{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}