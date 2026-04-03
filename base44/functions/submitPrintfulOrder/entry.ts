import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRINTFUL_API_URL = 'https://api.printful.com';
const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY');

// Printful hardcover photo book product variant ID
// Product: Photo Book (layflat hardcover, 8x8") - variant ID 12565
// You may need to update this to match your specific Printful product/variant
// Find your variant ID at: https://api.printful.com/products (search for photo book)
const HARDCOVER_VARIANT_ID = 12565;

async function printfulRequest(method, path, body) {
  const res = await fetch(`${PRINTFUL_API_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (data.code && data.code >= 400) {
    throw new Error(`Printful API error ${data.code}: ${data.result || JSON.stringify(data.error)}`);
  }
  return data.result;
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
  const body = await req.json();

  // Support both direct invocation {order_id} and entity automation payload {event, data}
  let order;
  if (body.event && body.data) {
    // Called from entity automation — data IS the order
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

  if (order.printful_order_id) {
    return Response.json({ message: 'Printful order already exists', printful_order_id: order.printful_order_id });
  }

  // Fetch the book
  const books = await base44.asServiceRole.entities.Book.filter({ id: order.book_id });
  const book = books[0];

  if (!book) {
    return Response.json({ error: 'Book not found' }, { status: 404 });
  }

  const shipping = order.shipping_address || {};

  // Build the Printful order payload
  // Uses the book's PDF URL as the print file, or cover image as fallback
  const printFileUrl = book.pdf_url || book.cover_image_url;

  if (!printFileUrl) {
    return Response.json({ error: 'No print file available on this book (pdf_url or cover_image_url required)' }, { status: 422 });
  }

  const printfulPayload = {
    recipient: {
      name: shipping.name || book.recipient_name,
      address1: shipping.line1,
      address2: shipping.line2 || '',
      city: shipping.city || '',
      zip: shipping.postcode || '',
      country_code: shipping.country || 'GB',
      email: order.recipient_email || '',
    },
    items: [
      {
        variant_id: HARDCOVER_VARIANT_ID,
        quantity: 1,
        files: [
          {
            type: 'default',
            url: printFileUrl,
          },
        ],
        retail_price: order.price_gbp?.toFixed(2),
      },
    ],
    retail_costs: {
      currency: 'GBP',
      subtotal: order.price_gbp?.toFixed(2),
    },
    gift: {
      subject: `A personalised book for ${book.recipient_name}`,
      message: book.dedication || `A magical personalised book created with love.`,
    },
  };

  // Create the Printful order (as a draft first, then confirm)
  const created = await printfulRequest('POST', '/orders', printfulPayload);

  // Confirm the order for fulfillment
  await printfulRequest('POST', `/orders/${created.id}/confirm`);

  // Update our Order record with the Printful order ID and status
  await base44.asServiceRole.entities.Order.update(order.id, {
    printful_order_id: String(created.id),
    status: 'processing',
    tracking_status: 'in_production',
  });

  return Response.json({
    success: true,
    printful_order_id: created.id,
    printful_status: created.status,
  });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});