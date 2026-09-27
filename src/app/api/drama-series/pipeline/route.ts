import { NextRequest, NextResponse } from 'next/server';
import {
  generateSeasonStoryPipeline,
  generateCharacterBiblePipeline,
  generateEpisodeProductionPipeline,
  generateClipsAndContinuityPipeline,
  generateFrameAndVideoPromptsPipeline,
  runDirectorQAPipeline,
} from '@/lib/engine/drama-series/pipeline';
import { AIProviderConfig } from '@/lib/engine/llm-provider';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      seedTopic,
      genre,
      seasonStory,
      characterBible,
      episodeNumber = 1,
      episodeSheet,
      sceneContinuity,
      clipsBreakdown,
      framePrompts,
      videoPrompts,
      aspectRatio = '16:9',
      aiConfig,
    }: {
      action:
        | 'season_story'
        | 'character_bible'
        | 'episode_breakdown'
        | 'clips_continuity'
        | 'prompts'
        | 'director_qa'
        | 'run_full_episode';
      seedTopic?: string;
      genre?: string;
      seasonStory?: any;
      characterBible?: any;
      episodeNumber?: number;
      episodeSheet?: any;
      sceneContinuity?: any;
      clipsBreakdown?: any;
      framePrompts?: any;
      videoPrompts?: any;
      aspectRatio?: '16:9' | '9:16';
      aiConfig?: AIProviderConfig;
    } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action parameter is required' }, { status: 400 });
    }

    // 1. PHASE 1: Season Story
    if (action === 'season_story') {
      if (!seedTopic) {
        return NextResponse.json({ error: 'seedTopic is required for season_story' }, { status: 400 });
      }
      const story = await generateSeasonStoryPipeline(seedTopic, genre, aiConfig);
      return NextResponse.json({ success: true, seasonStory: story });
    }

    // 2. PHASE 2: Character Bible
    if (action === 'character_bible') {
      if (!seasonStory) {
        return NextResponse.json({ error: 'seasonStory is required for character_bible' }, { status: 400 });
      }
      const bible = await generateCharacterBiblePipeline(seasonStory, aiConfig);
      return NextResponse.json({ success: true, characterBible: bible });
    }

    // 3. PHASE 3: Episode Production Breakdown
    if (action === 'episode_breakdown') {
      if (!seasonStory || !characterBible) {
        return NextResponse.json(
          { error: 'seasonStory and characterBible are required for episode_breakdown' },
          { status: 400 }
        );
      }
      const sheet = await generateEpisodeProductionPipeline(
        seasonStory,
        characterBible,
        episodeNumber,
        aiConfig
      );
      return NextResponse.json({ success: true, episodeSheet: sheet });
    }

    // 4. PHASE 4 & 5: Scene Continuity & 10s Clip Breakdown
    if (action === 'clips_continuity') {
      if (!episodeSheet || !characterBible) {
        return NextResponse.json(
          { error: 'episodeSheet and characterBible are required for clips_continuity' },
          { status: 400 }
        );
      }
      const data = await generateClipsAndContinuityPipeline(episodeSheet, characterBible, aiConfig);
      return NextResponse.json({
        success: true,
        sceneContinuity: data.sceneContinuity,
        clipsBreakdown: data.clipsBreakdown,
      });
    }

    // 5. PHASE 6 & 7: Frame & Video Prompts
    if (action === 'prompts') {
      if (!clipsBreakdown || !characterBible || !sceneContinuity) {
        return NextResponse.json(
          { error: 'clipsBreakdown, characterBible, and sceneContinuity are required for prompts' },
          { status: 400 }
        );
      }
      const data = await generateFrameAndVideoPromptsPipeline(
        clipsBreakdown,
        characterBible,
        sceneContinuity,
        aiConfig,
        aspectRatio
      );
      return NextResponse.json({
        success: true,
        framePrompts: data.framePrompts,
        videoPrompts: data.videoPrompts,
      });
    }

    // 6. PHASE 8: Director QA
    if (action === 'director_qa') {
      if (!clipsBreakdown || !framePrompts || !videoPrompts || !characterBible || !sceneContinuity) {
        return NextResponse.json(
          { error: 'clips, prompts, characterBible, and continuity are required for director_qa' },
          { status: 400 }
        );
      }
      const qa = await runDirectorQAPipeline(
        clipsBreakdown,
        framePrompts,
        videoPrompts,
        characterBible,
        sceneContinuity,
        aiConfig
      );
      return NextResponse.json({ success: true, directorQA: qa });
    }

    // 7. FULL PIPELINE EXECUTION FOR AN EPISODE
    if (action === 'run_full_episode') {
      if (!seasonStory || !characterBible) {
        return NextResponse.json(
          { error: 'seasonStory and characterBible are required' },
          { status: 400 }
        );
      }

      // Step 3: Breakdown
      const sheet = await generateEpisodeProductionPipeline(
        seasonStory,
        characterBible,
        episodeNumber,
        aiConfig
      );

      // Step 4 & 5: Clips & Continuity
      const { sceneContinuity: continuity, clipsBreakdown: clips } =
        await generateClipsAndContinuityPipeline(sheet, characterBible, aiConfig);

      // Step 6 & 7: Frame & Video Prompts
      const { framePrompts: frames, videoPrompts: videos } =
        await generateFrameAndVideoPromptsPipeline(clips, characterBible, continuity, aiConfig, aspectRatio);

      // Step 8: Director QA
      const qa = await runDirectorQAPipeline(clips, frames, videos, characterBible, continuity, aiConfig);

      return NextResponse.json({
        success: true,
        episodeSheet: sheet,
        sceneContinuity: continuity,
        clipsBreakdown: clips,
        framePrompts: frames,
        videoPrompts: videos,
        directorQA: qa,
      });
    }

    return NextResponse.json({ error: 'Unrecognized action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in drama-series pipeline route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error in Drama Series Pipeline' },
      { status: 500 }
    );
  }
}
