import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Prodigi v4 callback handler
// Prodigi sends the full Order object as the POST body on every status change.
// Docs: https://www.prodigi.com/print-api/docs/reference/#callbacks
// The body IS the order object — no type/payload wrapper.

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const order = await req.json();

    // Prodigi sends the full order object. merchantReference is our internal order ID.
    const merchantReference = order.merchantReference;

    if (!merchantReference) {
      return Response.json({ message: 'No merchantReference, skipping' });
    }

    const orders = await base44.asServiceRole.entities.Order.filter({ id: merchantReference });
    const localOrder = orders[0];

    if (!localOrder) {
      return Response.json({ message: 'Order not found, skipping' });
    }

    const stage = order.status?.stage || '';
    const shipments = order.shipments || [];

    // Handle shipping — Prodigi populates shipments[] when dispatched
    if (shipments.length > 0) {
      const shipment = shipments[0];
      const trackingNumber = shipment.tracking?.number || '';
      const trackingUrl = shipment.tracking?.url || '';
      const carrier = shipment.carrier?.name || shipment.carrier || '';

      await base44.asServiceRole.entities.Order.update(localOrder.id, {
        tracking_number: trackingNumber,
        tracking_carrier: carrier,
        tracking_url: trackingUrl,
        tracking_status: 'dispatched',
        status: 'shipped',
        dispatched_at: new Date().toISOString(),
      });

      // Send shipping notification email
      if (localOrder.recipient_email) {
        const books = localOrder.book_id
          ? await base44.asServiceRole.entities.Book.filter({ id: localOrder.book_id })
          : [];
        const book = books[0];
        const bookTitle = book?.title || 'Your personalised book';
        const appUrl = 'https://app.giftmybookuk.com';
        const trackingPageUrl = `${appUrl}/OrderTracking?order_id=${localOrder.id}`;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: localOrder.recipient_email,
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
                <a href="${trackingPageUrl}" style="background: linear-gradient(135deg, #4A2D7A, #7B5EA7); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: bold; display: inline-block; margin-bottom: 16px;">
                  Track My Order →
                </a>
                ${trackingUrl ? `<p style="margin: 0;"><a href="${trackingUrl}" style="color: #D4A853; font-size: 14px;">Track with carrier directly</a></p>` : ''}
                <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px; border-top: 1px solid #F3F4F6; padding-top: 20px;">
                  With love, GiftMyBookUK 📖✨<br/>Made with ❤️ in the UK 🇬🇧
                </p>
              </div>
            </div>
          `,
        });
      }
    }

    // Handle completion
    if (stage === 'Complete') {
      await base44.asServiceRole.entities.Order.update(localOrder.id, {
        tracking_status: 'delivered',
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      });
    }

    // Keep order status in sync for in-progress stages
    if (stage === 'InProgress' && localOrder.status === 'paid') {
      await base44.asServiceRole.entities.Order.update(localOrder.id, {
        status: 'processing',
        tracking_status: 'in_production',
      });
    }

    return Response.json({ received: true, stage, merchantReference });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});