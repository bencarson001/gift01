import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function HeartSVG({ size, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
    </svg>
  );
}

const COLORS = ["#FF6B9D", "#FF8FAB", "#FFB3C6", "#E8A0BF", "#D4A853", "#C77DFF"];

export default function FloatingHearts({ active = false, count = 15 }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!active) { setHearts([]); return; }
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      size: Math.random() * 20 + 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 4,
      duration: Math.random() * 4 + 6,
      drift: (Math.random() - 0.5) * 80,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setHearts(generated);
  }, [active, count]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            className="absolute"
            style={{ left: `${h.x}%`, bottom: -40, opacity: h.opacity }}
            animate={{
              y: [0, -window.innerHeight - 60],
              x: [0, h.drift],
              rotate: [0, h.drift > 0 ? 20 : -20, 0],
              scale: [0.5, 1, 0.7],
            }}
            transition={{
              duration: h.duration,
              delay: h.delay,
              repeat: Infinity,
              repeatDelay: Math.random() * 3 + 1,
              ease: "easeOut",
            }}
          >
            <HEART_SVG size={h.size} color={h.color} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}