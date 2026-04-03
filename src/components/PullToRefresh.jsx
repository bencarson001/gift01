import React, { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      setPulling(true);
      setPullY(Math.min(delta, THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPulling(false);
    setPullY(0);
    startY.current = null;
  };

  const showIndicator = pulling || refreshing;
  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {showIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 transition-all pointer-events-none"
          style={{ height: `${pullY}px` }}
        >
          <div
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center"
            style={{ opacity: progress, transform: `scale(${0.5 + progress * 0.5})` }}
          >
            <Loader2
              className="w-4 h-4 text-purple-500"
              style={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
              }}
            />
          </div>
        </div>
      )}
      <div style={{ transform: `translateY(${pullY}px)`, transition: pulling ? "none" : "transform 0.3s ease" }}>
        {children}
      </div>
    </div>
  );
}