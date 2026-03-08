import React, { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function StripeCardForm({ onChange }) {
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });

  const update = (field, value) => {
    const updated = { ...card, [field]: value };
    setCard(updated);
    onChange?.(updated);
  };

  const cardType = card.number.startsWith("4")
    ? "Visa"
    : card.number.startsWith("5")
    ? "Mastercard"
    : card.number.startsWith("34") || card.number.startsWith("37")
    ? "Amex"
    : null;

  return (
    <div className="space-y-4">
      {/* Card Number */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Card number</Label>
        <div className="relative mt-1">
          <Input
            value={card.number}
            onChange={(e) => update("number", formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            className="h-12 rounded-xl pl-4 pr-14 font-mono tracking-widest border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            maxLength={19}
            inputMode="numeric"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {cardType ? (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{cardType}</span>
            ) : (
              <CreditCard className="w-5 h-5 text-gray-300" />
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div>
        <Label className="text-sm font-medium text-gray-700">Name on card</Label>
        <Input
          value={card.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Sarah Johnson"
          className="mt-1 h-12 rounded-xl border-gray-200 focus:border-purple-400"
        />
      </div>

      {/* Expiry + CVC */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Expiry date</Label>
          <Input
            value={card.expiry}
            onChange={(e) => update("expiry", formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="mt-1 h-12 rounded-xl border-gray-200 font-mono focus:border-purple-400"
            maxLength={5}
            inputMode="numeric"
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-gray-700">CVC</Label>
          <div className="relative">
            <Input
              value={card.cvc}
              onChange={(e) => update("cvc", e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              className="mt-1 h-12 rounded-xl border-gray-200 font-mono focus:border-purple-400"
              maxLength={4}
              inputMode="numeric"
              type="password"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}