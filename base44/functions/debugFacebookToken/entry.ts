import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

  const token = Deno.env.get('FACEBOOK_BUSINESS_TOKEN');

  // Check token info
  const debugRes = await fetch(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${token}`);
  const debugData = await debugRes.json();

  // Check me/accounts for pages
  const pagesRes = await fetch(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
  const pagesData = await pagesRes.json();

  return Response.json({ token_debug: debugData, pages: pagesData });
});