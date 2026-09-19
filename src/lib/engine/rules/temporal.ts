/**
 * Temporal Choreography & Strict Speaker Isolation Engine
 * Enforces second-by-second action timing, shot-reverse-shot cuts,
 * explicit silence tags, and embedded spoken dialogue with lip-sync.
 */

import { SecBySecAction } from '@/types';

export interface SpeakerIsolationConfig {
  activeSpeaker: string;
  speakingDialogue: string;
  silentCharacters: string[];
  requiresMidClipCut: boolean;
}

export interface CinematicVeoPromptParams {
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
  isFinalClip: boolean = false
): SecBySecAction[] {
  return [
    {
      timeRange: '0:00 - 0:02',
      visualAction: hookAction || `${activeSpeaker} locks eyes with camera/counterpart in focused composure.`,
      cameraMovement: 'Cinematic 50mm slow push-in at eye-level, shallow depth of field f/1.8, 24fps motion blur.',
      characterPose: customPose || 'Shoulders squared, composed forward posture, hands rested on desk, steady eye lock.',
      pauseBeat: customPause || '1.5-second measured dramatic pause; heavy silence, calm breath intake before speech.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'High-contrast chiaroscuro key lighting, moody rim light accentuating jawline.',
      sfxCue: sfxTheme || 'Subtle tension drone, distant room acoustic reverb, sudden silence before dialogue.',
    },
    {
      timeRange: '0:02 - 0:07',
      visualAction: `${activeSpeaker} articulates dialogue aloud with precise lip-sync: "${dialogueLine}".`,
      cameraMovement: 'Locked medium close-up with subtle organic handheld breathing motion.',
      characterPose: 'Slight dynamic head tilt, emphatic hand or shoulder gesture timed with vocal cadence.',
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
      visualAction: `${activeSpeaker} closes lips calmly, maintaining steady, focused analytical eye contact as the statement settles.`,
      cameraMovement: 'Slow subtle camera drift holding on lingering emotional resonance.',
      characterPose: 'Composed posture, subtle breath release, unwavering calm eye contact.',
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
 * Ensures 100% Policy Compliance:
 * 1. Strips any [NEGATIVE DIRECTIVES] block containing forbidden words (blood, weapons, violence, etc.)
 * 2. Neutralizes trigger words (pregnant -> measured, fury -> intensity, etc.)
 * 3. Converts bracketed meta-spec formats into pure, natural cinematic prose that Veo 2 processes flawlessly.
 */
export function sanitizeForGoogleFlow(rawPrompt: string): string {
  if (!rawPrompt) return '';
  let cleaned = rawPrompt;

  // 1. Strip any legacy negative directives block that may contain forbidden words
  cleaned = cleaned.replace(/\[NEGATIVE DIRECTIVES\]:[\s\S]*$/gi, '');
  cleaned = cleaned.replace(/NEGATIVE DIRECTIVES:[\s\S]*$/gi, '');

  // 2. Remove problematic trigger words if present
  cleaned = cleaned.replace(/\bpregnant\b/gi, 'measured');
  cleaned = cleaned.replace(/\bfury\b/gi, 'intensity');
  cleaned = cleaned.replace(/\bthroat resonance\b/gi, 'vocal resonance');

  // 3. If it has legacy markdown bracket tags [CLIP 1/3 ...], convert into pure Google Flow Veo 2 prose
  if (
    cleaned.includes('[CLIP') ||
    cleaned.includes('[ACTIVE SUBJECT]') ||
    cleaned.includes('[AUDIO & SPOKEN DIALOGUE]')
  ) {
    const speakerMatch = cleaned.match(/\[ACTIVE SUBJECT\]:\s*(?:Original fictional character\s*)?([^\(\n\-\]]+)/i);
    const speaker = speakerMatch ? speakerMatch[1].trim() : 'The character';

    const locationMatch = cleaned.match(/\[LOCATION MASTER ANCHOR\]:\s*([^\.\n\]]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Penthouse Study at Night';

    const dialogueMatch = cleaned.match(/Spoken Line:\s*"([^"]+)"/i) || cleaned.match(/\[DIALOGUE\]:\s*"([^"]+)"/i);
    const dialogue = dialogueMatch ? dialogueMatch[1].trim() : '';

    const shotMatch = cleaned.match(/\[SHOT & CAMERA\]:\s*([^\.\n]+(?:\.[^\.\n]+)?)/i);
    const shot = shotMatch ? shotMatch[1].trim() : 'Shot-Reverse-Shot Close-Up, 85mm cinematic lens';

    const lightingMatch = cleaned.match(/\[LIGHTING & ATMOSPHERE\]:\s*([^\.\n\]]+(?:\.[^\.\n\]]+)?)/i);
    const lighting = lightingMatch ? lightingMatch[1].trim() : 'Moody chiaroscuro cinema lighting, deep shadows';

    let naturalPrompt = `Cinematic 9:16 vertical video of original fictional character ${speaker} in ${location}. ${shot}, slow smooth push-in with 24fps motion blur. ${speaker} maintains calm, composed focus.`;
    if (dialogue) {
      naturalPrompt += ` Speaking aloud with natural articulation: "${dialogue}". Realistic mouth lip-synchronization matching each spoken word, natural facial expressions and subtle breathing cadence.`;
    }
    naturalPrompt += ` ${lighting}, photorealistic 8K film quality, continuous fluid motion.`;
    return naturalPrompt.trim();
  }

  return cleaned.trim();
}

/**
 * Builds the complete, cinematic Google Flow (Veo) Prompt
 * in pure, high-potency natural prose that generates directly without safety policy rejection.
 */
export function buildCinematicFlowVeoPrompt(params: CinematicVeoPromptParams): string {
  const speakerName = params.activeSpeaker.name;
  const dialogueClean = params.dialogue.replace(/"/g, "'");
  const camera = params.cameraSetup || `${params.shotType}, slow smooth push-in with 24fps motion blur`;
  const lighting = params.lightingTheme || 'Moody chiaroscuro cinema lighting, deep shadows, warm mahogany reflections';

  return `Cinematic 9:16 vertical video of original fictional character ${speakerName} in ${params.locationAnchor}. ${params.shotType}. ${camera}. ${speakerName} maintains calm, composed focus. Speaking aloud with natural articulation: "${dialogueClean}". Precise realistic mouth lip-synchronization matching each spoken word, natural facial expressions, and subtle breathing cadence. ${lighting}, photorealistic 8K film quality, 24fps motion blur, continuous fluid motion.`;
}
