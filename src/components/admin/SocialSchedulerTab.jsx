import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  Loader2, RefreshCw, Calendar, CheckCircle, XCircle, Clock,
  Facebook, Sparkles, Trash2, Eye, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Clock },
  posted: { label: "Posted ✓", color: "bg-green-100 text-green-700", icon: CheckCircle },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: XCircle },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-600", icon: Clock },
};

const OCCASIONS = [
  "birthday", "anniversary", "baby", "wedding", "roast", "graduation",
  "mothers_day", "fathers_day", "christmas", "valentines", "retirement", "new_home"
];

export default function SocialSchedulerTab() {
  const [generating, setGenerating] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [publishNow, setPublishNow] = useState(false);
  const [preview, setPreview] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["scheduled-posts"],
    queryFn: () => base44.entities.ScheduledPost.list("-scheduled_for", 50),
  });

  const scheduled = posts.filter(p => p.status === "scheduled");
  const posted = posts.filter(p => p.status === "posted");
  const failed = posts.filter(p => p.status === "failed");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateAndScheduleFacebookPost", {
        occasion: selectedOccasion || undefined,
        publish_now: publishNow
      });
      if (res.data?.success) {
        // If publishing immediately, also post to Facebook right now
        if (publishNow && res.data?.post_text) {
          await base44.functions.invoke("postToFacebookPage", {
            message: res.data.post_text,
            image_url: res.data.image_url || null,
            title: `GiftMyBookUK - ${res.data.occasion_theme || 'Special Offer'}`,
          });
        }
        toast.success(publishNow ? "Post generated & published to Facebook!" : "Post generated & scheduled!");
        setPreview(res.data);
        queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      } else {
        toast.error("Generation failed: " + (res.data?.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Error: " + err.message);
    }
    setGenerating(false);
  };

  const deletePost = async (id) => {
    await base44.entities.ScheduledPost.delete(id);
    queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    toast.success("Post deleted");
  };

  const hasFbConfig = true; // Always show — user needs to add secrets

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Scheduled", value: scheduled.length, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Published", value: posted.length, color: "text-green-600", bg: "bg-green-50" },
          { label: "Failed", value: failed.length, color: "text-red-600", bg: "bg-red-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-5 text-center`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* FB Credentials Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚙️ Facebook Setup Required</p>
        <p className="text-xs text-amber-700">To auto-publish to Facebook, add these secrets in your app settings:</p>
        <ul className="text-xs text-amber-700 list-disc pl-4 mt-1 space-y-0.5">
          <li><code className="bg-amber-100 px-1 rounded">FB_PAGE_ACCESS_TOKEN</code> — your Facebook Page access token</li>
          <li><code className="bg-amber-100 px-1 rounded">FB_PAGE_ID</code> — your Facebook Page ID</li>
        </ul>
        <p className="text-xs text-amber-600 mt-1">Without these, posts are generated & saved but not auto-published.</p>
      </div>

      {/* Generate Post */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" /> Generate New Facebook Post
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-2 block">Occasion Theme (optional)</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedOccasion("")}
                className={`px-3 py-1 rounded-xl text-xs font-medium ${!selectedOccasion ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                🎲 Random
              </button>
              {OCCASIONS.map(occ => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium ${selectedOccasion === occ ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  {occ.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={e => setPublishNow(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Publish to Facebook immediately</span>
            </label>
            {!publishNow && <span className="text-xs text-gray-400">(schedules 3 days from now at 10am)</span>}
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
            {generating ? "AI is writing your post..." : "Generate Post with AI"}
          </Button>
        </div>

        {/* Preview of last generated post */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border border-blue-100 rounded-2xl bg-blue-50 p-4"
          >
            <p className="text-xs font-semibold text-blue-700 mb-2">✅ Generated Post Preview</p>
            <div className="flex gap-3">
              {preview.image_url && (
                <img src={preview.image_url} alt="post" className="w-20 h-20 rounded-xl object-cover shrink-0" />
              )}
              <div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{preview.post_text}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Occasion: {preview.occasion} · Scheduled for: {preview.scheduled_for ? format(new Date(preview.scheduled_for), "d MMM yyyy, HH:mm") : "Now"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Post List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Post History ({posts.length})</h3>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No posts yet — generate your first post above</p>
        ) : (
          <div className="space-y-3">
            {posts.map(post => {
              const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50/50"
                >
                  {post.image_url && (
                    <img src={post.image_url} alt="post" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{post.post_text}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {post.occasion_theme && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                          {post.occasion_theme.replace(/_/g, " ")}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {post.scheduled_for ? format(new Date(post.scheduled_for), "d MMM, HH:mm") : "—"}
                      </span>
                      {post.post_id && (
                        <span className="text-[10px] text-blue-500">FB: {post.post_id}</span>
                      )}
                    </div>
                    {post.error_message && (
                      <p className="text-xs text-red-500 mt-1 truncate">{post.error_message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-gray-300 hover:text-red-500 p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}