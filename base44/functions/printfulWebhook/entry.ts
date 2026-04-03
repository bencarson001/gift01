import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Handles Printful webhook events: package_shipped, order_updated, etc.
// Register this URL in Printful Dashboard → Stores → Webhooks

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
  const body = await req.json();
  const { type, data } = body;

  if (!type || !data) {
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  if (type === 'package_shipped') {
    const printfulOrderId = String(data.order?.id || data.order_id || '');
    if (!printfulOrderId) {
      return Response.json({ error: 'No order ID in payload' }, { status: 400 });
    }

    // Find our matching order
    const orders = await base44.asServiceRole.entities.Order.filter({ printful_order_id: printfulOrderId });
    const order = orders[0];

    if (!order) {
      return Response.json({ message: 'Order not found, skipping' });
    }

    const shipment = data.shipment || {};
    const trackingNumber = shipment.tracking_number || '';
    const trackingUrl = shipment.tracking_url || '';
    const carrier = shipment.service_name || shipment.carrier || '';

    await base44.asServiceRole.entities.Order.update(order.id, {
      tracking_number: trackingNumber,
      tracking_carrier: carrier,
      tracking_url: trackingUrl,
      tracking_status: 'dispatched',
      status: 'shipped',
      dispatched_at: new Date().toISOString(),
    });

    // Send shipping notification email
    if (order.recipient_email) {
      const books = order.book_id
        ? await base44.asServiceRole.entities.Book.filter({ id: order.book_id })
        : [];
      const book = books[0];
      const bookTitle = book?.title || 'Your personalised book';

      const appUrl = 'https://app.giftmybookuk.com';
      const trackingPageUrl = `${appUrl}/OrderTracking?order_id=${order.id}`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.recipient_email,
        subject: `📦 Your book has shipped! — GiftMyBookUK`,
        body: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf2f8;">
            <div style="background: white; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 4px 24px rgba(74,45,122,0.08);">
              <div style="font-size: 56px; margin-bottom: 16px;">📦</div>
              <h1 style="color: #2D1B4E; font-size: 26px; margin: 0 0 8px;">It's on its way!</h1>
              <p style="color: #6B7280; font-size: 15px; margin: 0 0 24px;">"${bookTitle}" has been shipped</p>

              ${trackingNumber ? `
              <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #6B7280; font-size: 13px; margin: 0 0 4px;">Tracking number</p>
                <p style="color: #111827; font-size: 16px; font-weight: bold; margin: 0;">${trackingNumber}</p>
                ${carrier ? `<p style="color: #6B7280; font-size: 13px; margin: 4px 0 0;">via ${carrier}</p>` : ''}
              </div>
              ` : ''}

              <a href="${trackingPageUrl}"
                 style="background: linear-gradient(135deg, #4A2D7A, #7B5EA7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: bold; display: inline-block; margin-bottom: 16px;">
                Track My Order →
              </a>

              ${trackingUrl ? `
              <p style="margin: 0;">
                <a href="${trackingUrl}" style="color: #D4A853; font-size: 14px;">Track with carrier directly</a>
              </p>
              ` : ''}

              <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px; border-top: 1px solid #F3F4F6; padding-top: 20px;">
                With love, GiftMyBookUK 📖✨<br/>Made with ❤️ in the UK 🇬🇧
              </p>
            </div>
          </div>
        `,
      });
    }
  }

  if (type === 'order_updated') {
    const printfulOrderId = String(data.order?.id || '');
    if (printfulOrderId) {
      const orders = await base44.asServiceRole.entities.Order.filter({ printful_order_id: printfulOrderId });
      const order = orders[0];
      if (order && data.order?.status === 'fulfilled') {
        await base44.asServiceRole.entities.Order.update(order.id, {
          tracking_status: 'delivered',
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        });
      }
    }
  }

  return Response.json({ received: true, type });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});