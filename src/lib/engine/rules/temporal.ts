/**
 * Temporal Choreography & Strict Speaker Isolation Engine
 * Enforces second-by-second action timing, shot-reverse-shot cuts,
 * dynamic vocal modulation (sakhti & narmi), multi-character reference image anchoring,
 * and elite Hollywood Director Master Prompts for Google Flow (Veo 2).
 */

import { SecBySecAction } from '@/types';

export interface SpeakerIsolationConfig {
  activeSpeaker: string;
  speakingDialogue: string;
  silentCharacters: string[];
  requiresMidClipCut: boolean;
}

export interface CinematicVeoPromptParams {
  seriesTitle?: string;
  seasonNumber?: number;
  seasonTitle?: string;
  episodeNumber?: number;
  episodeTitle?: string;
  clipIndex: number;
  totalClips: number;
  sceneName: string;
  shotType: string;
  locationAnchor: string;
  activeSpeaker: {
    name: string;
    dnaPrompt: string;
    voiceTone?: string;
  };
  silentCharacters: Array<{
    name: string;
    dnaPrompt: string;
  }>;
  dialogue: string;
  cameraSetup: string;
  lightingTheme: string;
  timeline: SecBySecAction[];
  negativePromptDirectives?: string;
  cliffhangerNote?: string;
  vocalModulation?: string;
}

export function formatSpeakerIsolationPrompt(config: SpeakerIsolationConfig): string {
  const silentDirectives = config.silentCharacters
    .map((name) => `[${name.toUpperCase()}: 100% SILENT, LISTENING REACTION ONLY, LIPS CLOSED]`)
    .join(' ');

  const activeDirective = `[ACTIVE SPEAKER: ${config.activeSpeaker.toUpperCase()}] Speaks: "${config.speakingDialogue}". Clear lip synchronization and natural facial expression.`;

  const cutDirective = config.requiresMidClipCut
    ? `[CAMERA DIRECTIVE]: 0-5s on ${config.activeSpeaker} speaking; at 5.5s quick cut to reaction shot before returning.`
    : `[CAMERA DIRECTIVE]: Camera locked strictly to ${config.activeSpeaker}. No shared two-shot speaking.`;

  return `${activeDirective} ${silentDirectives} ${cutDirective}`;
}

