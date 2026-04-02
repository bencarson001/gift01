import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me().catch(() => null);
  if (user && user.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const eightDaysAgo = new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000);

  // Get printed orders that were paid ~7 days ago
  const orders = await base44.asServiceRole.entities.Order.list('-created_date', 500);
  const eligible = orders.filter(o => {
    if (!o.created_date || !o.recipient_email) return false;
    if (o.product_type !== 'printed') return false;
    const created = new Date(o.created_date);
    return created <= sevenDaysAgo && created > eightDaysAgo;
  });

  // Check which ones haven't had a gallery request / submission yet
  const existingGalleries = await base44.asServiceRole.entities.ProductGallery.list('-created_date', 500);
  const submittedOrderIds = new Set(existingGalleries.map(g => g.order_id));

  let sent = 0;
  for (const order of eligible) {
    if (submittedOrderIds.has(order.id)) continue;

    const book = order.book_id
      ? (await base44.asServiceRole.entities.Book.filter({ id: order.book_id }))[0]
      : null;

    const uploadUrl = `${Deno.env.get('VITE_APP_URL') || 'https://app.giftmybookuk.com'}/UserProfile`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.recipient_email,
      subject: `📸 How does your book look? Share & get 5% off!`,
      body: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
          <div style="background: white; border-radius: 24px; padding: 40px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">📸</div>
            <h1 style="color: #2D1B4E; font-size: 24px; margin: 0 0 12px;">How does your book look?</h1>
            <p style="color: #374151; font-size: 15px; line-height: 1.7; margin-bottom: 8px;">
              We hope ${book?.recipient_name ? `<strong>${book.recipient_name}</strong>` : 'your recipient'} loves their personalised book!
            </p>
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 32px;">
              Share 1–3 photos of your book in your account and we'll give you <strong style="color: #4A2D7A;">5% off your next order</strong> as a thank you 🎉
            </p>
            <a href="${uploadUrl}" 
               style="background: linear-gradient(135deg, #D4A853, #F0D88A); color: #1a1a1a; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-size: 16px; font-weight: bold; display: inline-block; margin-bottom: 24px;">
              Share My Book Photos →
            </a>
            <p style="color: #9CA3AF; font-size: 12px; background: #F9FAFB; border-radius: 8px; padding: 12px;">
              📌 Upload window is open for 7 days. Sign in to your account and go to "Orders & Photos" tab.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 24px;">GiftMyBookUK · Made with ❤️ in the UK 🇬🇧</p>
          </div>
        </div>
      `,
    });
    sent++;
  }

  return Response.json({ sent, checked: eligible.length });
});