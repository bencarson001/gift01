import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@16.7.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY_LIVE'));
const PRODIGI_COST = 15.00; // £15 per printed book

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    let order;

    if (body.event && body.data) {
      // Entity automation
      const orders = await base44.asServiceRole.entities.Order.filter({ book_id: body.data.id, product_type: 'printed' });
      order = orders[0];
    } else {
      const order_id = body.order_id;
      if (!order_id) {
        return Response.json({ error: 'order_id is required' }, { status: 400 });
      }
      const orders = await base44.asServiceRole.entities.Order.filter({ id: order_id });
      order = orders[0];
    }

    if (!order || order.product_type !== 'printed') {
      return Response.json({ error: 'Not a printed order', skipped: true });
    }

    // Calculate profit (customer price - Prodigi cost)
    const profit = order.price_gbp - PRODIGI_COST;

    if (profit <= 0) {
      return Response.json({ error: 'No profit after Prodigi cost', skipped: true });
    }

    // Get Stripe account balance to ensure funds are available
    const balance = await stripe.balance.retrieve();
    const availableUSD = balance.available[0]?.amount / 100; // Convert to pounds (assuming GBP)

    if (availableUSD < profit) {
      return Response.json({ error: 'Insufficient Stripe balance for payout', available: availableUSD });
    }

    // Create payout to connected bank account
    const payout = await stripe.payouts.create({
      amount: Math.round(profit * 100), // Convert to pence
      currency: 'gbp',
      method: 'instant',
    });

    // Update order with payout info and Prodigi cost
    await base44.asServiceRole.entities.Order.update(order.id, {
      stripe_payout_id: payout.id,
      prodigi_cost_gbp: PRODIGI_COST,
      profit_amount_gbp: profit,
      payout_status: payout.status,
    });

    return Response.json({
      success: true,
      payout_id: payout.id,
      profit_sent: profit,
      prodigi_cost: PRODIGI_COST,
      payout_status: payout.status,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});