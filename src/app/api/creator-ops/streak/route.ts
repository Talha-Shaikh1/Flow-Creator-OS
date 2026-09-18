import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPKTDate, getPKTDateString } from '@/lib/creator-ops/time';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const todayStr = getPKTDateString();
    const todayDate = getPKTDate();

    // Generate list of the past 28 dates in PKT
    const past28Dates: string[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      past28Dates.push(`${yyyy}-${mm}-${dd}`);
    }

    // Fetch all uploads for these 28 dates
    const uploads = await prisma.dailyUpload.findMany({
      where: {
        date: { in: past28Dates },
      },
      include: { persona: true },
    });

    // Group by date
    const dateMap = new Map<string, any[]>();
    for (const u of uploads) {
      if (!dateMap.has(u.date)) dateMap.set(u.date, []);
      dateMap.get(u.date)!.push(u);
    }

    // Compute status per day:
    // "completed" = all personas had allCompleted = true or at least 1 persona had 4/4
    // "partial" = at least 1 platform checked but not all
    // "missed" = 0 checked
    const history = past28Dates.map((date) => {
      const dayUploads = dateMap.get(date) || [];
      let status: 'completed' | 'partial' | 'missed' = 'missed';
      let completedCount = 0;
      let totalChannelsChecked = 0;

      for (const u of dayUploads) {
        if (u.allCompleted) completedCount++;
        let c = 0;
        if (u.youtubeDone) c++;
        if (u.instaDone) c++;
        if (u.tiktokDone) c++;
        if (u.facebookDone) c++;
        totalChannelsChecked += c;
      }

      if (dayUploads.length > 0 && completedCount > 0) {
        status = 'completed';
      } else if (totalChannelsChecked > 0) {
        status = 'partial';
      } else {
        status = 'missed';
      }

      return {
        date,
        status,
        uploads: dayUploads,
        totalChannelsChecked,
      };
    });

    // Calculate consecutive streak working backward from today (or yesterday if today is still in progress)
    let streak = 0;
    const reversed = [...history].reverse();

    for (let i = 0; i < reversed.length; i++) {
      const day = reversed[i];
      if (day.status === 'completed') {
        streak++;
      } else if (day.date === todayStr && day.status !== 'missed') {
        // Today is partial, don't break streak yet
        streak++;
      } else if (day.date === todayStr && day.status === 'missed') {
        // Today has just started, look at yesterday
        continue;
      } else {
        break;
      }
    }

    return NextResponse.json({
      streak,
      history,
      today: todayStr,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
