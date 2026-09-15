import PDFDocument from 'pdfkit';

/**
 * Generate a PDF of the WISHAM exclusive license.
 * Returns a Buffer ready for email attachments.
 */
export function licensePdfBuffer({ sale, beat }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 56 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const red = [0.863, 0.149, 0.149]; // #DC2626

      // Brand bar
      doc.rect(0, 0, 595.28, 8).fill(red);
      doc.y = 64;
      doc.fontSize(11).fillColor('#9ca3af').text('WISHAM', { characterSpacing: 3 });
      doc.moveDown(0.3);
      doc.fontSize(24).fillColor('#dc2626').text('Exclusive License Agreement', { continued: false });
      doc.moveDown(0.6);

      doc.fontSize(11).fillColor('#374151').text(
        `This certifies that the payment for the exclusive rights to the beat "${sale.beatTitle}" has been completed in full.`
      );
      doc.moveDown(1);

      const row = (label, value) => {
        doc.font('Helvetica-Bold').fontSize(10).fillColor('#6b7280').text(label, 56, doc.y, { width: 170 });
        doc.font('Helvetica').fontSize(10).fillColor('#111827').text(String(value), 226, doc.y - 12, { width: 300 });
        doc.moveDown(0.7);
      };

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827').text('License Details');
      doc.moveDown(0.3);
      row('Beat Title', sale.beatTitle);
      row('Artist / Owner', beat.artist || 'WISHAM');
      row('License Type', 'EXCLUSIVE');
      row('Includes Stems', 'Yes — full trackout stems');
      row('License Hash', sale.licenseHash || '');
      row('Licensee', sale.buyerEmail);
      row('Purchase Date', today);
      row('Amount Paid', `$${sale.amountUsd.toFixed(2)} USD`);
      row('Reference', sale.paymentRef || '');
      doc.moveDown(0.4);

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#111827').text('Terms');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9.5).fillColor('#374151').lineGap(4);
      doc.text(
        '1. Upon purchase, the beat is removed from the marketplace and can no longer be sold by anyone else.\n' +
        '2. The licensee receives the full master WAV and all stems.\n' +
        '3. The licensee may use the beat for unlimited commercial projects including streaming, sales, and performances.\n' +
        '4. Re-selling, re-distributing, or "renting out" the beat or stems to third parties is strictly prohibited.\n' +
        '5. This license may not be transferred without written consent from WISHAM.'
      );
      doc.moveDown(1.2);

      doc.font('Helvetica').fontSize(11).fillColor('#111827').text('Signed,');
      doc.moveDown(0.2);
      doc.font('Helvetica-Bold').text('WISHAM');
      doc.font('Helvetica').fontSize(9).fillColor('#9ca3af').text('wisham.com');

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}