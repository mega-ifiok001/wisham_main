import fs from 'node:fs';
import path from 'node:path';

/** Read a text field out of a FormData payload. */
export function formString(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return typeof v === 'string' ? v : undefined;
}

export function formNumber(fd: FormData, key: string): number | undefined {
  const v = formString(fd, key);
  if (v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function formBoolean(fd: FormData, key: string): boolean | undefined {
  const v = formString(fd, key);
  if (v === undefined) return undefined;
  return v === 'true';
}

/**
 * Server-side upload fallback (local development when Cloudinary is not
 * configured). Writes to ./uploads and returns "/uploads/<file>".
 */
export async function storeUploadedFile(
  file: File,
  prefix: 'masters' | 'stems'
): Promise<string> {
  const dir = path.join(process.cwd(), 'uploads');
  fs.mkdirSync(dir, { recursive: true });
  const ext = (file.name.match(/\.[a-z0-9]+$/i) || [''])[0].toLowerCase();
  const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${ext}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

/** Pull a File out of FormData when present. */
export function formFile(fd: FormData, key: string): File | null {
  const v = fd.get(key);
  return v instanceof File && v.size > 0 ? v : null;
}