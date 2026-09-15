import { NextResponse } from 'next/server';

/** Error with an HTTP status, thrown from route handlers. */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Convert any thrown error into a JSON response. */
export function errorResponse(err: unknown) {
  const e = err as Error & { code?: string };
  let status = 500;
  let message = 'Internal server error';

  if (err instanceof HttpError) {
    status = err.status;
    message = err.message;
  } else if (e?.code === 'PAYMENT_FAILED') {
    status = 402;
    message = e.message;
  } else if (e?.code === 'SALE_NOT_FOUND') {
    status = 404;
    message = e.message;
  } else {
    console.error('API error:', err);
  }

  return NextResponse.json({ error: message }, { status });
}

/** Parse a JSON request body, failing with a 400 on bad input. */
export async function readJson<T>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}