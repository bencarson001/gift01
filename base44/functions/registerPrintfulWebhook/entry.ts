import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PRINTFUL_API_KEY = Deno.env.get('PRINTFUL_API_KEY');
const WEBHOOK_URL = 'https://api.base44.app/api/apps/699a374d723098608b5301db/functions/printfulWebhook';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // First, get stores
    const storesRes = await fetch('https://api.printful.com/v2/stores', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const storesData = await storesRes.json();

    return Response.json({ stores: storesData });

    // First, check existing webhooks
    const listRes = await fetch('https://api.printful.com/v2/webhooks', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    const listData = await listRes.json();
    console.log('Existing webhooks:', JSON.stringify(listData));

    // Register webhook with Printful v2 API
    const res = await fetch('https://api.printful.com/v2/webhooks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        events: ['package_shipped', 'order_updated'],
      }),
    });

    const data = await res.json();
    console.log('Register result:', JSON.stringify(data));

    return Response.json({ success: true, existing: listData, result: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});