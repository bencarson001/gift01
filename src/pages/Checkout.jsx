import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, CreditCard, ShoppingBag, Truck, Download, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ConfettiEffect from "../components/ConfettiEffect";
import SparkleParticles from "../components/SparkleParticles";

const PLAN_DETAILS = {
  digital: { name: "Digital PDF", price: 9.99, vat: 2.00, icon: Download, description: "Instant download + email delivery" },
  printed: { name: "Premium Hardcover", price: 29.99, vat: 6.00, icon: Truck, description: "Luxury printed book + free UK delivery" },
  subscription: { name: "Unlimited Monthly", price: 7.99, vat: 1.60, icon: CreditCard, description: "Unlimited books every month" },
};

export default function Checkout() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  const planType = urlParams.get("plan") || "digital";

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [email, setEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    name: "", line1: "", line2: "", city: "", postcode: "",
  });

  const { data: book } = useQuery({
    queryKey: ["book", bookId],
    queryFn: () => base44.entities.Book.filter({ id: bookId }),
    enabled: !!bookId,
    select: (data) => data[0],
  });

  const plan = PLAN_DETAILS[planType] || PLAN_DETAILS.digital;
  const Icon = plan.icon;

  const handlePurchase = async () => {
    if (!email) return;
    if (planType === "printed" && (!shippingAddress.name || !shippingAddress.line1 || !shippingAddress.postcode)) return;
    
    setIsProcessing(true);

    // Create order record
    const order = await base44.entities.Order.create({
      book_id: bookId,
      product_type: planType,
      price_gbp: plan.price,
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
    const bookTitle = book?.title || "Your GiftMyBookUK Book";
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: `🎉 Your book "${bookTitle}" is ready!`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="color: #4A2D7A; text-align: center;">Your Book is Ready! ✨</h1>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thank you for your order! "${bookTitle}" has been created with love and is ready for you.
          </p>
          ${planType === "digital" ? `<p style="color: #666;">Your digital PDF is ready for download in your <a href="${window.location.origin}${createPageUrl("MyLibrary")}" style="color: #D4A853;">My Library</a>.</p>` : ""}
          ${planType === "printed" ? `<p style="color: #666;">Your premium hardcover is being prepared and will be shipped to you shortly. We'll send tracking details once it's on its way!</p>` : ""}
          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 40px;">
            With love, GiftMyBookUK 📖✨
          </p>
        </div>
      `,
    });

    setIsProcessing(false);
    setOrderComplete(true);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen gradient-soft flex items-center justify-center p-4">
        <ConfettiEffect active />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center relative overflow-hidden"
        >
          <SparkleParticles active count={15} />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-green-600" />
          </motion.div>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mb-3">Order Complete! 🎉</h2>
          <p className="text-gray-500 mb-2">
            {planType === "digital"
              ? "Your digital book is ready for download!"
              : "Your premium hardcover is being prepared!"}
          </p>
          <p className="text-sm text-gray-400 mb-8">Confirmation sent to {email}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(createPageUrl("MyLibrary"))}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
            >
              Go to My Library
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("Home"))}
              className="w-full h-12 rounded-xl"
            >
              Create Another Book
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="font-serif text-xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Shield className="w-4 h-4" /> Secure
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100"
          >
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{plan.name}</p>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">£{plan.price.toFixed(2)}</p>
            </div>
            {book && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>📖</span>
                <span>"{book.title}" for {book.recipient_name}</span>
              </div>
            )}
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>£{(plan.price - plan.vat).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>VAT (20%)</span>
                <span>£{plan.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
                <span>Total</span>
                <span>£{plan.price.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100"
          >
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">Your Details</h3>
            <div className="space-y-4">
              <div>
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.co.uk"
                  className="mt-1 h-12 rounded-xl"
                />
                <p className="text-xs text-gray-400 mt-1">We'll send the book and receipt here</p>
              </div>
            </div>
          </motion.div>

          {/* Shipping Address (for printed) */}
          {planType === "printed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100"
            >
              <h3 className="font-serif text-xl font-bold text-gray-900 mb-4">
                <Truck className="w-5 h-5 inline mr-2 text-purple-500" /> Delivery Address
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Recipient's full name</Label>
                  <Input
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    placeholder="e.g. Sarah Johnson"
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Address line 1</Label>
                  <Input
                    value={shippingAddress.line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line1: e.target.value })}
                    placeholder="e.g. 42 Oak Avenue"
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label>Address line 2 (optional)</Label>
                  <Input
                    value={shippingAddress.line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, line2: e.target.value })}
                    placeholder="e.g. Flat 3"
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="e.g. London"
                      className="mt-1 h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label>Postcode</Label>
                    <Input
                      value={shippingAddress.postcode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postcode: e.target.value })}
                      placeholder="e.g. SW1A 1AA"
                      className="mt-1 h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pay Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !email}
              className="w-full h-14 text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-2xl shadow-lg shadow-amber-500/30"
            >
              {isProcessing ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
              ) : (
                <><CreditCard className="w-5 h-5 mr-2" /> Pay £{plan.price.toFixed(2)}</>
              )}
            </Button>
            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Secure payment · 100% satisfaction guarantee
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}