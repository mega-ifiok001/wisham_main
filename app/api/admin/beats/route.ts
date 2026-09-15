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

/** List all beats (admin dashboard). */
export async function GET() {
  try {
    await requireAdmin();
    const beats = await prisma.beat.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ beats });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Create a new beat (multipart/form-data). */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const fd = await req.formData();

    const title = formString(fd, 'title');
    const artist = formString(fd, 'artist');
    const genre = formString(fd, 'genre');
    const bpm = formNumber(fd, 'bpm');
    const keySignature = formString(fd, 'keySignature');
    const duration = formString(fd, 'duration');
    const coverGradient = formString(fd, 'coverGradient');
    const exclusivePrice = formNumber(fd, 'exclusivePrice');
    const inclusivePrice = formNumber(fd, 'inclusivePrice');
    const inclusiveStemsPrice = formNumber(fd, 'inclusiveStemsPrice');

    if (
      !title ||
      !artist ||
      !genre ||
      bpm === undefined ||
      !keySignature ||
      !duration ||
      !coverGradient ||
      exclusivePrice === undefined ||
      inclusivePrice === undefined ||
      inclusiveStemsPrice === undefined
    ) {
      throw new HttpError(400, 'Missing required fields');
    }

    const audioFile = formFile(fd, 'audioFile');
    const stemsFile = formFile(fd, 'stemsFile');
    const description = formString(fd, 'description');

    const beat = await prisma.beat.create({
      data: {
        title,
        artist,
        genre,
        bpm,
        keySignature,
        duration,
        coverGradient,
        exclusivePrice,
        inclusivePrice,
        inclusiveStemsPrice,
        description: description || null,
        audioUrl: audioFile ? await storeUploadedFile(audioFile, 'masters') : null,
        stemsUrl: stemsFile ? await storeUploadedFile(stemsFile, 'stems') : null,
      },
    });

    return NextResponse.json({ beat }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}