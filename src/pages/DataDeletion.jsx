import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function DataDeletion() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Parse confirmation code from URL (Facebook sends signed_request)
  const urlParams = new URLSearchParams(window.location.search);
  const confirmationCode = urlParams.get("confirmation_code") || Math.random().toString(36).substring(2, 10).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "hello@giftmybookuk.com",
        subject: `Data Deletion Request — ${email}`,
        body: `A user has requested deletion of all their personal data.\n\nEmail: ${email}\nConfirmation Code: ${confirmationCode}\nDate: ${new Date().toISOString()}\n\nPlease delete all records associated with this email address within 30 days as per GDPR requirements.`,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Data Deletion Request</h1>
        </div>
        <p className="text-gray-500 text-sm mb-8">Last updated: April 2026</p>

        {!submitted ? (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8 text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>
                Under GDPR and Facebook's Platform Policy, you have the right to request deletion of any personal data
                GiftMyBookUK holds about you as a result of using Facebook Login.
              </p>
              <p>
                Submitting this form will send a deletion request to our team. We will permanently remove all personal
                data associated with your account within <strong>30 days</strong>. You will receive a confirmation
                code to track your request.
              </p>
              <p>
                <strong>Data that will be deleted:</strong> account details (name, email), book personalisation data,
                order history, and any stored preferences.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address associated with your account
                </label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !email}
                className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Submit Deletion Request
              </Button>
            </form>

            <p className="text-xs text-gray-400 mt-4">
              For queries contact <a href="mailto:hello@giftmybookuk.com" className="text-purple-600 hover:underline">hello@giftmybookuk.com</a>
            </p>
          </>
        ) : (
          <div className="text-center py-12">
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Request Received</h2>
            <p className="text-gray-500 mb-4">
              Your data deletion request has been submitted. We will process it within 30 days.
            </p>
            <div className="inline-block bg-gray-100 rounded-xl px-5 py-3">
              <p className="text-xs text-gray-500 mb-1">Your confirmation code</p>
              <p className="font-mono text-lg font-bold text-gray-800 tracking-widest">{confirmationCode}</p>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Keep this code as proof of your request. Questions? Email{" "}
              <a href="mailto:hello@giftmybookuk.com" className="text-purple-600 hover:underline">hello@giftmybookuk.com</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}