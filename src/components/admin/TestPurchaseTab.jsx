import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, CheckCircle, Loader2, Trash2, Package, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const PLAN_OPTIONS = [
  { value: "digital", label: "Digital PDF", price: 9.99 },
  { value: "printed", label: "Premium Hardcover", price: 29.99 },
  { value: "subscription", label: "Unlimited Monthly", price: 10.00 },
];

export default function TestPurchaseTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    product_type: "digital",
    price_gbp: 9.99,
    recipient_email: "test@giftmybookuk.com",
    book_id: "",
    notes: "Admin test purchase",
  });
  const [submitting, setSubmitting] = useState(false);
  const [lastCreated, setLastCreated] = useState(null);

  const { data: testOrders = [] } = useQuery({
    queryKey: ["admin-test-orders"],
    queryFn: () => base44.entities.Order.filter({ recipient_email: "test@giftmybookuk.com" }),
  });

  const { data: books = [] } = useQuery({
    queryKey: ["admin-books-picker"],
    queryFn: () => base44.entities.Book.list("-created_date", 20),
  });

  const handlePlanChange = (val) => {
    const plan = PLAN_OPTIONS.find(p => p.value === val);
    setForm(f => ({ ...f, product_type: val, price_gbp: plan?.price || 0 }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("createTestOrder", {
        book_id: form.book_id || (books[0]?.id || ""),
        product_type: form.product_type,
        price_gbp: form.price_gbp,
        recipient_email: form.recipient_email,
        shipping_address: form.product_type === "printed" ? {
          name: "Test User",
          line1: "1 Test Street",
          city: "London",
          postcode: "SW1A 1AA",
          country: "GB",
        } : undefined,
      });

      setLastCreated(res.data.order);
      queryClient.invalidateQueries({ queryKey: ["admin-test-orders"] });
    } catch (err) {
      console.error("Failed to create test order:", err);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Order.delete(id);
    queryClient.invalidateQueries({ queryKey: ["admin-test-orders"] });
    if (lastCreated?.id === id) setLastCreated(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm text-amber-800 font-medium">⚠️ Test mode — creates real DB records tagged to <code className="bg-amber-100 px-1 rounded">test@giftmybookuk.com</code>. No real payment is processed.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-purple-500" /> Create Test Order
          </h3>

          <div>
            <Label className="text-xs text-gray-500">Product Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-1.5">
              {PLAN_OPTIONS.map(p => (
                <button
                  key={p.value}
                  onClick={() => handlePlanChange(p.value)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                    form.product_type === p.value
                      ? "border-purple-400 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-600 hover:border-purple-200"
                  }`}
                >
                  <div>{p.label}</div>
                  <div className="text-gray-400 mt-0.5">£{p.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Attach a Book (optional)</Label>
            <select
              value={form.book_id}
              onChange={(e) => setForm(f => ({ ...f, book_id: e.target.value }))}
              className="mt-1 w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:border-purple-400 outline-none"
            >
              <option value="">— No book attached —</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title || "Untitled"} (for {b.recipient_name})</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-xs text-gray-500">Price (£)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.price_gbp}
              onChange={(e) => setForm(f => ({ ...f, price_gbp: e.target.value }))}
              className="mt-1 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500">Recipient Email</Label>
            <Input
              value={form.recipient_email}
              onChange={(e) => setForm(f => ({ ...f, recipient_email: e.target.value }))}
              className="mt-1 rounded-xl"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
            {submitting ? "Creating order..." : "Create Test Order"}
          </Button>
        </div>

        {/* Last created */}
        <div className="space-y-4">
          {lastCreated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800">Order created!</p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-mono text-xs text-gray-700">{lastCreated.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium capitalize">{lastCreated.product_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-green-700">£{lastCreated.price_gbp?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-700 font-medium">{lastCreated.status}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">✅ Check the Overview tab to see it in Recent Orders</p>
            </motion.div>
          )}

          {/* Previous test orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" /> Previous Test Orders ({testOrders.length})
            </h3>
            {testOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No test orders yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {testOrders.slice().reverse().map(o => (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl text-xs">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-gray-600 truncate">{o.id.slice(0, 12)}…</p>
                      <p className="text-gray-400 capitalize">{o.product_type} · £{o.price_gbp?.toFixed(2)} · {o.status}</p>
                    </div>
                    <p className="text-gray-400 shrink-0">{o.created_date ? format(new Date(o.created_date), "d MMM") : ""}</p>
                    <button onClick={() => handleDelete(o.id)} className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}