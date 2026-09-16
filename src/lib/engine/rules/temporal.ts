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
  customPause?: string
): SecBySecAction[] {
  return [
    {
      timeRange: '0:00 - 0:02',
      visualAction: hookAction || `${activeSpeaker} locks eyes with camera/counterpart in intense confrontation.`,
      cameraMovement: 'Cinematic 50mm slow push-in at eye-level, shallow depth of field f/1.8, 24fps motion blur.',
      characterPose: customPose || 'Shoulders squared, tense forward posture, hands gripped firmly, calculated eye lock.',
      pauseBeat: customPause || '1.5-second pregnant dramatic pause; heavy silence, sharp breath intake before speech.',
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
      lipSyncDirective: 'Mouth shapes match syllables with high fidelity, realistic jaw opening, visible throat resonance.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'Steady cinematic rim light, crisp eye highlights, no flickering.',
      sfxCue: 'Crisp isolated dialogue audio in English, deep resonant vocal frequency, zero speech overlap.',
    },
    {
      timeRange: '0:07 - 0:09',
      visualAction: `${activeSpeaker} closes lips firmly, holding fierce unblinking gaze as line sinks in.`,
      cameraMovement: 'Slow subtle camera drift holding on lingering emotional resonance.',
      characterPose: 'Jaw set firm, slight exhaled breath, unwavering eye contact.',
      pauseBeat: '2-second heavy standoff beat; speech ceases, lips sealed completely.',
      activeSpeaker: activeSpeaker,
      silentCharacters: silentCharacters,
      lightingMood: 'Gradual shadow emphasis deepening across background.',
      sfxCue: 'Heavy silence, faint ominous sub-bass pulse, lingering acoustic resonance.',
    },
    {
      timeRange: '0:09 - 0:10',
      visualAction: 'Dramatic micro-expression or sudden motion leading into immediate cliffhanger cut.',
      cameraMovement: 'Sudden punch-in or rapid Dutch tilt transition before abrupt black cut.',
      characterPose: 'Micro-reaction of defiance or realization.',
      pauseBeat: 'Sudden audio and visual freeze before clip transition.',
      silentCharacters: silentCharacters,
      lightingMood: 'High contrast shadow cutoff.',
      sfxCue: 'Sharp cliffhanger riser, abrupt audio drop, black screen cut.',
    },
  ];
}

/**
 * Builds the complete, cinematic Google Flow (Veo) Prompt
 * with embedded spoken dialogue, second-by-second choreography,
 * camera angles, poses, pauses, and lip-sync directives.
 */
export function buildCinematicFlowVeoPrompt(params: CinematicVeoPromptParams): string {
  const silentList = params.silentCharacters.length > 0
    ? params.silentCharacters
        .map((s) => `[${s.name.toUpperCase()}: 100% SILENT, LISTENING REACTION ONLY, LIPS SEALED, BACK TO CAMERA / SOFT FOCUS]`)
        .join(' ')
    : '[ALL OTHER SUBJECTS: 100% SILENT, NO SPEECH]';

  const voiceProfile = params.activeSpeaker.voiceTone || 'Clear resonant cinematic voice, controlled emotional intensity';

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

  return `[CLIP ${params.clipIndex}/${params.totalClips} - GOOGLE FLOW VEO DIRECTIVE]
[CINEMATIC SPEC]: 9:16 vertical composition (Shorts/Reels/TikTok), 24fps motion blur, 4K film composition.
[LOCATION MASTER ANCHOR]: ${params.locationAnchor}. Locked spatial coordinates and architectural depth.

[ACTIVE CHARACTER]: ${params.activeSpeaker.name} - ${params.activeSpeaker.dnaPrompt} [SHARP FOCUS, LOCKED BLOCKING]
[SILENT CHARACTERS]: ${silentList}

[AUDIO & SPOKEN DIALOGUE]:
- Active Voice: ${params.activeSpeaker.name} speaks aloud in English (${voiceProfile}).
- Spoken Line: "${params.dialogue}"
- Lip-Sync Directive: Realistic mouth lip-synchronization. Lips, jaw, and throat move naturally matching each spoken word. Natural breath intake before speech. Lips seal completely after line ends.

[SHOT & CAMERA]: ${params.shotType}. ${params.cameraSetup}

[SECOND-BY-SECOND CINEMATIC CHOREOGRAPHY (10s)]:
${timelineFormatted}

[LIGHTING & ATMOSPHERE]: ${params.lightingTheme}
${params.cliffhangerNote ? `[CLIFFHANGER NOTE]: ${params.cliffhangerNote}\n` : ''}${params.negativePromptDirectives ? `[NEGATIVE DIRECTIVES]: ${params.negativePromptDirectives}` : ''}`;
}
