import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { HttpError, errorResponse } from '@/lib/http';
import {
  formBoolean,
  formFile,
  formNumber,
  formString,
  storeUploadedFile,
} from '@/lib/beat-input';

export const runtime = 'nodejs';

/** Update a beat (multipart/form-data, all fields optional). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.beat.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, 'Beat not found');

    const fd = await req.formData();

    const audioFile = formFile(fd, 'audioFile');
    const stemsFile = formFile(fd, 'stemsFile');

    const data: Record<string, unknown> = {
      title: formString(fd, 'title') ?? existing.title,
      artist: formString(fd, 'artist') ?? existing.artist,
      genre: formString(fd, 'genre') ?? existing.genre,
      bpm: formNumber(fd, 'bpm') ?? existing.bpm,
      keySignature: formString(fd, 'keySignature') ?? existing.keySignature,
      duration: formString(fd, 'duration') ?? existing.duration,
      coverGradient: formString(fd, 'coverGradient') ?? existing.coverGradient,
      exclusivePrice: formNumber(fd, 'exclusivePrice') ?? existing.exclusivePrice,
      inclusivePrice: formNumber(fd, 'inclusivePrice') ?? existing.inclusivePrice,
      inclusiveStemsPrice:
        formNumber(fd, 'inclusiveStemsPrice') ?? existing.inclusiveStemsPrice,
    };

    const description = formString(fd, 'description');
    if (description !== undefined) data.description = description || null;

    if (audioFile) {
      data.audioUrl = await storeUploadedFile(audioFile, 'masters');
    } else {
      const audioUrl = formString(fd, 'audioUrl');
      if (audioUrl !== undefined) data.audioUrl = audioUrl || null;
    }

    if (stemsFile) {
      data.stemsUrl = await storeUploadedFile(stemsFile, 'stems');
    } else {
      const stemsUrl = formString(fd, 'stemsUrl');
      if (stemsUrl !== undefined) data.stemsUrl = stemsUrl || null;
    }

    // Lets the owner relist a beat (or hide it) from the dashboard
    const isSold = formBoolean(fd, 'isSold');
    if (isSold !== undefined) {
      data.isSold = isSold;
      data.soldAt = isSold ? existing.soldAt ?? new Date() : null;
    }

    const beat = await prisma.beat.update({ where: { id }, data });
    return NextResponse.json({ beat });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Delete a beat and its sales history. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.sale.deleteMany({ where: { beatId: id } });
    await prisma.beat.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}