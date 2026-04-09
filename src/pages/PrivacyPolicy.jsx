import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: April 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-700">

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">1. Who We Are</h2>
            <p>GiftMyBookUK ("we", "us", "our") operates the website at giftmybookuk.com. We create AI-powered personalised gift books. For privacy enquiries, contact us at: <a href="mailto:hello@giftmybookuk.com" className="text-purple-600 hover:underline">hello@giftmybookuk.com</a></p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">2. What Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account data:</strong> name, email address when you register</li>
              <li><strong>Book personalisation data:</strong> names, memories, and other details you provide to generate your book</li>
              <li><strong>Order data:</strong> shipping address, payment details (processed securely by Stripe — we never store card numbers)</li>
              <li><strong>Usage data:</strong> pages visited, device type, referral source (collected anonymously)</li>
              <li><strong>Cookies:</strong> session cookies, preference cookies, and advertising cookies (see Section 6)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To generate and deliver your personalised gift book</li>
              <li>To process payments and fulfil print orders</li>
              <li>To send order confirmations and shipping updates</li>
              <li>To send occasion reminders (only if you opt in)</li>
              <li>To improve our service through anonymised analytics</li>
              <li>To display relevant advertisements via Google AdSense</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">4. Legal Basis for Processing (GDPR)</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contract:</strong> processing necessary to deliver the service you purchased</li>
              <li><strong>Consent:</strong> marketing emails, non-essential cookies, advertising</li>
              <li><strong>Legitimate interests:</strong> fraud prevention, security, improving our service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with trusted service providers:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Stripe</strong> — payment processing</li>
              <li><strong>Prodigi</strong> — print fulfilment for physical books</li>
              <li><strong>Google</strong> — analytics and advertising (AdSense)</li>
              <li><strong>OpenAI / Google AI</strong> — book content generation (no personal data retained by AI providers beyond the session)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">6. Cookies &amp; Advertising</h2>
            <p>We use cookies to operate the site and to serve personalised advertisements through <strong>Google AdSense</strong>. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google Ads Settings</a>.</p>
            <p className="mt-2">You can manage or withdraw cookie consent at any time using the cookie banner on our site.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">7. Data Retention</h2>
            <p>We retain your account and order data for up to 3 years for legal and accounting purposes. You may request deletion at any time (see Section 9).</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">8. Your Rights (GDPR)</h2>
            <p>You have the right to: access your data, correct inaccurate data, request deletion ("right to be forgotten"), restrict or object to processing, and data portability. To exercise any right, email <a href="mailto:hello@giftmybookuk.com" className="text-purple-600 hover:underline">hello@giftmybookuk.com</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">9. Account Deletion</h2>
            <p>You can delete your account at any time from your Profile page. This will permanently remove your personal data from our systems within 30 days.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">10. Changes to This Policy</h2>
            <p>We may update this policy periodically. Material changes will be notified by email or a prominent notice on the website.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold text-gray-900 mb-2">11. Contact</h2>
            <p>GiftMyBookUK · <a href="mailto:hello@giftmybookuk.com" className="text-purple-600 hover:underline">hello@giftmybookuk.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}