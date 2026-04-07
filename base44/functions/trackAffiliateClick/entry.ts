import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { product_id, estimated_revenue } = await req.json();

    if (!product_id) {
      return Response.json({ error: 'product_id required' }, { status: 400 });
    }

    // Get current product
    const products = await base44.asServiceRole.entities.AffiliateProduct.filter({ id: product_id });
    const product = products?.[0];

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const newClicks = (product.click_count || 0) + 1;
    const newRevenue = (product.estimated_revenue_gbp || 0) + (estimated_revenue || 0);
    // Performance score: clicks weighted 1x + revenue weighted 10x
    const newScore = newClicks + (newRevenue * 10);

    await base44.asServiceRole.entities.AffiliateProduct.update(product_id, {
      click_count: newClicks,
      estimated_revenue_gbp: newRevenue,
      performance_score: newScore,
    });

    return Response.json({ success: true, clicks: newClicks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});