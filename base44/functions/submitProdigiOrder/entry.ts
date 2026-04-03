import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRODIGI_API_KEY = Deno.env.get('PRODIGI_API_KEY');
const PRODIGI_API_URL = 'https://api.prodigi.com/v4.0';

// Prodigi SKU for A5 hardcover photo book (24-300 pages, gloss paper)
// SKU format: BOOK-FE-A5-HC-GL-24 (A5, hardcover, gloss, 24 pages)
// Pages must be a multiple of 2, minimum 24. We'll use 24 as baseline and let the PDF define the content.
const BOOK_SKU = 'BOOK-FE-A5-HC-GL-24';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();

    // Support both direct invocation {order_id} and entity automation payload {event, data}
    let order;
    if (body.event && body.data) {
      order = body.data;
    } else {
      const order_id = body.order_id;
      if (!order_id) {
        return Response.json({ error: 'order_id is required' }, { status: 400 });
      }
      const orders = await base44.asServiceRole.entities.Order.filter({ id: order_id });
      order = orders[0];
    }

    if (!order || !order.id) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.product_type !== 'printed') {
      return Response.json({ error: 'Not a printed order', skipped: true });
    }

    if (order.prodigi_order_id) {
      return Response.json({ message: 'Prodigi order already exists', prodigi_order_id: order.prodigi_order_id });
    }

    // Fetch the book
    const books = await base44.asServiceRole.entities.Book.filter({ id: order.book_id });
    const book = books[0];

    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    const printFileUrl = book.pdf_url;
    if (!printFileUrl) {
      return Response.json({ error: 'No PDF available on this book. pdf_url is required for print fulfilment.' }, { status: 422 });
    }

    const shipping = order.shipping_address || {};

    // Build Prodigi order payload
    const prodigiPayload = {
      merchantReference: order.id,
      shippingMethod: 'Standard',
      recipient: {
        name: shipping.name || book.recipient_name,
        address: {
          line1: shipping.line1 || '',
          line2: shipping.line2 || '',
          postalOrZipCode: shipping.postcode || '',
          countryCode: shipping.country || 'GB',
          townOrCity: shipping.city || '',
          stateOrCounty: '',
        },
        email: order.recipient_email || '',
      },
      items: [
        {
          merchantReference: `item-${order.id}`,
          sku: BOOK_SKU,
          copies: 1,
          sizing: 'fillPrintArea',
          assets: [
            {
              printArea: 'default',
              url: printFileUrl,
            },
          ],
        },
      ],
    };

    const res = await fetch(`${PRODIGI_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'X-API-Key': PRODIGI_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prodigiPayload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Prodigi API error ${res.status}: ${JSON.stringify(data)}`);
    }

    const prodigiOrderId = data.order?.id || data.id;

    await base44.asServiceRole.entities.Order.update(order.id, {
      prodigi_order_id: String(prodigiOrderId),
      status: 'processing',
      tracking_status: 'in_production',
    });

    return Response.json({
      success: true,
      prodigi_order_id: prodigiOrderId,
      prodigi_status: data.order?.status?.stage,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});