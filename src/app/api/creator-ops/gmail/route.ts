import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const accounts = await prisma.gmailAccount.findMany({
      include: { personas: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ accounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, subscription = 'Free', renewalDate, browserProfile, notes } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const account = await prisma.gmailAccount.upsert({
      where: { email },
      update: {
        subscription,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        browserProfile,
        notes,
      },
      create: {
        email,
        subscription,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        browserProfile,
        notes,
      },
      include: { personas: true },
    });

    return NextResponse.json({ account });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
