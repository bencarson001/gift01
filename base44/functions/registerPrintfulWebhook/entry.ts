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
    const STORE_ID = 17963536;

    // Set webhook config using correct field names from GET response
    const postRes = await fetch(`https://api.printful.com/v2/webhooks?store_id=${STORE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        default_url: WEBHOOK_URL,
        events: [
          { type: 'shipment_sent' },
          { type: 'order_updated' },
        ],
      }),
    });
    const postData = await postRes.json();

    return Response.json({ success: true, result: postData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});