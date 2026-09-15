import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import prisma from '@/lib/prisma';
import { HttpError, errorResponse } from '@/lib/http';
import {
  isCloudinaryUrl,
  parseCloudinaryUrl,
  signedDeliveryUrl,
} from '@/lib/services/cloudinary';

export const runtime = 'nodejs';

const LINK_TTL_MS = 48 * 60 * 60 * 1000; // 48h

/**
 * Secure download: /api/download/:saleId/:token?file=master|stems
 * The token comes from the purchase email, links expire after 48 hours.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ saleId: string; token: string }> }
) {
  try {
    const { saleId, token } = await params;
    const file = new URL(req.url).searchParams.get('file') === 'stems' ? 'stems' : 'master';

    const sale = await prisma.sale.findFirst({
      where: { id: saleId, downloadToken: token, paymentStatus: 'success' },
      include: { beat: true },
    });

    if (!sale) throw new HttpError(404, 'Download link is invalid or expired.');

    if (Date.now() > sale.createdAt.getTime() + LINK_TTL_MS) {
      throw new HttpError(410, 'This download link has expired. Contact WISHAM for a new link.');
    }
    if (file === 'stems' && !sale.includesStems) {
      throw new HttpError(403, 'This purchase does not include stems.');
    }

    const url = file === 'stems' ? sale.beat.stemsUrl : sale.beat.audioUrl;
    if (!url) throw new HttpError(404, 'File has not been published yet. Contact WISHAM.');

    const safeTitle = sale.beatTitle.replace(/[^a-z0-9]+/gi, '-');
    const filename = file === 'stems' ? `${safeTitle}-Stems.zip` : `${safeTitle}-Master.wav`;

    // 1) Cloudinary (authenticated asset) -> signed delivery URL
    if (isCloudinaryUrl(url)) {
      const { resourceType, publicId } = parseCloudinaryUrl(url);
      const signed = signedDeliveryUrl({ resourceType, publicId, filename });
      return NextResponse.redirect(signed);
    }

    // 2) Remote URL (public CDN) -> straight redirect
    if (/^https?:\/\//i.test(url)) {
      return NextResponse.redirect(url);
    }

    // 3) Local dev fallback — files uploaded before Cloudinary was configured
    if (url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'uploads', path.basename(url));
      if (!fs.existsSync(filePath)) throw new HttpError(404, 'File missing on server.');
      const data = fs.readFileSync(filePath);
      return new NextResponse(new Uint8Array(data), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    throw new HttpError(404, 'File has not been published yet. Contact WISHAM.');
  } catch (err) {
    return errorResponse(err);
  }
}