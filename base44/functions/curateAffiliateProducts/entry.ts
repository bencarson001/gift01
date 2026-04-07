import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const ASSOCIATE_TAG = 'giftmybook21-21';
const CATEGORIES = [
  { key: 'gifts', label: 'Gifts & Gift Sets', search: 'unique personalised gifts UK bestseller 2025' },
  { key: 'stationery', label: 'Stationery', search: 'premium stationery notebooks journals pens UK bestseller' },
  { key: 'home_decor', label: 'Home Decor', search: 'home decor gifts decorative accessories UK trending' },
  { key: 'personalised', label: 'Personalised Items', search: 'personalised keepsakes custom gifts UK' },
  { key: 'trending', label: 'Trending This Week', search: 'Amazon UK bestseller gifts trending this week 2025' },
  { key: 'wrapping', label: 'Gift Wrapping', search: 'luxury gift wrapping ribbon boxes bags UK' },
  { key: 'cards', label: 'Cards & Paper', search: 'greeting cards premium writing paper stationery UK' },
  { key: 'experiences', label: 'Experience Gifts', search: 'experience day gift vouchers UK bestseller' },
];

const PRODUCTS_PER_CATEGORY = 12;
const KEEP_TOP_PERCENT = 0.6; // Keep top 60% performers

function getWeekKey() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function buildAffiliateUrl(asin) {
  if (asin) return `https://www.amazon.co.uk/dp/${asin}?tag=${ASSOCIATE_TAG}`;
  return null;
}

function buildSearchUrl(query) {
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}&tag=${ASSOCIATE_TAG}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const weekKey = getWeekKey();
    console.log(`Starting affiliate curation for week ${weekKey}`);

    // Get existing products
    const existing = await base44.asServiceRole.entities.AffiliateProduct.list('-performance_score', 500);
    const activeProducts = existing.filter(p => p.is_active);

    // Calculate how many to replace (bottom 40%)
    const keepCount = Math.floor(activeProducts.length * KEEP_TOP_PERCENT);
    const sorted = [...activeProducts].sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
    const toDeactivate = sorted.slice(keepCount);

    // Deactivate bottom performers (only if we already have products)
    if (toDeactivate.length > 0 && activeProducts.length > 20) {
      console.log(`Deactivating ${toDeactivate.length} low performers`);
      await Promise.all(
        toDeactivate.slice(0, 30).map(p =>
          base44.asServiceRole.entities.AffiliateProduct.update(p.id, { is_active: false })
        )
      );
    }

    // AI curate new products for each category
    const newProducts = [];

    for (const cat of CATEGORIES) {
      console.log(`Curating category: ${cat.label}`);

      const prompt = `You are a UK Amazon affiliate marketing expert. Research and curate ${PRODUCTS_PER_CATEGORY} real Amazon UK products for the category: "${cat.label}".

Search focus: ${cat.search}

Requirements:
- Real Amazon UK products that actually exist and are bestsellers or trending RIGHT NOW in ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
- Focus on: gifts, stationery, book-related accessories (NOT books themselves), home decor, personalised items
- Price range: £5-£150 GBP
- Must have good Amazon UK reviews (4+ stars)
- Include a mix of price points
- Use realistic ASINs where possible (9-10 character alphanumeric starting with B0)
- Prioritise items that make great gifts

For each product return:
- title: exact product name
- description: compelling 1-sentence description (max 20 words)
- price_gbp: approximate price
- rating: star rating (4.0-5.0)
- review_count: approximate review count
- asin: Amazon ASIN if you know a real one, otherwise null
- is_trending: true if it's a current bestseller/trending item
- badge: one of "Best Seller", "Top Rated", "New This Week", "Trending", or null
- tags: array of 3-5 search keywords

Return as JSON array of ${PRODUCTS_PER_CATEGORY} products.`;

      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              products: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    price_gbp: { type: 'number' },
                    rating: { type: 'number' },
                    review_count: { type: 'number' },
                    asin: { type: 'string' },
                    is_trending: { type: 'boolean' },
                    badge: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        });

        const products = result?.products || [];

        for (const p of products) {
          const affiliateUrl = p.asin
            ? buildAffiliateUrl(p.asin)
            : buildSearchUrl(`${p.title} UK`);

          newProducts.push({
            title: p.title,
            description: p.description || '',
            category: cat.key,
            price_gbp: p.price_gbp || 0,
            affiliate_url: affiliateUrl,
            asin: p.asin || null,
            rating: p.rating || 4.5,
            review_count: p.review_count || 0,
            is_trending: p.is_trending || false,
            is_active: true,
            click_count: 0,
            estimated_revenue_gbp: 0,
            performance_score: 0,
            week_added: weekKey,
            ai_curated: true,
            tags: p.tags || [],
            badge: p.badge || null,
          });
        }
      } catch (catErr) {
        console.error(`Error curating ${cat.label}:`, catErr.message);
      }
    }

    // Bulk insert new products
    if (newProducts.length > 0) {
      console.log(`Inserting ${newProducts.length} new products`);
      await base44.asServiceRole.entities.AffiliateProduct.bulkCreate(newProducts);
    }

    return Response.json({
      success: true,
      week: weekKey,
      deactivated: toDeactivate.length,
      added: newProducts.length,
    });
  } catch (error) {
    console.error('Curation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});