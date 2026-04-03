import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only admins can create test orders
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      book_id,
      product_type,
      price_gbp,
      recipient_email,
      shipping_address,
    } = body;

    // Use service role to bypass RLS (admin function)
    const order = await base44.asServiceRole.entities.Order.create({
      book_id: book_id || '',
      product_type,
      price_gbp: parseFloat(price_gbp),
      vat_amount: parseFloat((price_gbp * 0.2).toFixed(2)),
      status: 'paid',
      recipient_email,
      shipping_address: product_type === 'printed' ? shipping_address : undefined,
    });

    // Update book status if provided
    if (book_id) {
      await base44.asServiceRole.entities.Book.update(book_id, { status: 'purchased' });
    }

    return Response.json({ order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});