import { NextResponse } from 'next/server';
import { resetAndCleanDb, initDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reset = searchParams.get('reset') === 'true';

    if (reset) {
      await resetAndCleanDb();
      return NextResponse.json({ success: true, message: 'Database cleaned and reinitialized.' });
    } else {
      await initDb();
      return NextResponse.json({ success: true, message: 'Database verified and initialized.' });
    }
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Database error' },
      { status: 500 }
    );
  }
}
