import { NextResponse } from 'next/server';
import { ensureDbInit } from '../../../lib/db';

export async function GET() {
  try {
    await ensureDbInit();
    return NextResponse.json({ success: true, message: 'Database schema verified / initialized.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
