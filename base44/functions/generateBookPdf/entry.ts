import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

// A5 portrait dimensions in mm (Prodigi spec: 210 x 148mm portrait = height x width)
// In jsPDF: width=148, height=210 for portrait A5
const PAGE_W = 148;
const PAGE_H = 210;

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  const ct = res.headers.get('content-type') || 'image/jpeg';
  const fmt = ct.includes('png') ? 'PNG' : 'JPEG';
  return { b64, fmt };
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const { book_id } = await req.json();
    if (!book_id) return Response.json({ error: 'book_id required' }, { status: 400 });

    const books = await base44.asServiceRole.entities.Book.filter({ id: book_id });
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const doc = new jsPDF({ unit: 'mm', format: [PAGE_W, PAGE_H], orientation: 'portrait' });

    const pages = book.pages_content || [];

    // --- PAGE 1: COVER ---
    if (book.cover_image_url) {
      const img = await fetchImageAsBase64(book.cover_image_url);
      if (img) {
        doc.addImage(img.b64, img.fmt, 0, 0, PAGE_W, PAGE_H);
      } else {
        doc.setFillColor(45, 27, 78);
        doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
      }
    } else {
      doc.setFillColor(45, 27, 78);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
    }

    // Title overlay on cover
    doc.setFillColor(0, 0, 0);
    doc.setGState(new doc.GState({ opacity: 0.45 }));
    doc.rect(0, PAGE_H * 0.6, PAGE_W, PAGE_H * 0.4, 'F');
    doc.setGState(new doc.GState({ opacity: 1 }));

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('times', 'bolditalic');
    const titleLines = doc.splitTextToSize(book.title || 'A Personalised Book', PAGE_W - 20);
    doc.text(titleLines, PAGE_W / 2, PAGE_H * 0.68, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 200, 255);
    doc.text(`A gift for ${book.recipient_name || ''}`, PAGE_W / 2, PAGE_H * 0.78, { align: 'center' });
    doc.text('GiftMyBookUK', PAGE_W / 2, PAGE_H - 8, { align: 'center' });

    // --- DEDICATION PAGE (page 2) ---
    doc.addPage();
    doc.setFillColor(255, 248, 240);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
    doc.setTextColor(74, 45, 122);
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    doc.text('Dedicated with love to', PAGE_W / 2, 30, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont('times', 'bolditalic');
    doc.text(book.recipient_name || '', PAGE_W / 2, 42, { align: 'center' });

    if (book.dedication) {
      doc.setFontSize(10);
      doc.setFont('times', 'italic');
      doc.setTextColor(100, 80, 140);
      const dedLines = doc.splitTextToSize(`"${book.dedication}"`, PAGE_W - 30);
      doc.text(dedLines, PAGE_W / 2, 58, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setTextColor(180, 160, 200);
    doc.text(`From ${book.sender_name || ''}`, PAGE_W / 2, PAGE_H - 15, { align: 'center' });

    // --- CONTENT PAGES ---
    for (const page of pages) {
      doc.addPage();
      doc.setFillColor(255, 248, 240);
      doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

      let textY = 18;

      if (page.image_url) {
        const img = await fetchImageAsBase64(page.image_url);
        if (img) {
          // Image takes top 55% of page
          const imgH = PAGE_H * 0.52;
          doc.addImage(img.b64, img.fmt, 0, 0, PAGE_W, imgH);
          // Gradient fade at bottom of image
          doc.setFillColor(255, 248, 240);
          doc.setGState(new doc.GState({ opacity: 0.6 }));
          doc.rect(0, imgH - 8, PAGE_W, 10, 'F');
          doc.setGState(new doc.GState({ opacity: 1 }));
          textY = imgH + 6;
        }
      }

      // Page text
      if (page.text) {
        doc.setTextColor(50, 30, 80);
        doc.setFontSize(10);
        doc.setFont('times', 'italic');
        const textLines = doc.splitTextToSize(page.text, PAGE_W - 20);
        doc.text(textLines, PAGE_W / 2, textY, { align: 'center', lineHeightFactor: 1.5 });
      }

      // Page number
      doc.setFontSize(8);
      doc.setTextColor(180, 160, 200);
      doc.setFont('helvetica', 'normal');
      doc.text(String(page.page_number || ''), PAGE_W / 2, PAGE_H - 5, { align: 'center' });
    }

    // --- BACK COVER ---
    doc.addPage();
    doc.setFillColor(45, 27, 78);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
    doc.setTextColor(212, 168, 83);
    doc.setFontSize(14);
    doc.setFont('times', 'bolditalic');
    doc.text('GiftMyBookUK', PAGE_W / 2, PAGE_H / 2 - 8, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(200, 180, 230);
    doc.setFont('helvetica', 'normal');
    doc.text('Personalised books, made with love 📖✨', PAGE_W / 2, PAGE_H / 2 + 4, { align: 'center' });
    doc.text('www.giftmybookuk.com', PAGE_W / 2, PAGE_H / 2 + 12, { align: 'center' });

    // Export PDF as array buffer
    const pdfBytes = doc.output('arraybuffer');
    const pdfFile = new File([pdfBytes], `book-${book_id}.pdf`, { type: 'application/pdf' });

    // Upload to storage
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfFile });

    // Save pdf_url on book
    await base44.asServiceRole.entities.Book.update(book_id, { pdf_url: file_url });

    return Response.json({ success: true, pdf_url: file_url });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});