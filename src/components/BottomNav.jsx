import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, BookOpen, User } from "lucide-react";
import { createPageUrl } from "@/utils";

const TABS = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Create", icon: PlusCircle, to: createPageUrl("CreateBook") },
  { label: "Library", icon: BookOpen, to: createPageUrl("MyLibrary") },
  { label: "Profile", icon: User, to: createPageUrl("UserProfile") },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 flex md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map(({ label, icon: Icon, to }) => {
        const isActive = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
        return (
          <Link
            key={label}
            to={to}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors select-none ${
              isActive ? "text-purple-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-2"}`} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}