import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Camera, Check, Clock, Loader2, Star, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
  generating: { label: "Generating", className: "bg-blue-100 text-blue-600" },
  preview: { label: "Preview", className: "bg-purple-100 text-purple-600" },
  purchased: { label: "Purchased", className: "bg-green-100 text-green-600" },
  printed: { label: "Printed", className: "bg-amber-100 text-amber-700" },
};

function UploadSlot({ index, imageUrl, onUpload, uploading }) {
  const inputRef = React.useRef();
  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
        ${imageUrl ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-purple-300 bg-gray-50 hover:bg-purple-50"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files[0] && onUpload(index, e.target.files[0])}
      />
      {uploading ? (
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
      ) : (
        <>
          <Camera className="w-6 h-6 text-gray-300 mb-1" />
          <span className="text-xs text-gray-400">Photo {index + 1}</span>
        </>
      )}
    </div>
  );
}

export default function OrdersUploadTab({ user }) {
  const queryClient = useQueryClient();
  const [uploadingOrder, setUploadingOrder] = useState(null);
  const [images, setImages] = useState({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState({});
  const [aiError, setAiError] = useState(null);

  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders", user?.email],
    queryFn: () => base44.entities.Order.filter({ recipient_email: user?.email }),
    enabled: !!user?.email,
  });

  const { data: galleries = [] } = useQuery({
    queryKey: ["user-galleries", user?.email],
    queryFn: () => base44.entities.ProductGallery.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const purchasedOrders = orders.filter(o => o.status === "paid" || o.status === "shipped" || o.status === "delivered" || o.status === "processing");

  const canUpload = (order) => {
    if (!order.created_date) return false;
    const daysSince = differenceInDays(new Date(), new Date(order.created_date));
    const alreadySubmitted = galleries.some(g => g.order_id === order.id);
    // Upload window: 7 days after purchase, closes 7 days later (day 14)
    return daysSince >= 7 && daysSince < 14 && !alreadySubmitted;
  };

  const alreadySubmitted = (orderId) => galleries.some(g => g.order_id === orderId);

  const handleUploadImage = async (orderKey, slotIndex, file) => {
    const key = `${orderKey}-${slotIndex}`;
    setImages(prev => ({ ...prev, [`${orderKey}-loading-${slotIndex}`]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImages(prev => {
      const next = { ...prev };
      delete next[`${orderKey}-loading-${slotIndex}`];
      const existing = next[orderKey] || [];
      existing[slotIndex] = file_url;
      next[orderKey] = [...existing];
      return next;
    });
  };

  const handleSubmit = async (order) => {
    const orderImages = (images[order.id] || []).filter(Boolean);
    if (orderImages.length === 0) return;
    setSubmitting(true);
    setAiError(null);

    // AI image recognition — check at least one image looks like a book
    let aiApproved = false;
    for (const imgUrl of orderImages) {
      const check = await base44.integrations.Core.InvokeLLM({
        prompt: `Look at this image. Does it show a physical book or printed book? Answer ONLY with "yes" or "no".`,
        file_urls: [imgUrl],
      });
      if (check?.toLowerCase().includes("yes")) { aiApproved = true; break; }
    }

    if (!aiApproved) {
      setAiError("We couldn't recognise a book in your photo(s). Please upload a clear photo of your printed book.");
      setSubmitting(false);
      return;
    }

    // Generate 5% coupon code
    const discountCode = "GALLERY5-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const discountExpires = new Date();
    discountExpires.setMonth(discountExpires.getMonth() + 3);

    // Fetch book details for context
    const bookData = order.book_id ? await base44.entities.Book.filter({ id: order.book_id }) : [];
    const book = bookData[0] || {};

    await base44.entities.ProductGallery.create({
      order_id: order.id,
      book_id: order.book_id || "",
      user_email: user.email,
      book_title: book.title || "My Book",
      occasion: book.occasion || "",
      recipient_name: book.recipient_name || "",
      image_urls: orderImages,
      comment,
      status: "pending_review",
      ai_approved: aiApproved,
      discount_code: discountCode,
      discount_expires: discountExpires.toISOString(),
      discount_used: false,
    });

    // Send reward email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: "🎉 Thanks for sharing! Here's 5% off your next order",
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
          <div style="background: white; border-radius: 24px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📸</div>
            <h1 style="color: #2D1B4E; font-size: 24px; margin: 0 0 12px;">Thank you for sharing!</h1>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
              Your photos will appear in our <strong>Product Gallery</strong> once approved. As a thank you, here's 5% off your next order:
            </p>
            <div style="background: linear-gradient(135deg, #2D1B4E, #4A2D7A); border-radius: 16px; padding: 20px; margin: 0 auto 24px; max-width: 300px;">
              <p style="color: #F0D88A; font-size: 22px; font-weight: bold; font-family: monospace; margin: 0;">${discountCode}</p>
              <p style="color: #C4B5FD; font-size: 12px; margin: 8px 0 0;">5% off · Valid until ${discountExpires.toLocaleDateString("en-GB")} · Not stackable</p>
            </div>
            <p style="color: #9CA3AF; font-size: 12px;">GiftMyBookUK · Made with ❤️ in the UK 🇬🇧</p>
          </div>
        </div>
      `,
    });

    queryClient.invalidateQueries({ queryKey: ["user-galleries"] });
    setSubmitted(prev => ({ ...prev, [order.id]: discountCode }));
    setUploadingOrder(null);
    setImages(prev => { const n = { ...prev }; delete n[order.id]; return n; });
    setComment("");
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-serif text-lg font-bold text-gray-900">My Orders</h3>
        <p className="text-sm text-gray-500">Share photos of your printed book to earn 5% off your next order</p>
      </div>

      {purchasedOrders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No orders yet</p>
          <p className="text-gray-400 text-sm">Once you order a book, it'll appear here</p>
        </div>
      )}

      {purchasedOrders.map((order) => {
        const daysSince = differenceInDays(new Date(), new Date(order.created_date || ""));
        const uploadable = canUpload(order);
        const done = alreadySubmitted(order.id) || submitted[order.id];
        const galleryEntry = galleries.find(g => g.order_id === order.id);

        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold text-gray-900 text-sm capitalize">{order.product_type} Order</p>
                <p className="text-xs text-gray-400">
                  {order.created_date ? format(new Date(order.created_date), "d MMM yyyy") : ""}
                  {" · "}£{(order.price_gbp || 0).toFixed(2)}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_CONFIG[order.status]?.className || "bg-gray-100 text-gray-600"}`}>
                {STATUS_CONFIG[order.status]?.label || order.status}
              </span>
            </div>

            {/* Upload CTA */}
            {!done && !uploadable && daysSince < 7 && order.product_type === "printed" && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-4 py-2.5 text-sm text-amber-700 border border-amber-100">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Photo upload unlocks in {7 - daysSince} day{7 - daysSince !== 1 ? "s" : ""} once your book arrives</span>
              </div>
            )}

            {!done && uploadable && uploadingOrder !== order.id && (
              <button
                onClick={() => setUploadingOrder(order.id)}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                <Camera className="w-4 h-4" /> Share Photos & Earn 5% Off
              </button>
            )}

            {uploadingOrder === order.id && !done && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(i => (
                    <UploadSlot
                      key={i}
                      index={i}
                      imageUrl={(images[order.id] || [])[i]}
                      uploading={!!images[`${order.id}-loading-${i}`]}
                      onUpload={(_, file) => handleUploadImage(order.id, i, file)}
                    />
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
                {aiError && <p className="text-red-500 text-xs">{aiError}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setUploadingOrder(null); setAiError(null); }} className="flex-1 h-9 rounded-xl text-sm">Cancel</Button>
                  <Button
                    onClick={() => handleSubmit(order)}
                    disabled={submitting || !(images[order.id] || []).some(Boolean)}
                    className="flex-1 h-9 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-xl text-sm"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Upload className="w-4 h-4 mr-1" /> Submit</>}
                  </Button>
                </div>
              </motion.div>
            )}

            {(done || submitted[order.id]) && (
              <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5 text-sm text-green-700 border border-green-100">
                <Check className="w-4 h-4" />
                <span>
                  {submitted[order.id]
                    ? <>Photos submitted! Your 5% code: <strong className="font-mono">{submitted[order.id]}</strong> (check email)</>
                    : <>Photos already submitted{galleryEntry?.discount_code ? ` · Code: ${galleryEntry.discount_code}` : ""}</>
                  }
                </span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}