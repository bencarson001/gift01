import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { createPageUrl } from "@/utils";

export default function BookQRPage({ book }) {
  const shareUrl = `${window.location.origin}${createPageUrl("SharedBook")}?share=${book.share_id}`;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#2D1B4E] via-[#4A2D7A] to-[#2D1B4E] p-8">
      {/* Decorative stars */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-amber-300 opacity-40 text-lg pointer-events-none"
          style={{
            top: `${[10, 20, 70, 80, 15, 75][i]}%`,
            left: `${[10, 80, 5, 85, 45, 50][i]}%`,
          }}
        >
          ✦
        </div>
      ))}

      <div className="relative z-10 text-center">
        <p className="text-amber-300 text-sm font-medium mb-2 tracking-widest uppercase">Scan to revisit</p>
        <h3 className="font-serif text-white text-xl font-bold mb-1">{book.title}</h3>
        <p className="text-purple-300 text-sm mb-6">For {book.recipient_name} · with love</p>

        <div className="bg-white rounded-2xl p-4 inline-block shadow-2xl shadow-purple-900/50">
          <QRCodeSVG
            value={shareUrl}
            size={140}
            bgColor="#ffffff"
            fgColor="#2D1B4E"
            level="M"
            imageSettings={{
              src: "",
              excavate: false,
            }}
          />
        </div>

        <p className="text-purple-300 text-xs mt-5 max-w-[200px] mx-auto leading-relaxed">
          Scan with your phone to view the full interactive book
        </p>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <p className="text-amber-400/70 text-xs font-medium">GiftMyBookUK</p>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        </div>
      </div>
    </div>
  );
}