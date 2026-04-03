import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Package, Truck, CheckCircle, Clock, AlertCircle,
  MapPin, ExternalLink, Loader2, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const STATUS_STEPS = [
  { key: "not_dispatched", label: "Order Received", icon: Package, desc: "Your book is being prepared" },
  { key: "in_production", label: "In Production", icon: Clock, desc: "Your book is being printed & bound" },
  { key: "dispatched", label: "Dispatched", icon: Truck, desc: "On its way to you!" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: MapPin, desc: "Your postie has it today" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, desc: "Enjoy your magical book! 📖" },
];

const STATUS_ORDER = ["not_dispatched", "in_production", "dispatched", "out_for_delivery", "delivered"];

export default function OrderTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [searchInput, setSearchInput] = useState(orderId || "");
  const [activeOrderId, setActiveOrderId] = useState(orderId || "");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["my-printed-orders"],
    queryFn: () => base44.entities.Order.filter({ product_type: "printed" }),
    enabled: !!user,
  });

  const { data: orderArr = [], isLoading: loadingOrder } = useQuery({
    queryKey: ["track-order", activeOrderId],
    queryFn: () => base44.entities.Order.filter({ id: activeOrderId }),
    enabled: !!activeOrderId,
    select: (d) => d,
  });

  const order = orderArr?.[0];

  const { data: bookArr = [] } = useQuery({
    queryKey: ["track-book", order?.book_id],
    queryFn: () => base44.entities.Book.filter({ id: order?.book_id }),
    enabled: !!order?.book_id,
  });
  const book = bookArr?.[0];

  const currentStepIndex = STATUS_ORDER.indexOf(order?.tracking_status || "not_dispatched");

  const handleSearch = () => {
    if (searchInput.trim()) setActiveOrderId(searchInput.trim());
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("MyLibrary")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-500" /> Track Your Order
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Search / order picker */}
        {user ? (
          <>
            {orders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Your Printed Orders</h3>
                <div className="space-y-2">
                  {orders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => { setActiveOrderId(o.id); setSearchInput(o.id); }}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        activeOrderId === o.id
                          ? "border-purple-300 bg-purple-50"
                          : "border-gray-100 hover:border-purple-200 hover:bg-purple-50/50"
                      }`}
                    >
                      <Package className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{o.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {o.created_date ? format(new Date(o.created_date), "d MMM yyyy") : ""}
                          {o.tracking_status && ` · ${o.tracking_status.replace(/_/g, " ")}`}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        o.tracking_status === "delivered" ? "bg-green-100 text-green-700" :
                        o.tracking_status === "dispatched" || o.tracking_status === "out_for_delivery" ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {(o.tracking_status || "not dispatched").replace(/_/g, " ")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {orders.length === 0 && !loadingOrders && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-8 text-center">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No printed orders found on your account.</p>
                <Link to={createPageUrl("MyLibrary")} className="text-purple-600 text-sm font-medium mt-2 inline-block">Browse your books →</Link>
              </div>
            )}
          </>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-amber-800 text-sm font-medium mb-2">Sign in to see your orders</p>
            <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} size="sm" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold rounded-xl">
              Sign In
            </Button>
          </div>
        )}

        {/* Manual order ID search */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Or enter an Order ID</h3>
          <div className="flex gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Paste your order ID..."
              className="rounded-xl"
            />
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tracking detail */}
        {loadingOrder && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>}

        {order && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Book info */}
            {book && (
              <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-5 flex items-center gap-4">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt="cover" className="w-14 h-18 object-cover rounded-xl shrink-0" style={{ height: 72 }} />
                ) : (
                  <div className="w-14 h-18 bg-gradient-to-br from-purple-200 to-amber-200 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ height: 72 }}>📖</div>
                )}
                <div>
                  <p className="font-serif font-bold text-gray-900">{book.title}</p>
                  <p className="text-sm text-gray-500">For {book.recipient_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Order #{order.id.slice(0, 12)}</p>
                </div>
              </div>
            )}

            {/* Progress tracker */}
            <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Delivery Progress</h3>
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                <div
                  className="absolute left-5 top-5 w-0.5 bg-purple-400 transition-all duration-700"
                  style={{ height: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1))) * 100}%` }}
                />

                <div className="space-y-6">
                  {STATUS_STEPS.map((step, i) => {
                    const isCompleted = i < currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex items-start gap-4 relative">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0 z-10 transition-all ${
                          isCompleted ? "bg-purple-500 border-purple-500" :
                          isCurrent ? "bg-white border-purple-400 shadow-md shadow-purple-100" :
                          "bg-white border-gray-200"
                        }`}>
                          <Icon className={`w-4 h-4 ${isCompleted ? "text-white" : isCurrent ? "text-purple-500" : "text-gray-300"}`} />
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p className={`font-semibold text-sm ${isCurrent ? "text-purple-700" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                            {step.label}
                            {isCurrent && <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Current</span>}
                          </p>
                          <p className={`text-xs mt-0.5 ${isCurrent ? "text-gray-600" : "text-gray-400"}`}>{step.desc}</p>
                          {isCurrent && step.key === "dispatched" && order.dispatched_at && (
                            <p className="text-xs text-purple-500 mt-1">Dispatched {format(new Date(order.dispatched_at), "d MMM, HH:mm")}</p>
                          )}
                          {isCurrent && step.key === "delivered" && order.delivered_at && (
                            <p className="text-xs text-green-600 mt-1">Delivered {format(new Date(order.delivered_at), "d MMM, HH:mm")}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {order.tracking_status === "exception" && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-red-300 bg-red-50 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="pt-1.5">
                        <p className="font-semibold text-sm text-red-600">Delivery Exception</p>
                        <p className="text-xs text-gray-500 mt-0.5">There may be a delay — check your carrier tracking for details.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking number & carrier */}
            {order.tracking_number ? (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Tracking Number</p>
                    <p className="text-lg font-mono font-bold text-blue-900 mt-0.5">{order.tracking_number}</p>
                    {order.tracking_carrier && (
                      <p className="text-xs text-blue-600 mt-0.5">Carrier: {order.tracking_carrier}</p>
                    )}
                  </div>
                  {order.tracking_url && (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Track <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Tracking number will appear here once your order is dispatched.</p>
                <p className="text-xs text-gray-400 mt-1">Usually within 3–5 working days</p>
              </div>
            )}
          </motion.div>
        )}

        {activeOrderId && !loadingOrder && !order && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">Order not found</p>
            <p className="text-gray-400 text-sm mt-1">Check your order ID and try again.</p>
          </div>
        )}
      </div>
    </div>
  );
}