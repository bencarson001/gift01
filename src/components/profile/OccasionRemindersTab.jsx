import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Bell, BellOff, BookOpen, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const OCCASION_TYPES = [
  { value: "birthday", label: "🎂 Birthday" },
  { value: "anniversary", label: "💍 Anniversary" },
  { value: "wedding", label: "💒 Wedding" },
  { value: "christening", label: "👶 Christening" },
  { value: "graduation", label: "🎓 Graduation" },
  { value: "christmas", label: "🎄 Christmas" },
  { value: "easter", label: "🐣 Easter" },
  { value: "valentines", label: "❤️ Valentine's" },
  { value: "mothers_day", label: "🌷 Mother's Day" },
  { value: "fathers_day", label: "⚽ Father's Day" },
  { value: "halloween", label: "🎃 Halloween" },
  { value: "new_year", label: "🎆 New Year" },
  { value: "other", label: "🎉 Other" },
];

const BOOK_OCCASION_MAP = {
  birthday: "birthday", anniversary: "anniversary", wedding: "wedding",
  christening: "baby", graduation: "graduation", christmas: "christmas",
  easter: "birthday", valentines: "valentines", mothers_day: "mothers_day",
  fathers_day: "fathers_day", halloween: "roast", new_year: "graduation", other: "birthday",
};

export default function OccasionRemindersTab({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "", occasion_type: "birthday", date: "", recipient_name: "",
    email_alert_enabled: true, alert_days_before: 7,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ["reminders", user?.email],
    queryFn: () => base44.entities.OccasionReminder.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.OccasionReminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setShowForm(false);
      setForm({ name: "", occasion_type: "birthday", date: "", recipient_name: "", email_alert_enabled: true, alert_days_before: 7 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OccasionReminder.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const toggleAlertMutation = useMutation({
    mutationFn: ({ id, enabled }) => base44.entities.OccasionReminder.update(id, { email_alert_enabled: enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] }),
  });

  const handleCreate = () => {
    if (!form.name || !form.date || !form.recipient_name) return;
    createMutation.mutate({ ...form, user_email: user.email });
  };

  const sorted = [...reminders].sort((a, b) => {
    const aDate = new Date(a.date);
    const bDate = new Date(b.date);
    // Sort by next occurrence (month/day from today)
    return aDate.getMonth() * 31 + aDate.getDate() - (bDate.getMonth() * 31 + bDate.getDate());
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-gray-900">My Occasions</h3>
          <p className="text-sm text-gray-500">Track important dates and get reminders</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 px-4 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Occasion
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-purple-50 rounded-2xl p-5 border border-purple-100 space-y-4"
          >
            <h4 className="font-semibold text-gray-900 text-sm">New Occasion</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Occasion Name</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mum's Birthday" className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Recipient</label>
                <Input value={form.recipient_name} onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))} placeholder="e.g. Sarah" className="h-10 rounded-xl" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Type</label>
                <select
                  value={form.occasion_type}
                  onChange={e => setForm(f => ({ ...f, occasion_type: e.target.value }))}
                  className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
                >
                  {OCCASION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Date</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="h-10 rounded-xl" />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">Email reminder</p>
                    <p className="text-xs text-gray-400">
                      Send me a reminder{" "}
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={form.alert_days_before}
                        onChange={e => setForm(f => ({ ...f, alert_days_before: parseInt(e.target.value) || 7 }))}
                        className="inline w-10 text-center border-b border-purple-300 bg-transparent text-purple-700 font-bold text-xs"
                      />
                      {" "}days before
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setForm(f => ({ ...f, email_alert_enabled: !f.email_alert_enabled }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.email_alert_enabled ? "bg-purple-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.email_alert_enabled ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-9 rounded-xl text-sm">Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm">
                {createMutation.isPending ? "Saving..." : "Save Occasion"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders list */}
      {sorted.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No occasions yet</p>
          <p className="text-gray-400 text-sm">Add birthdays, anniversaries and more to get reminders</p>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((r) => {
          const occ = OCCASION_TYPES.find(t => t.value === r.occasion_type);
          const bookOccasion = BOOK_OCCASION_MAP[r.occasion_type] || "birthday";
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm"
            >
              <div className="text-2xl shrink-0">{occ?.label.split(" ")[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{r.name}</p>
                <p className="text-xs text-gray-500">
                  For <span className="font-medium">{r.recipient_name}</span> ·{" "}
                  {r.date ? format(new Date(r.date), "d MMM yyyy") : "No date"}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {r.email_alert_enabled ? (
                    <span className="text-xs text-purple-600 flex items-center gap-1"><Bell className="w-3 h-3" /> {r.alert_days_before || 7} days before</span>
                  ) : (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><BellOff className="w-3 h-3" /> No reminder</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAlertMutation.mutate({ id: r.id, enabled: !r.email_alert_enabled })}
                  className={`p-1.5 rounded-lg transition-colors ${r.email_alert_enabled ? "text-purple-500 bg-purple-50 hover:bg-purple-100" : "text-gray-300 bg-gray-50 hover:bg-gray-100"}`}
                >
                  {r.email_alert_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => navigate(createPageUrl("CreateBook") + `?occasion=${bookOccasion}&recipient=${encodeURIComponent(r.recipient_name)}`)}
                  className="p-1.5 rounded-lg text-amber-500 bg-amber-50 hover:bg-amber-100 transition-colors"
                  title="Create a book for this occasion"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(r.id)}
                  className="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}