import { NextResponse } from 'next/server';
import connectToDatabase from '@/utils/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
