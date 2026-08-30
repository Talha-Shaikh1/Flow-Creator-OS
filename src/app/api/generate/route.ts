import { NextResponse } from 'next/server';
import { geminiService } from '../../../services/geminiService';

export async function POST(req: Request) {
  try {
    const { profile, vaultItems, performanceLogs } = await req.json();

    const serverApiKey = process.env.GEMINI_API_KEY || '';

    if (!serverApiKey || serverApiKey.trim().length < 8) {
      return NextResponse.json({
        success: false,
        source: 'missing_gemini_key',
        message: 'No GEMINI_API_KEY found in .env.local',
      });
    }

    const plan = await geminiService.generateWeeklyPlanWithGemini(
      serverApiKey,
      profile,
      vaultItems || [],
      performanceLogs || []
    );

    return NextResponse.json({
      success: true,
      source: 'platform_server_gemini',
      plan,
    });
  } catch (error: any) {
    console.warn('Gemini API call warning in /api/generate:', error.message);
    return NextResponse.json({
      success: false,
      source: 'gemini_api_fallback',
      error: error.message,
    });
  }
}
