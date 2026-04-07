import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, User, CalendarDays, ShoppingBag, Loader2, LogOut, Trash2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OccasionRemindersTab from "../components/profile/OccasionRemindersTab";
import OrdersUploadTab from "../components/profile/OrdersUploadTab";
import DeleteAccountDialog from "../components/DeleteAccountDialog";

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "occasions", label: "My Occasions", icon: CalendarDays },
  { key: "orders", label: "Orders & Photos", icon: ShoppingBag },
];

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("occasions");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [adminChecking, setAdminChecking] = useState(false);

  const handleAdminLogin = async () => {
    setAdminChecking(true);
    setAdminError(false);
    try {
      const res = await base44.functions.invoke("getAdminPassword", {});
      if (adminPw === res.data?.password) {
        window.location.href = "/admin";
      } else {
        setAdminError(true);
        setAdminPw("");
      }
    } catch {
      setAdminError(true);
    }
    setAdminChecking(false);
  };

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
          <button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-medium">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(160deg, #fdf2f8 0%, #faf5ff 50%, #fffbeb 100%)" }}>
      {showDeleteDialog && <DeleteAccountDialog user={user} onClose={() => setShowDeleteDialog(false)} />}

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40"
        style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={createPageUrl("MyLibrary")} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-serif text-xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => base44.auth.logout()}
            className="ml-auto text-gray-400 hover:text-gray-600 text-sm flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* User card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-purple-50 p-5 mb-6 flex items-center gap-4"
        >
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
            {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-serif text-lg font-bold text-gray-900">{user.full_name || "My Account"}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-purple-200 hover:text-purple-600"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-purple-50 p-6"
        >
          {tab === "profile" && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-gray-900">Account Details</h3>
              <div className="space-y-3">
                {[
                  { label: "Full name", value: user.full_name },
                  { label: "Email address", value: user.email },
                  { label: "Member since", value: user.created_date ? new Date(user.created_date).toLocaleDateString("en-GB", { year: "numeric", month: "long" }) : "" },
                ].map(field => (
                  <div key={field.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{field.label}</span>
                    <span className="text-sm font-medium text-gray-900">{field.value || "—"}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Link to={createPageUrl("MyLibrary")} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  → My Library
                </Link>
                <Link to={createPageUrl("Referrals")} className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  → Refer Friends
                </Link>
              </div>

              {/* Admin access — only shown for admin role */}
              {user?.role === "admin" && (
                <div className="pt-4 border-t border-gray-100 mt-2">
                  {!showAdminPrompt ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowAdminPrompt(true)}
                      className="rounded-xl text-sm flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Button>
                  ) : (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Confirm Admin Password
                      </p>
                      <Input
                        type="password"
                        value={adminPw}
                        onChange={e => { setAdminPw(e.target.value); setAdminError(false); }}
                        onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                        placeholder="Enter admin password"
                        className={`h-10 rounded-xl text-sm ${adminError ? "border-red-400" : ""}`}
                        autoFocus
                      />
                      {adminError && <p className="text-xs text-red-500">Incorrect password</p>}
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAdminLogin}
                          disabled={adminChecking || !adminPw}
                          className="h-9 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm"
                        >
                          {adminChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go to Dashboard"}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => { setShowAdminPrompt(false); setAdminPw(""); setAdminError(false); }}
                          className="h-9 px-3 rounded-xl text-sm text-gray-500"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 mt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl text-sm flex items-center gap-2 px-3 py-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
              </div>
            </div>
          )}
          {tab === "occasions" && <OccasionRemindersTab user={user} />}
          {tab === "orders" && <OrdersUploadTab user={user} />}
        </motion.div>
      </div>
    </div>
  );
}