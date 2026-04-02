import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Download, Loader2, Volume2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function VoiceoverPanel({ book }) {
  const [voice, setVoice] = useState("male");
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState(null);
  const [open, setOpen] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a warm British narrator (${voice === "male" ? "male" : "female"} voice style). 
Write a beautiful narration script for this personalised gift book, as if being read aloud.

Book title: "${book.title}"
Recipient: ${book.recipient_name}
From: ${book.sender_name || "A friend"}

Pages:
${book.pages_content?.map(p => `Page ${p.page_number}: ${p.text}`).join("\n\n")}

Write a flowing narration script (not page-by-page, but as one cohesive reading). 
Include warm British phrasing. About 400-600 words total.
Format it with natural paragraph breaks for easy reading aloud.`,
      response_json_schema: {
        type: "object",
        properties: {
          script: { type: "string" },
          reading_time_minutes: { type: "number" },
        },
      },
    });

    setScript(result);
    setIsGenerating(false);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([script.script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${book.title?.replace(/[^a-z0-9]/gi, "_")}_narration_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-purple-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
            <Mic className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 text-sm">Add British Voice Narration</p>
            <p className="text-xs text-gray-400">Generate a narration script for this book</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-50 pt-4">
              {!script ? (
                <>
                  {/* Voice selection */}
                  <p className="text-sm text-gray-500 mb-3">Choose narrator voice style:</p>
                  <div className="flex gap-3 mb-5">
                    {[
                      { id: "male", label: "🎙️ Male", desc: "Warm & authoritative" },
                      { id: "female", label: "🎤 Female", desc: "Gentle & expressive" },
                    ].map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVoice(v.id)}
                        className={`flex-1 p-3 rounded-xl border-2 text-left transition-all ${
                          voice === v.id
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-200"
                        }`}
                      >
                        <p className="font-semibold text-sm text-gray-900">{v.label}</p>
                        <p className="text-xs text-gray-400">{v.desc}</p>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl h-11"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Crafting your narration...</>
                    ) : (
                      <><Mic className="w-4 h-4 mr-2" /> Generate Narration Script</>
                    )}
                  </Button>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Downloads as a .txt script — perfect for recording or Text-to-Speech apps
                  </p>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Narration script ready!</p>
                    {script.reading_time_minutes && (
                      <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> ~{script.reading_time_minutes} min read
                      </span>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 max-h-40 overflow-y-auto mb-4">
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-serif italic">
                      {script.script?.substring(0, 300)}...
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownloadScript}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold rounded-xl h-10"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download Script (.txt)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setScript(null)}
                      className="rounded-xl h-10 text-sm"
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Use with any Text-to-Speech app or record yourself for a personal touch 🎙️
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}