export function generateSecBySecTimeline(
  activeSpeaker: string,
  silentCharacters: string[],
  dialogueLine: string,
  hookAction: string,
  sfxTheme?: string,
  customPose?: string,
  customPause?: string,
  isFinalClip: boolean = false,
  vocalCurve?: string
): SecBySecAction[] {
  const counterpartName = silentCharacters[0] || 'counterpart';

  return [
    {
      timeRange: '0:00 - 0:02',
      visualAction: hookAction || `${activeSpeaker} locks eyes with counterpart across the desk in composed, high-stakes suspense.`,
      cameraMovement: 'Cinematic 50mm slow push-in at eye-level, shallow depth of field f/1.8, 24fps motion blur.',
      characterPose: customPose || 'Shoulders squared, composed forward posture, hands rested on desk, steady piercing eye lock.',
      pauseBeat: customPause || '1.5-second measured dramatic pause; heavy silence, calm breath intake before speech.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'High-contrast chiaroscuro key lighting, moody rim light accentuating jawline.',
      sfxCue: sfxTheme || 'Subtle tension drone, distant room acoustic reverb, sudden silence before dialogue.',
    },
    {
      timeRange: '0:02 - 0:07',
      visualAction: `${activeSpeaker} delivers dialogue with dynamic vocal inflection (sakhti & narmi): "${dialogueLine}".`,
      cameraMovement: 'Locked medium close-up with subtle organic handheld breathing motion.',
      characterPose: 'Slight dynamic head tilt, emphatic hand gesture timed with vocal cadence.',
      pauseBeat: 'Continuous natural speech with realistic micro-pauses between clauses.',
      spokenDialogue: dialogueLine,
      lipSyncDirective: 'Mouth shapes match syllables with high fidelity, realistic jaw opening, natural speech cadence.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'Steady cinematic rim light, crisp eye highlights, no flickering.',
      sfxCue: 'Crisp isolated dialogue audio in English, deep resonant vocal frequency, zero speech overlap.',
    },
    {
      timeRange: '0:07 - 0:09',
      visualAction: silentCharacters.length > 0
        ? `Camera performs a smooth rack-focus drift shifting gaze toward ${counterpartName} [ATTACH REFERENCE IMAGE 2 - ${counterpartName.toUpperCase()}], capturing their rigid listening reaction, lips sealed with steady unwavering eye contact.`
        : `${activeSpeaker} closes lips calmly, maintaining steady, focused analytical eye contact as the statement settles.`,
      cameraMovement: silentCharacters.length > 0
        ? `Smooth rack-focus camera pan drift shifting focus toward ${counterpartName} [ATTACH REFERENCE IMAGE 2].`
        : 'Slow subtle camera drift holding on lingering emotional resonance.',
      characterPose: silentCharacters.length > 0
        ? `${counterpartName} remains composed, rigid posture, silent listening reaction with sealed lips.`
        : 'Composed posture, subtle breath release, unwavering calm eye contact.',
      pauseBeat: '2-second measured standoff beat; speech ceases, lips sealed completely.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'Gradual shadow emphasis deepening across background.',
      sfxCue: 'Subtle tension drone, low-frequency atmospheric hum, lingering acoustic resonance.',
    },
    isFinalClip
      ? {
          timeRange: '0:09 - 0:10',
          visualAction: 'Dramatic micro-expression or sudden quiet revelation leading into immediate episode cliffhanger cut.',
          cameraMovement: 'Sudden slow punch-in before abrupt black cut at 0:09.5s.',
          characterPose: 'Micro-reaction of realization or quiet defiance.',
          pauseBeat: 'Abrupt audio and visual pause before scene end.',
          silentCharacters: silentCharacters,
          lightingMood: 'High contrast shadow cutoff.',
          sfxCue: 'Sharp cliffhanger riser, abrupt sub-bass drop, sudden clean cut.',
        }
      : {
          timeRange: '0:09 - 0:10',
          visualAction: 'Seamless reaction beat holding unbroken tension into subsequent reverse shot.',
          cameraMovement: 'Subtle drift holding eye-line lock, preparing seamless match-cut to counterpart angle.',
          characterPose: 'Unwavering gaze locked toward counterpart; breath held steady, resolute expression.',
          pauseBeat: 'Continuous cinematic flow (unbroken scene continuity).',
          silentCharacters: silentCharacters,
          lightingMood: 'Consistent atmospheric chiaroscuro lighting across cuts.',
          sfxCue: 'Unbroken room acoustic ambience and continuous low-frequency tension drone.',
        },
  ];
}

/**
 * Universal Sanitizer for Google Flow (Veo 2) Prompts
 * Cleans any toxic or policy-triggering keywords while PRESERVING
 * the elite Hollywood Director Master Prompt architecture.
 */
export function sanitizeForGoogleFlow(rawPrompt: string): string {
  if (!rawPrompt) return '';
  let cleaned = rawPrompt;

  // 1. Remove dangerous tokens that trigger automated classifiers (even when preceded by 'no')
  cleaned = cleaned.replace(/\b(?:blood|gore|weapons|weapon|violence|aggression|tobacco|smoking|murder|hitman)\b/gi, '');

  // 2. Clean trigger words
  cleaned = cleaned.replace(/\bpregnant\b/gi, 'measured');
  cleaned = cleaned.replace(/\bfury\b/gi, 'intensity');
  cleaned = cleaned.replace(/\bthroat resonance\b/gi, 'vocal resonance');

  // 3. Clean up double commas or empty directive fragments caused by word removals
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/no\s*,/gi, '');
  cleaned = cleaned.replace(/no\s*\./gi, '');

  return cleaned.trim();
}

/**
 * Builds the elite, director-level Google Flow (Veo 2) Master Video Directive
 * featuring:
 * 1. Second-by-Second Cinematic Timeline
 * 2. Dynamic Vocal Modulation (Sakhti & Narmi: quiet calm restraint into steely authority)
 * 3. Multi-Character Reference Image Anchoring for Camera Shifts & Rack-Focus
 * 4. 100% Policy-Safe Directives (Zero Banned Tokens)
 */
