import { StorySpec, WeeklyBatchDelivery, DayContentPackage, VideoVariation, SEASON_ESCALATION_LADDER, DailyPhotoPost } from '@/types';
import { getWeeklyEmotionArc } from './rules/retention';
import { evaluatePromptCritique } from './critique';
import { resolveSeriesTitle, EPISODE_TITLES } from './generator';
import { generateDailyPhotoPosts } from './rules/photos';
import { createTokenReport, estimateTokenCount } from './tokens';
import { callUniversalLLM, AIProviderConfig } from './llm-provider';

export async function generateWeeklyBatchWithGemini(
  spec: StorySpec,
  options: { mode?: 'mind_maps' | 'full'; aiConfig?: AIProviderConfig } = { mode: 'mind_maps' }
): Promise<WeeklyBatchDelivery> {
  const isMindMapOnly = options.mode === 'mind_maps';

  const systemInstruction = isMindMapOnly
    ? `You are FlowCreator OS — an Autonomous Directing Engine.
You are generating STAGE 1: LIGHTWEIGHT STORY & DIALOGUE MIND MAPS for a 7-Day arc.
To protect tokens, DO NOT generate deep clip prompts yet.
For EACH of the 7 days, generate 3 variations:
- Variation A (High Tension)
- Variation B (Emotional Core)
- Variation C (Fast Hook)

For each variation, provide:
1. "title": Short cinematic episode title
2. "variationLabel": Variation name
3. "hookDescription": Compelling visual/psychological hook
4. "dialogueScript": Array of dialogue lines [{ speaker: string, line: string (18-22 words), timing: string }]
5. "seriesContinuityRecap": Plot continuity recap for this day
6. "metadata": caption, hashtags, audioVibe
7. "clips": [] (Leave EMPTY array to save tokens!)
8. "isProduced": false

CRITICAL: For EACH of the 7 days, ALSO generate a "dailyPhotoPosts" array with 4 distinct authentic photo posts strictly matching the persona niche:
- For Real Influencer / Lifestyle (e.g. Elena): Generate real Instagram influencer lifestyle posts ("Cafe Candid", "Mirror OOTD", "Golden Hour Street", "Desk / BTS Flatlay") with hyper-realistic Midjourney/Flux prompts locking her visual DNA (green eyes, signature cheek mole, gold layered necklace, natural skin pores, 35mm film still), plus relatable, thoughtful captions.
- For Pet Comedy: Generate hilarious pet photography ("Goofy Pet Candid", "Pet Comedy Standoff", "Pet Parent BTS", "Desk / BTS Flatlay") with photorealistic fur textures, funny pet-perspective captions and hashtags.
- For Character Drama: Generate Hollywood film set BTS ("Film Set BTS", "Candid Set Lore", "Forensic Prop Clue", "Desk / BTS Flatlay").

Each dailyPhotoPost item:
{
  "id": "day-1-photo-1",
  "category": "Cafe Candid" | "Mirror OOTD" | "Golden Hour Street" | "Desk / BTS Flatlay" | "Goofy Pet Candid" | "Pet Comedy Standoff" | "Pet Parent BTS" | "Film Set BTS" | "Forensic Prop Clue",
  "title": "Short descriptive title",
  "outfit": "Detailed wardrobe & styling description",
  "caption": "Authentic, high-engagement caption in persona voice",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "imagePrompt": "8K photorealistic Midjourney / Flux prompt with camera lens, lighting, character DNA reference lock, and aesthetic mood"
}

Return valid JSON matching the schema with days array containing the variations and dailyPhotoPosts.`
    : `You are FlowCreator OS — an Autonomous Directing and Production Operating System for Google Flow (Veo).
Your mission is to generate high-performing short-form video story specs and prompt packages for content creators.
You NEVER write generic video prompts. You MUST strictly adhere to the 3 Foundational Pillars:

PILLAR 1: SPATIAL GEOMETRY, MASTER ANCHORS & REFERENCE IMAGE ANCHORING
- Every character has a Master Visual DNA Anchor.
- CRITICAL CONSISTENCY DIRECTIVE: In clip "frameImagePrompt" (for Text-to-Image generators like Midjourney / Flux / SDXL), DO NOT write bloated facial descriptions from scratch! Re-prompting faces in text causes AI face drift and morphing.
- INSTEAD, ALWAYS USE REFERENCE IMAGE ANCHORING:
  [VIDEO FRAME IMAGE {clipIndex}/{totalClips} - STARTING KEYFRAME (FLUX / MIDJOURNEY)]:
  [IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of {CharacterName}. Maintain 100% exact facial geometry, cheekbone structure, eyes, and hair styling identical to the reference image without alteration or face morphing.
  [SCENE BLOCKING & ACTION]: Describe character posture, camera position (screen-left/right), physical props, and gaze.
  [CINEMATOGRAPHY & LIGHTING]: ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field. Global Hollywood / Netflix Noir aesthetic, high-contrast chiaroscuro lighting, deep Venetian blind shadows, warm practicals, atmospheric haze, 8K photorealistic film still.
- Scene-based continuity locks (not single chain across different locations).

PILLAR 2: TEMPORAL CHOREOGRAPHY & STRICT SPEAKER ISOLATION (DIRECTOR LEVEL)
- Google Flow (Veo) generates 10-second clips.
- Multi-character dialogue MUST use shot-reverse-shot cuts.
- NEVER allow two characters to speak simultaneously in one clip.
- The inactive character in any clip MUST have an explicit directive: "[CHARACTER_NAME: 100% SILENT, LISTENING REACTION ONLY, LIPS SEALED, BACK TO CAMERA / SOFT FOCUS]".
- Embedded spoken dialogue: 1.5s pregnant dramatic pause before speech; crystal clear lip-sync articulation matching syllables; lips seal firmly upon completion.

PILLAR 3: RETENTION DYNAMICS & PSYCHOLOGICAL HOOKS
- Clip 1 must have a 0-3s visual-contrast opener or high-stakes physical confrontation.
- Dialogue pacing for each 10s clip must be strictly 18-22 words (never more than 25 words).
- End with a psychological cliffhanger.

PILLAR 4: GOOGLE FLOW SAFETY & FACE GENERATION COMPLIANCE (STRICT)
- AVOID CELEBRITY LIKENESSES: Automated video safety filters reject photorealistic faces resembling real or famous people in dramatic confrontation scenes ("real person in sensitive situations" policy).
- All characters MUST be designated as: "Original fictional character with distinct non-celebrity digital human facial structure".
- PROHIBITED CONTENT: Absolutely no physical violence, weapons, shouting, blood, gore, murder/hit threats, or tobacco/smoking. Channel high stakes exclusively through corporate espionage, legal countdowns, wiretapped audio, cold-storage drives, and icy psychological tension.
- In every "flowPromptText", provide a clean, powerful, natural prose directive for Google Flow (Veo 2). NEVER write the words "blood", "weapons", "violence", "gore", or "tobacco" anywhere in the prompt (even with 'no'), because automated classifiers flag those tokens directly.

PILLAR 5: IN-UNIVERSE BTS & FORENSIC FEED CONTENT (ANTI-AI CLICHÉ)
- Never output generic AI lifestyle tropes (no generic coffee shop, gym mirror selfie, or empty street walks).
- Output authentic Hollywood Film Set BTS (director monitor, ARRI camera rigs, script reads between takes), Forensic Macro Prop Clues (the exact physical evidence from today's episode), and Candid In-Universe Set Lore (varying set angles, rainy terrace, executive elevator foyer).

OUTPUT SPECIFICATION:
Generate a 7-Day arc (Day 1 to Day 7). For each day, create 3 variations:
- Variation A (High Tension)
- Variation B (Emotional Core)
- Variation C (Fast Hook)

CRITICAL: For EACH clip, you MUST provide TWO distinct prompts:
1. "frameImagePrompt": The Reference Image-Anchored Text-to-Image prompt for Midjourney / Flux (composition, character placement screen-left/right, scene-adaptive wardrobe, 4K/8K photorealistic Netflix Noir lighting).
2. "flowPromptText": The Director-Level 10-second Google Flow (Veo 2) Master Video Directive. Must be structured with:
   - [CLIP X/Y - GOOGLE FLOW VEO MASTER DIRECTIVE]
   - [CINEMATIC SPEC]: 9:16 vertical composition, 24fps motion blur, 4K Hollywood cinematography.
   - [LOCATION MASTER ANCHOR]: Specific locked setting and depth.
   - [CHARACTER REFERENCE ANCHORS & SPATIAL BLOCKING]:
     • Primary Subject: Original fictional character [Name] [ATTACH REFERENCE IMAGE 1 - [NAME]]. [Wardrobe, position, sharp focus]
     • Counterpart Subject: Original fictional character [Counterpart Name] [ATTACH REFERENCE IMAGE 2 - [COUNTERPART]]. [Position, 100% silent, listening reaction across desk/room]
   - [VOCAL CADENCE & DYNAMIC TONAL INFLECTION (SAKHTI & NARMI)]:
     • Dynamic Modulation: Describe the emotional arc (e.g., voice begins with quiet, calm restraint (narmi), gradually hardening into a sharp, steely edge of authority (sakhti), dropping to a cold whisper on the final name).
     • Spoken Line: "[Exact Dialogue]"
     • Lip-Sync Directive: Realistic mouth lip-synchronization matching every syllable.
   - [SHOT & CAMERA]: Lens, camera movement, and smooth rack-focus drift shifting toward counterpart [ATTACH REFERENCE IMAGE 2] to capture listening reaction.
   - [SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
     • [0:00 - 0:02 | SUSPENSE BEAT]: Camera move, composed posture, 1.5-second measured dramatic pause, ambient SFX.
     • [0:02 - 0:07 | VOCAL DELIVERY & MODULATION]: Dialogue delivery with sakhti/narmi tonal inflection, lip-sync articulation.
     • [0:07 - 0:09 | CAMERA SHIFT & COUNTERPART REACTION]: Smooth rack-focus drift to counterpart [ATTACH REFERENCE IMAGE 2], rigid posture, sealed lips.
     • [0:09 - 0:10 | CONTINUITY HOLD]: Standoff tension hold into next cut.
   - [LIGHTING & ATMOSPHERE]: Chiaroscuro key lighting and atmospheric depth.
   - [AUDIO & FOLEY SOUND DESIGN]: Crisp dialogue, room acoustic reverb, subtle tension drone.
   - [NEGATIVE DIRECTIVES]: morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter, plastic skin, distorted anatomy. (NEVER write blood, weapons, violence, gore, or tobacco).
Plus character/location reference prompts, dialogue script, and metadata (caption, hashtags).
Return valid JSON only matching the schema.`;

  const isAutonomousCast = !spec.cast || spec.cast.length === 0 || spec.autonomousCast;

  const castInstruction = isAutonomousCast
    ? `- AUTONOMOUS CASTING DIRECTIVE:
  The user has NOT provided manual characters.
  Analyze the story premise ("${spec.customStoryIdea || spec.tone}"), genres (${spec.genres.join(', ')}), and format.
  Autonomously create the optimal cast:
  1. Structure the hierarchy:
     - 2 Core Leads: 1 Protagonist (role: "Hero") and 1 Antagonist (role: "Villain").
     - 1-2 Recurring Side Characters: (role: "Side") e.g. Fixer, Whistleblower, Informant, Detective, or Confidante as fitting the conflict.
  2. For EACH character, output:
     - id: "char-1", "char-2", etc.
     - name: Original, realistic, non-famous fictional name fitting the world.
     - role: "Hero" | "Villain" | "Side" | "Narrator"
     - description: Concise logline of age, profession, and motivation.
     - dnaPrompt: "Original fictional character, {age}yo {gender} with distinct non-celebrity digital human facial structure, {features}, {wardrobe}. Master 8K photorealistic keyframe portrait."
     - usesReferenceImage: true
     - personalityVibe: Distinct psychological/vocal cadence.
  3. Include this newly crafted cast array in the root of your JSON output as "cast": [...] and strictly use these exact character names in all dialogue scripts and clip descriptions.`
    : `- Cast Setup: ${spec.cast
        .map(
          (c) =>
            `${c.name} (${c.role}): ${
              c.usesReferenceImage
                ? `Uses Reference Image for facial DNA. Personality Vibe: ${c.personalityVibe || 'Dynamic'}`
                : c.dnaPrompt
            }`
        )
        .join(' | ')}`;

  const promptText = `Story Specification:
- Format: ${spec.format}
- Genres: ${spec.genres.join(', ')}
- Tone: ${spec.tone}
- Visual Style: ${spec.visualStyle}
${spec.workflowPipeline ? `- CUSTOM NICHE PIPELINE: "${spec.workflowPipeline.name}" (${spec.workflowPipeline.nicheType})
  * Persona DNA Lock: "${spec.workflowPipeline.personaSubjectAnchor}"
  * Camera & Shooting Style: "${spec.workflowPipeline.cameraShootingStyle}"
  * Hook Recipe: "${spec.workflowPipeline.hookArchetype}"
  * Pacing Cadence: "${spec.workflowPipeline.pacingCadence}"
  * Audio & Foley Mood: "${spec.workflowPipeline.audioFoleyMood || 'Proximity vocal presence, room acoustics'}"
  (CRITICAL: Strictly enforce this camera shooting style, persona anchor, and hook pacing in every clip!)` : ''}
${spec.customStoryIdea ? `- CREATOR'S CUSTOM STORY PREMISE / ANCHOR: "${spec.customStoryIdea}" (Incorporate this premise as the core narrative throughout the 7-day arc!)` : ''}
${castInstruction}
- Locations: ${spec.locationSettings.join(', ')}

Generate a complete 7-Day production delivery package with 3 variations per day.`;


  try {
    const llmResponse = await callUniversalLLM({
      config: options.aiConfig,
      prompt: promptText,
      systemInstruction,
      temperature: 0.7,
      responseJson: true,
    });

    const parsedData = llmResponse.parsed;
    if (!parsedData) {
      throw new Error('LLM did not return valid parsed JSON data.');
    }

    // If Gemini returned an array of days or a batch object, standardize it
    const rawDays = Array.isArray(parsedData)
      ? parsedData
      : parsedData.days || parsedData.weeklyBatch || [];

    if (!Array.isArray(rawDays) || rawDays.length === 0) {
      throw new Error('Gemini response format did not contain valid days array');
    }

    const days: DayContentPackage[] = rawDays.slice(0, 7).map((d: any, dayIdx: number) => {
      const arc = getWeeklyEmotionArc(dayIdx + 1);
      const rawVars = d.variations || d.episodes || d.angles || d.options || (Array.isArray(d) ? d : []);
      const variations: VideoVariation[] = (Array.isArray(rawVars) ? rawVars : []).map((v: any, vIdx: number) => {
        const vLabel =
          v.variationLabel ||
          (vIdx === 0
            ? 'Variation A (High Tension)'
            : vIdx === 1
            ? 'Variation B (Emotional Core)'
            : 'Variation C (Fast Hook)');

        const unvalidatedVariation = {
          id: `day-${dayIdx + 1}-v${vIdx + 1}`,
          variationLabel: vLabel,
          title: v.title || `${arc.dayName} Episode - ${vLabel}`,
          hookDescription: v.hookDescription || `${spec.format} story for ${arc.dailyEmotion}`,
          characterAnchors: v.characterAnchors || [
            {
              characterName: spec.cast[0]?.name || 'Protagonist',
              anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${spec.cast[0]?.name || 'Protagonist'} DNA Lock. ${spec.visualStyle}`,
            },
          ],
          locationAnchors: v.locationAnchors || [
            {
              locationName: spec.locationSettings[0] || 'Main Location',
              anchorPrompt: `[LOCATION MASTER FRAME ANCHOR]: ${spec.locationSettings[0] || 'Main Location'}. ${spec.visualStyle}`,
            },
          ],
          clips: isMindMapOnly
            ? []
            : (v.clips || []).map((c: any, cIdx: number) => ({
                clipIndex: c.clipIndex || cIdx + 1,
                totalClips: 3,
                sceneName: c.sceneName || `Scene ${cIdx + 1}`,
                locationAnchor: c.locationAnchor || spec.locationSettings[0] || 'Main Location',
                masterKeyframeLock: c.masterKeyframeLock || `Spatial master lock in ${spec.visualStyle}`,
                shotType: c.shotType || (cIdx === 1 ? 'Shot-Reverse-Shot Close-Up' : 'Master Wide'),
                speakerIsolation: {
                  activeSpeaker: c.speakerIsolation?.activeSpeaker || spec.cast[0]?.name || 'Speaker',
                  speakingDialogue: c.speakerIsolation?.speakingDialogue || c.dialogue || '',
                  silentCharacters: c.speakerIsolation?.silentCharacters || [],
                  cameraCutApplied: Boolean(c.speakerIsolation?.cameraCutApplied ?? true),
                },
                timeline: (c.timeline || [
                  {
                    timeRange: '0:00 - 0:03',
                    visualAction: 'High contrast visual opener.',
                    cameraMovement: 'Subtle slow push-in.',
                    sfxCue: 'Subtle bass sub-drop, sudden silence on cut.',
                  },
                  {
                    timeRange: '0:03 - 0:08',
                    visualAction: 'Delivers dialogue with strict speaker isolation.',
                    cameraMovement: 'Locked portrait framing.',
                    sfxCue: 'Clear dialogue vocal warmth, faint emotional cello / atmospheric drone.',
                  },
                  {
                    timeRange: '0:08 - 0:10',
                    visualAction: 'Lingering reaction hold before clip cut.',
                    cameraMovement: 'Static hold.',
                    sfxCue: 'Sharp breath intake, cliffhanger riser sound, sudden audio cut.',
                  },
                ]).map((t: any) => ({
                  ...t,
                  sfxCue: t.sfxCue || 'Cinematic room tone and subtle foley sound.',
                })),
                frameImagePrompt:
                  c.frameImagePrompt ||
                  `[VIDEO FRAME IMAGE - KEYFRAME ${cIdx + 1}/3]: ${spec.locationSettings[0] || 'Scene'}. ${spec.visualStyle}. ${c.shotType || 'Cinematic Shot'}. Photorealistic 4K starting keyframe composition. Key lighting, architectural depth, shallow focus.`,
                flowPromptText:
                  c.flowPromptText ||
                  `[CLIP ${cIdx + 1}/3 - GOOGLE FLOW VEO DIRECTIVE]\n[LOCATION]: ${spec.locationSettings[0]}\n[SHOT]: 4K Cinematic\n[ACTIVE SPEAKER]: ${c.speakerIsolation?.activeSpeaker || 'Speaker'}`,
                retentionHookReasoning: c.retentionHookReasoning || '0-3s hook captures feed attention.',
                pacingWordCount: (c.speakerIsolation?.speakingDialogue || '').split(/\s+/).filter(Boolean).length || 18,
                sceneWardrobe: c.sceneWardrobe || 'Adaptive scene-appropriate styling',
                requiresReferenceImageAttachment: Boolean(spec.cast.some((char) => char.usesReferenceImage)),
                foleySoundDesign: c.foleySoundDesign || 'Cinematic room acoustic ambience, directional dialogue resonance, tension drone, subtle foley accents.',
                negativePromptDirectives: c.negativePromptDirectives || 'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
              })),
          isProduced: !isMindMapOnly,
          dialogueScript: v.dialogueScript || [],
          seriesContinuityRecap: v.seriesContinuityRecap || `Day ${dayIdx + 1} Continuity: ${arc.dailyEmotion}. Culminates in a psychological cliffhanger.`,
          metadata: {
            caption: v.metadata?.caption || `${v.title || 'New Episode'} 🎬 Directed with FlowCreator OS. #GoogleFlow #AIvideo`,
            hashtags: v.metadata?.hashtags || ['#GoogleFlow', '#Veo', '#AICinema', '#ViralShorts'],
            audioVibe: v.metadata?.audioVibe || spec.tone,
          },
        };

        const critique = evaluatePromptCritique(unvalidatedVariation);
        return {
          ...unvalidatedVariation,
          critique,
        };
      });

      const rawPhotoPosts = d.dailyPhotoPosts || d.photoPosts || d.photos || [];
      const llmDailyPhotos: DailyPhotoPost[] | null = Array.isArray(rawPhotoPosts) && rawPhotoPosts.length > 0
        ? rawPhotoPosts.map((p: any, pIdx: number) => ({
            id: p.id || `day-${dayIdx + 1}-photo-${pIdx + 1}`,
            category: p.category || (spec.format === 'pet_comedy' ? 'Goofy Pet Candid' : 'Cafe Candid'),
            title: p.title || `Day ${dayIdx + 1} Photo ${pIdx + 1}`,
            caption: p.caption || `Day ${dayIdx + 1} moments. ✨`,
            hashtags: Array.isArray(p.hashtags) ? p.hashtags : ['#DailyMoments', '#Aesthetic'],
            outfit: p.outfit || (spec.format === 'pet_comedy' ? 'Natural pet fur coat' : 'Neutral aesthetic styling'),
            imagePrompt: p.imagePrompt || `Photorealistic lifestyle photo for Day ${dayIdx + 1}.`,
          }))
        : null;

      const dailyPhotos = llmDailyPhotos || generateDailyPhotoPosts(
        spec.cast[0],
        dayIdx + 1,
        arc.dayName,
        arc.dailyEmotion,
        spec.format,
        spec.locationSettings[0],
        spec.cast
      );

      if (variations.length === 0) {
        throw new Error(`LLM output did not contain valid variations for Day ${dayIdx + 1}. Please retry generation.`);
      }

      return {
        dayNumber: dayIdx + 1,
        episodeTitle: EPISODE_TITLES[dayIdx + 1] || `Episode ${dayIdx + 1}`,
        dayName: arc.dayName,
        dailyEmotion: `${arc.dayName} Arc: ${arc.dailyEmotion}`,
        variations,
        selectedVariationId: variations[0]?.id,
        dailyPhotoPosts: dailyPhotos,
      };
    });

    const effectiveCast =
      Array.isArray(parsedData.cast) && parsedData.cast.length > 0
        ? parsedData.cast
        : spec.cast;

    const finalSpec: StorySpec = {
      ...spec,
      seriesTitle: resolveSeriesTitle(spec),
      seasonNumber: spec.seasonNumber || 1,
      seasonTitle:
        spec.seasonTitle ||
        SEASON_ESCALATION_LADDER.find((s) => s.seasonNumber === (spec.seasonNumber || 1))?.seasonTitle ||
        'The Local Betrayal',
      cast: effectiveCast,
      castCount: effectiveCast.length || spec.castCount,
    };

    const seriesBible = parsedData.seriesBible || {
      arcOverview: `7-Day Story Arc for ${spec.format.replace('_', ' ').toUpperCase()} in ${spec.visualStyle}. Follows a rising tension progression from initial curiosity to weekend climax.`,
      characterArcs: finalSpec.cast.map((c: any) => ({
        name: c.name,
        weekArc: `${c.name} (${c.role}): Undergoes high-tension dynamic shift across the 7 episodes.`,
      })),
      keyCliffhangers: [
        'Day 1: Inciting betrayal and concealed motives.',
        'Day 3: Mid-week revelation of unexpected alliance.',
        'Day 5: Direct high-stakes confrontation.',
        'Day 7: Final climax setting up future narrative arcs.',
      ],
    };

    const tokenUsage = createTokenReport(
      llmResponse.usage.promptTokens,
      llmResponse.usage.completionTokens,
      llmResponse.model,
      llmResponse.provider
    );

    return {
      id: `batch-${Date.now()}`,
      spec: finalSpec,
      createdAt: new Date().toISOString(),
      days,
      seriesBible,
      tokenUsage,
    };
  } catch (err: any) {
    console.error('AI Generation error:', err);
    throw new Error(err?.message || 'AI Generation failed');
  }
}

