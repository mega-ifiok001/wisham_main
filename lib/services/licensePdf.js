import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/** Greedy word-wrap that respects the embedded font metrics. */
function wrapText(text, font, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Build the WISHAM exclusive license as a PDF.
 * Uses pdf-lib (pure JS) so it runs safely on serverless hosts — no font files to load.
 */
export async function licensePdfBuffer({ sale, beat }) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const RED = rgb(0.863, 0.149, 0.149);
  const DARK = rgb(0.07, 0.09, 0.15);
  const GRAY = rgb(0.42, 0.45, 0.5);
  const LINE = rgb(0.9, 0.91, 0.92);

  const LEFT = 56;
  const RIGHT = 595.28 - 56;
  const WIDTH = RIGHT - LEFT;
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Brand bar
  page.drawRectangle({ x: 0, y: 841.89 - 8, width: 595.28, height: 8, color: RED });

  let y = 841.89 - 74;
  page.drawText('W I S H A M', { x: LEFT, y, size: 11, font: bold, color: GRAY });
  y -= 28;
  page.drawText('Exclusive License Agreement', { x: LEFT, y, size: 22, font: bold, color: RED });
  y -= 28;

  const intro = `This certifies that payment for the exclusive rights to the beat "${sale.beatTitle}" has been completed in full.`;
  for (const line of wrapText(intro, helv, 10.5, WIDTH)) {
    page.drawText(line, { x: LEFT, y, size: 10.5, font: helv, color: DARK });
    y -= 15;
  }

  // ---- License details table ----
  y -= 14;
  page.drawText('License Details', { x: LEFT, y, size: 13, font: bold, color: DARK });
  y -= 9;
  page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.8, color: LINE });
  y -= 20;

  const rows = [
    ['Beat Title', sale.beatTitle],
    ['Artist / Owner', beat?.artist || 'WISHAM'],
    ['License Type', 'EXCLUSIVE'],
    ['Includes Stems', sale.includesStems ? 'Yes — full trackout stems' : 'No'],
    ['License Hash', sale.licenseHash || ''],
    ['Licensee', sale.buyerEmail],
    ['Purchase Date', today],
    ['Amount Paid', `$${Number(sale.amountUsd).toFixed(2)} USD`],
    ['Reference', sale.paymentRef || ''],
  ];

  for (const [label, value] of rows) {
    page.drawText(String(label), { x: LEFT, y, size: 9.5, font: bold, color: GRAY });
    const val = String(value ?? '');
    const clipped = val.length > 64 ? `${val.slice(0, 64)}...` : val;
    page.drawText(clipped, { x: LEFT + 130, y, size: 10, font: helv, color: DARK });
    y -= 18;
  }

  // ---- Terms ----
  y -= 16;
  page.drawText('Terms', { x: LEFT, y, size: 13, font: bold, color: DARK });
  y -= 9;
  page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.8, color: LINE });
  y -= 20;

  const terms = [
    '1. Upon purchase, the beat is removed from the marketplace and can no longer be sold by anyone else.',
    '2. The licensee receives the full master WAV and all stems.',
    '3. The licensee may use the beat for unlimited commercial projects including streaming, sales and performances.',
    '4. Re-selling, re-distributing, or "renting out" the beat or stems to third parties is strictly prohibited.',
    '5. This license may not be transferred without written consent from WISHAM.',
  ];

  for (const term of terms) {
    for (const line of wrapText(term, helv, 9.5, WIDTH)) {
      page.drawText(line, { x: LEFT, y, size: 9.5, font: helv, color: DARK });
      y -= 14;
    }
    y -= 4;
  }

  // ---- Signature ----
  y -= 22;
  page.drawText('Signed,', { x: LEFT, y, size: 10.5, font: helv, color: DARK });
  y -= 16;
  page.drawText('WISHAM', { x: LEFT, y, size: 11, font: bold, color: DARK });
  y -= 14;
  page.drawText('wisham.com', { x: LEFT, y, size: 9, font: helv, color: GRAY });

  page.drawText(
    'Automated license document issued by WISHAM. Keep this file as proof of ownership.',
    { x: LEFT, y: 60, size: 8, font: italic, color: GRAY }
  );

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}