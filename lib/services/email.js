import { Resend } from 'resend';
import { config } from '../config.js';
import { licensePdfBuffer } from './licensePdf.js';
import { licenseFilename } from './license.js';

const resend = new Resend(config.resendApiKey);

/** Absolute download URLs (unique per sale, expire server-side after 48h). */
export function buildDownloadLinks(sale) {
  const base = `${config.appUrl}/api/download/${sale.id}/${sale.downloadToken}`;
  return {
    master: `${base}?file=master`,
    stems: sale.includesStems ? `${base}?file=stems` : null,
  };
}

function layout(titleText, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>${titleText}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-top:6px solid #dc2626;border-radius:12px;overflow:hidden;">
        <tr><td align="center" style="padding:28px 32px 8px;">
          <div style="font-size:12px;letter-spacing:6px;color:#9ca3af;font-weight:700;">WISHAM</div>
          <div style="font-size:22px;font-weight:800;color:#111;margin-top:4px;">${titleText}</div>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;font-size:14px;line-height:1.7;color:#374151;">${bodyHtml}</td></tr>
        <tr><td style="padding:16px 32px;background:#fafafa;font-size:11px;color:#9ca3af;text-align:center;">
          © ${new Date().getFullYear()} WISHAM — Own your sound.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function primaryButton(url, label) {
  return `<a href="${url}" style="display:inline-block;background:#dc2626;color:#ffffff;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:14px;">${label}</a>`;
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Exclusive sale — beat + stems links PLUS the license PDF attached. */
export async function sendExclusiveSaleEmail(sale, beat) {
  const links = buildDownloadLinks(sale);
  const pdfAttachment = (await licensePdfBuffer({ sale, beat })).toString('base64');

  const body = `
    <p>Congratulations! You now own <strong>"${escapeHtml(sale.beatTitle)}"</strong> exclusively. 🎉</p>
    <p>Your payment of <strong>$${Number(sale.amountUsd).toFixed(2)}</strong> has been confirmed and the beat has been <strong>removed from the marketplace</strong>. It belongs only to you now.</p>
    <p style="margin:24px 0 8px;"><strong>📥 Download your files</strong> (links expire in 48 hours):</p>
    <p style="margin:8px 0;"><strong>Master WAV</strong><br />${primaryButton(links.master, 'Download Master WAV')}</p>
    ${links.stems ? `<p style="margin:8px 0;"><strong>Full Stems</strong><br />${primaryButton(links.stems, 'Download Stems')}</p>` : ''}
    <p style="margin-top:28px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#6b7280;">
      Your <strong>Exclusive License Agreement</strong> is attached to this email (${escapeHtml(sale.licenseHash || '')}). Keep it as proof of ownership.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to: [sale.buyerEmail],
    subject: `WISHAM — Exclusive License & Files: ${sale.beatTitle}`,
    html: layout('Exclusive License & Your Files', body),
    attachments: [{ filename: licenseFilename(sale.beatTitle), content: pdfAttachment }],
  });

  if (error) {
    console.error('Resend exclusive email error:', error);
    throw new Error(error.message || 'Failed to send exclusive email');
  }
  return true;
}

/** Inclusive sale — download links only, NO license. */
export async function sendInclusiveSaleEmail(sale) {
  const links = buildDownloadLinks(sale);

  const body = `
    <p>Thanks for your purchase of <strong>"${escapeHtml(sale.beatTitle)}"</strong>! ✅</p>
    <p>Payment confirmed: <strong>$${Number(sale.amountUsd).toFixed(2)}</strong>.</p>
    <p style="margin:24px 0 8px;"><strong>📥 Download your beat</strong> (link expires in 48 hours):</p>
    <p style="margin:8px 0;">${primaryButton(links.master, 'Download Master WAV')}</p>
    ${links.stems ? `<p style="margin:8px 0;"><strong>Full Stems</strong><br />${primaryButton(links.stems, 'Download Stems')}</p>` : ''}
    <p style="margin-top:28px;padding-top:16px;border-top:1px solid #eee;font-size:12px;color:#6b7280;">
      This is an <strong>Inclusive (lease) license</strong> — it does not include exclusivity or a license certificate. For exclusive ownership with full stems + license, visit wisham.com.
    </p>
  `;

  const { error } = await resend.emails.send({
    from: config.emailFrom,
    to: [sale.buyerEmail],
    subject: `WISHAM — Your Beat Download: ${sale.beatTitle}`,
    html: layout('Your Beat Is Ready', body),
  });

  if (error) {
    console.error('Resend inclusive email error:', error);
    throw new Error(error.message || 'Failed to send inclusive email');
  }
  return true;
}