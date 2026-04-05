import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { order_id } = await req.json();
  if (!order_id) {
    return Response.json({ error: 'order_id is required' }, { status: 400 });
  }

  // Fetch the order from DB (user can only access their own orders due to RLS)
  const orders = await base44.entities.Order.filter({ id: order_id });
  const order = orders?.[0];

  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 });
  }

  const prodigiOrderId = order.prodigi_order_id || order.printful_order_id;

  if (!prodigiOrderId) {
    return Response.json({
      has_prodigi: false,
      tracking_status: order.tracking_status,
      tracking_number: order.tracking_number,
      tracking_carrier: order.tracking_carrier,
      tracking_url: order.tracking_url,
      dispatched_at: order.dispatched_at,
      delivered_at: order.delivered_at,
    });
  }

  // Call Prodigi API
  const apiKey = Deno.env.get('PRODIGI_API_KEY');
  const prodigiRes = await fetch(
    `https://api.prodigi.com/v4.0/Orders/${prodigiOrderId}`,
    { headers: { 'X-API-Key': apiKey } }
  );

  if (!prodigiRes.ok) {
    // Return what we have in the DB as fallback
    return Response.json({
      has_prodigi: true,
      prodigi_error: `Prodigi API returned ${prodigiRes.status}`,
      tracking_status: order.tracking_status,
      tracking_number: order.tracking_number,
      tracking_carrier: order.tracking_carrier,
      tracking_url: order.tracking_url,
      dispatched_at: order.dispatched_at,
      delivered_at: order.delivered_at,
    });
  }

  const prodigiData = await prodigiRes.json();
  const prodigiOrder = prodigiData.order;

  // Extract shipment info from Prodigi
  const shipments = prodigiOrder?.shipments || [];
  const firstShipment = shipments[0];
  const trackingNumber = firstShipment?.tracking?.number || order.tracking_number;
  const trackingUrl = firstShipment?.tracking?.url || order.tracking_url;
  const carrier = firstShipment?.carrier?.name || order.tracking_carrier;

  // Map Prodigi status to our internal status
  const prodigiStatus = prodigiOrder?.status?.stage || '';
  let mappedStatus = order.tracking_status || 'not_dispatched';

  if (prodigiStatus === 'InProgress' || prodigiStatus === 'Allocating') {
    mappedStatus = 'in_production';
  } else if (prodigiStatus === 'Complete' && shipments.length > 0) {
    mappedStatus = 'dispatched';
  } else if (prodigiStatus === 'Complete' && shipments.length === 0) {
    mappedStatus = 'in_production';
  }

  // If we got fresh tracking info, update DB silently
  if (trackingNumber && trackingNumber !== order.tracking_number) {
    await base44.asServiceRole.entities.Order.update(order_id, {
      tracking_number: trackingNumber,
      tracking_url: trackingUrl || undefined,
      tracking_carrier: carrier || undefined,
      tracking_status: mappedStatus,
    });
  }

  return Response.json({
    has_prodigi: true,
    prodigi_status: prodigiStatus,
    prodigi_details: {
      status: prodigiOrder?.status,
      charges: prodigiOrder?.charges,
      recipient: prodigiOrder?.recipient,
      shipments: shipments.map(s => ({
        carrier: s.carrier?.name,
        tracking_number: s.tracking?.number,
        tracking_url: s.tracking?.url,
        dispatched_date: s.dispatchDate,
        items: s.shipmentItems?.length || 0,
      })),
    },
    tracking_status: mappedStatus,
    tracking_number: trackingNumber,
    tracking_carrier: carrier,
    tracking_url: trackingUrl,
    dispatched_at: firstShipment?.dispatchDate || order.dispatched_at,
    delivered_at: order.delivered_at,
  });
});