import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const url = new URL(req.url);
  const shareId = url.searchParams.get("share_id");

  if (!shareId) {
    return Response.json({ error: "Missing share_id" }, { status: 400 });
  }

  const books = await base44.asServiceRole.entities.Book.filter({ share_id: shareId });
  const book = books?.[0];

  if (!book) {
    return Response.json({ error: "Book not found" }, { status: 404 });
  }

  return Response.json({
    title: book.title || "A Personalised Gift Book",
    recipient_name: book.recipient_name,
    occasion: book.occasion,
    cover_image_url: book.cover_image_url || null,
    dedication: book.dedication || null,
    pages_content: book.pages_content || [],
    art_style: book.art_style || "watercolour",
    sender_name: book.sender_name || null,
  });
});