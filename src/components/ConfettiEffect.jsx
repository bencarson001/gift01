import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#D4A853", "#E8A0BF", "#7B5EA7", "#4A2D7A", "#F0D88A", "#FF6B6B", "#4ECDC4", "#FF9F43", "#6C5CE7", "#00CEC9"];

export default function ConfettiEffect({ active = false }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (active) {
      const newPieces = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 10 + 5,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        shape: Math.random() > 0.5 ? "circle" : "rect",
      }));
      setPieces(newPieces);
      const timer = setTimeout(() => setPieces([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [active]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            className="absolute"
            style={{ left: `${p.x}%`, top: -20 }}
            initial={{ y: -20, rotate: 0, opacity: 1 }}
            animate={{ y: "110vh", rotate: p.rotation + 720, opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3 + Math.random() * 2, delay: p.delay, ease: "easeIn" }}
          >
            {p.shape === "circle" ? (
              <div className="rounded-full" style={{ width: p.size, height: p.size, backgroundColor: p.color }} />
            ) : (
              <div style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color, borderRadius: 2 }} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}