export function buildCinematicFlowVeoPrompt(params: CinematicVeoPromptParams): string {
  const silentFormatted = params.silentCharacters.length > 0
    ? params.silentCharacters
        .map(
          (s, idx) =>
            `• Counterpart Subject: Original fictional character ${s.name} [ATTACH REFERENCE IMAGE ${idx + 2} - ${s.name.toUpperCase()}]. ${s.dnaPrompt} [100% SILENT, LISTENING REACTION ONLY, LIPS SEALED, EYE CONTACT LOCKED ACROSS DESK]`
        )
        .join('\n')
    : '• Inactive Subjects: 100% silent, listening reactions only, no speech.';

  const defaultModulation =
    params.activeSpeaker.voiceTone && params.activeSpeaker.voiceTone.includes('baritone')
      ? 'Delivery begins with calm, quiet restraint (narmi), gradually hardening into a sharp, steely edge of legal authority (sakhti), dropping to a cold whisper on the final name.'
      : 'Voice begins with an icy, composed calm (narmi), shifting into an unflinching, steely cadence of executive certainty (sakhti) without raising volume.';

  const vocalModulation = params.vocalModulation || defaultModulation;

  const timelineFormatted = params.timeline
    .map((step) => {
      let block = `• [${step.timeRange}]:\n`;
      block += `  - Camera: ${step.cameraMovement}\n`;
      if (step.characterPose) {
        block += `  - Pose & Action: ${step.characterPose}\n`;
      }
      if (step.pauseBeat) {
        block += `  - Pause & Beat: ${step.pauseBeat}\n`;
      }
      if (step.spokenDialogue) {
        block += `  - Spoken Line: "${step.spokenDialogue}"\n`;
        block += `  - Lip-Sync Articulation: ${step.lipSyncDirective || 'Synchronized mouth movement matching every syllable'}\n`;
      }
      if (step.sfxCue) {
        block += `  - Audio / SFX: ${step.sfxCue}\n`;
      }
      return block;
    })
    .join('\n');

  const safeNegativeDirectives =
    'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter, plastic skin, distorted anatomy.';

  const seriesHeader = params.seriesTitle
    ? `[SERIES: "${params.seriesTitle.toUpperCase()}"] | [SEASON ${params.seasonNumber || 1}: "${(params.seasonTitle || 'THE LOCAL BETRAYAL').toUpperCase()}"] | [EPISODE ${params.episodeNumber || 1}: "${(params.episodeTitle || 'PILOT').toUpperCase()}"]\n`
    : '';

  return `${seriesHeader}[CLIP ${params.clipIndex}/${params.totalClips} - GOOGLE FLOW VEO MASTER DIRECTIVE]
[CINEMATIC SPEC]: 9:16 vertical composition (Shorts/Reels/TikTok), 24fps motion blur, 4K Hollywood Noir composition.
[LOCATION MASTER ANCHOR]: ${params.locationAnchor}. Locked spatial coordinates and architectural depth.

[CHARACTER REFERENCE ANCHORS & SPATIAL BLOCKING]:
• Primary Subject: Original fictional character ${params.activeSpeaker.name} [ATTACH REFERENCE IMAGE 1 - ${params.activeSpeaker.name.toUpperCase()}]. ${params.activeSpeaker.dnaPrompt} [SHARP FOCUS, LOCKED BLOCKING]
${silentFormatted}

[VOCAL CADENCE & DYNAMIC TONAL INFLECTION (SAKHTI & NARMI)]:
• Dynamic Modulation: ${vocalModulation}
• Spoken Line: "${params.dialogue}"
• Lip-Sync Directive: Realistic mouth lip-synchronization. Lips, jaw, and facial muscles move naturally matching each spoken word. Natural breath intake before speech. Lips seal completely after line ends.

[SHOT & CAMERA]: ${params.shotType}. ${params.cameraSetup}

[SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
${timelineFormatted}

[LIGHTING & ATMOSPHERE]: ${params.lightingTheme}
${params.cliffhangerNote ? `[CLIFFHANGER NOTE]: ${params.cliffhangerNote}\n` : '[TRANSITION NOTE]: Seamless match-cut to subsequent reverse shot. No black cut. Continuous ambient room acoustic drone.\n'}[AUDIO & FOLEY SOUND DESIGN]: Crisp isolated dialogue audio in English, room acoustics, low tension drone, zero speech overlap.
[NEGATIVE DIRECTIVES]: ${safeNegativeDirectives}`;
}
