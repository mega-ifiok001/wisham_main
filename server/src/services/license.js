// License document generator for WISHAM exclusive sales.

export function generateLicenseHash(beatId, buyerEmail) {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  const base36 = (n) => n.toString(36).toUpperCase();
  const ts = base36(Date.now()).slice(-6);
  return `WSH-EXC-${beatId.slice(0, 4).toUpperCase()}-${ts}-${rand}`;
}

export function licenseHtml({ sale, beat }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>WISHAM Exclusive License — ${escapeHtml(sale.beatTitle)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; background: #fff; margin: 0; padding: 40px; }
  .doc { max-width: 720px; margin: 0 auto; border: 3px solid #dc2626; border-radius: 12px; padding: 36px; }
  h1 { color: #dc2626; font-size: 28px; margin: 0 0 6px; }
  .brand { font-size: 13px; letter-spacing: 4px; color: #9ca3af; text-transform: uppercase; margin-bottom: 24px; }
  h2 { font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 28px; color: #111; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  td { padding: 8px 4px; border-bottom: 1px solid #f3f4f6; font-size: 14px; }
  td:first-child { color: #6b7280; width: 40%; }
  .hash { background: #fef2f2; border: 1px dashed #dc2626; color: #b91c1c; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 13px; }
  .terms { font-size: 13px; color: #374151; line-height: 1.7; }
  .footer { margin-top: 36px; font-size: 12px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
  <div class="doc">
    <div class="brand">WISHAM</div>
    <h1>Exclusive License Agreement</h1>
    <p>This certifies that the payment for the exclusive rights to the beat <strong>"${escapeHtml(sale.beatTitle)}"</strong> has been completed in full.</p>

    <h2>License Details</h2>
    <table>
      <tr><td>Beat Title</td><td><strong>${escapeHtml(sale.beatTitle)}</strong></td></tr>
      <tr><td>Artist / Owner</td><td>${escapeHtml(beat.artist || 'WISHAM')}</td></tr>
      <tr><td>License Type</td><td><strong>EXCLUSIVE</strong></td></tr>
      <tr><td>Includes Stems</td><td>Yes — full trackout stems</td></tr>
      <tr><td>License Hash</td><td><span class="hash">${escapeHtml(sale.licenseHash || '')}</span></td></tr>
      <tr><td>Licensee</td><td>${escapeHtml(sale.buyerEmail)}</td></tr>
      <tr><td>Purchase Date</td><td>${today}</td></tr>
      <tr><td>Amount Paid</td><td>$${sale.amountUsd.toFixed(2)} USD</td></tr>
      <tr><td>Reference</td><td>${escapeHtml(sale.paymentRef || '')}</td></tr>
    </table>

    <h2>Terms</h2>
    <p class="terms">
      1. Upon purchase, the beat is removed from the marketplace and can no longer be sold by anyone else.<br />
      2. The licensee receives the full master WAV and all stems.<br />
      3. The licensee may use the beat for unlimited commercial projects including streaming, sales, and performances.<br />
      4. Re-selling, re-distributing, or "renting out" the beat or stems to third parties is strictly prohibited.<br />
      5. The licensing may not be transferred without written consent from WISHAM.
    </p>

    <p style="margin-top:32px;">Signed,<br /><strong>WISHAM</strong><br />wisham.com</p>
    <div class="footer">This is an automated license document issued by WISHAM. Keep this email for your records.</div>
  </div>
</body>
</html>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}