import { NextRequest, NextResponse } from 'next/server';
import { StorySpec, WeeklyBatchDelivery, SEASON_ESCALATION_LADDER, CastMember } from '@/types';
import { generateWeeklyBatch } from '@/lib/engine/generator';
import { generateWeeklyBatchWithGemini } from '@/lib/engine/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentBatch = body.currentBatch as WeeklyBatchDelivery;

    if (!currentBatch || !currentBatch.spec) {
      return NextResponse.json({ error: 'Missing currentBatch in request' }, { status: 400 });
    }

    const currentSeasonNum = currentBatch.spec.seasonNumber || 1;
    const nextSeasonNum = currentSeasonNum + 1;

    // Retrieve ladder stage
    const ladderStage = SEASON_ESCALATION_LADDER.find((s) => s.seasonNumber === nextSeasonNum) || {
      seasonNumber: nextSeasonNum,
      seasonTitle: `The Next Reckoning (Season ${nextSeasonNum})`,
      stakesTier: 'Escalated Syndicate Warfare',
      coreConflict: 'High-stakes retribution and hidden conspirators',
      newCharacterRole: 'New Key Player',
      newCharacterArchetype: 'Shadow Syndicate Enforcer',
      escalationSummary: 'The conspiracy broadens into international territory.',
    };

    // Extract Day 7 finale cliffhanger from current season
    const day7 = currentBatch.days[6] || currentBatch.days[currentBatch.days.length - 1];
    const finaleVariation = day7?.variations[0];
    const previousSeasonRecap = `Season ${currentSeasonNum} Finale (${finaleVariation?.title || 'Federal Ambush'}): Tactical door breached, emergency sirens filled the private courtyard, and the father's chilling baritone voice came through on the disconnected rotary line.`;

    // Retain existing cast and introduce the new season character
    const existingCast = [...currentBatch.spec.cast];

    if (nextSeasonNum === 2 && !existingCast.some((c) => c.name.includes('Sarah'))) {
      const detectiveSarah: CastMember = {
        id: 'char-sarah',
        name: 'Detective Sarah Vance',
        role: 'Hero',
        description: '34yo Internal Affairs federal detective and Julian\'s estranged sister.',
        dnaPrompt: '34-year-old determined federal detective, sharp analytical gray eyes, pulled-back dark blonde hair, discreet ear-piece, tailored charcoal blazer with silver federal badge clipped inside lapel. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Uncompromising, methodical, conflicted family loyalty',
      };
      existingCast.push(detectiveSarah);
    } else if (nextSeasonNum === 3 && !existingCast.some((c) => c.name.includes('Dominic'))) {
      const dominicSterling: CastMember = {
        id: 'char-dominic',
        name: 'Dominic Sterling',
        role: 'Villain',
        description: '55yo exiled patriarch and Shadow Syndicate financier.',
        dnaPrompt: '55-year-old silver-haired billionaire patriarch, tailored bespoke ivory dinner jacket, icy blue eyes, gold signet ring on right pinky. Master 8K photorealistic keyframe portrait.',
        usesReferenceImage: true,
        personalityVibe: 'Ruthless elegance, soft-spoken menace, aristocratic power',
      };
      existingCast.push(dominicSterling);
    }

    const nextSeasonSpec: StorySpec = {
      ...currentBatch.spec,
      id: `spec-s${nextSeasonNum}-${Date.now()}`,
      seasonNumber: nextSeasonNum,
      seasonTitle: ladderStage.seasonTitle,
      stakesTier: ladderStage.stakesTier,
      previousSeasonRecap,
      castCount: existingCast.length,
      cast: existingCast,
      createdAt: new Date().toISOString(),
    };

    // Generate with Gemini if key available, else procedural
    let nextBatch: WeeklyBatchDelivery;
    try {
      nextBatch = await generateWeeklyBatchWithGemini(nextSeasonSpec, { mode: 'mind_maps' });
    } catch {
      nextBatch = generateWeeklyBatch(nextSeasonSpec, { mode: 'mind_maps' });
    }

    return NextResponse.json({
      success: true,
      batch: nextBatch,
      ladderStage,
    });
  } catch (error: any) {
    console.error('Error generating next season:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate next season',
        message: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
