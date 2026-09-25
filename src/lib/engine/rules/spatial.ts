/**
 * Spatial Geometry & Master Frame Anchor Engine
 * Enforces visual consistency, scene-based lighting locks, character DNA preservation,
 * and deliberate spatial blocking (screen-left / screen-right).
 */

export interface SpatialAnchorRule {
  locationName: string;
  lightingSetup: string;
  cameraPerspective: string;
  environmentalDetails: string;
}

export function generateLocationAnchorPrompt(
  locationName: string,
  visualStyle: string,
  tone: string
): string {
  return `[LOCATION MASTER FRAME ANCHOR]: ${locationName}. Visual Style: ${visualStyle}. Atmosphere/Tone: ${tone}. Establish fixed spatial coordinates, architectural depth, natural/practical lighting sources, and 4K photorealistic cinematic framing. Camera locked to eye-level wide establishing angle.`;
}

/**
 * Generates 100% human-free Clean Location Plate Prompts for Start-Frame Pinning in Gemini Omni Flash 1.1 / Google Flow.
 */
export function generateCleanLocationPlatePrompt(
  locationName: string,
  visualStyle: string,
  lightingTheme: string,
  sceneNumber: 1 | 2 | 3
): string {
  return `Architectural wide establishing plate of ${locationName}. Completely empty environment with ZERO HUMANS, NO PEOPLE, NO SUBJECTS. ${lightingTheme}. Volumetric atmospheric depth, pristine realistic textures, 35mm cinematic lens, hyper-realistic 4K composition. Ideal pristine clean background plate for video start-frame anchor pinning.`;
}

export function generateCharacterDNAPrompt(
  name: string,
  role: string,
  visualStyle: string
): string {
  return `[CHARACTER DNA LOCK - ${name.toUpperCase()}]: Role: ${role}. Visual Style: ${visualStyle}. Fixed biometric identifiers, distinct facial bone structure, signature wardrobe texture, consistent hairstyle and color grading. Consistent character rendering across all angles.`;
}

/**
 * 180-Degree Hollywood Cinema Rule Eyeline Match Engine.
 * Guarantees that when Speaker A looks Screen-Right, Speaker B in the reverse shot looks Screen-Left.
 */
export function enforceEyelineBlocking(
  speakerName: string,
  eyeline: 'screen-left' | 'screen-right' | 'center-forward',
  counterpartName?: string
): {
  blockingText: string;
  facingDirective: string;
  counterpartFacingDirective: string;
  mutualGazeDirective: string;
} {
  const counterpart = counterpartName || 'counterpart';
  if (eyeline === 'screen-right') {
    return {
      facingDirective: `Positioned at screen-left, head and torso angled 3/4 towards screen-right, eyes locked DIRECTLY onto ${counterpart}'s face across the space. Addressing ${counterpart} directly with intense eye contact. Strictly zero looking into the camera lens, zero looking off-frame.`,
      counterpartFacingDirective: `Positioned opposite at screen-right, head and torso angled 3/4 towards screen-left, eyes locked DIRECTLY back into ${speakerName}'s eyes across the space. Rigid listening reaction, unbroken eye contact, lips sealed. Zero camera gaze, zero wandering eyes.`,
      mutualGazeDirective: `[MUTUAL 180-DEGREE CONVERSATIONAL EYE-CONTACT LOCK]: ${speakerName} (screen-left) and ${counterpart} (screen-right) are face-to-face across the space. ${speakerName} speaks directly TO ${counterpart}; ${counterpart}'s undivided attention is locked onto ${speakerName}. Neither character looks at the camera or glances away into empty space.`,
      blockingText: `[SPATIAL & EYELINE MATCH]: ${speakerName} framed at screen-left looking directly screen-right into ${counterpart}'s eyes; ${counterpart} framed at screen-right looking directly screen-left into ${speakerName}'s eyes. Direct 180-degree cinema eyeline axis maintained.`,
    };
  }
  if (eyeline === 'screen-left') {
    return {
      facingDirective: `Positioned at screen-right, head and torso angled 3/4 towards screen-left, eyes locked DIRECTLY onto ${counterpart}'s face across the space. Addressing ${counterpart} directly with intense eye contact. Strictly zero looking into the camera lens, zero looking off-frame.`,
      counterpartFacingDirective: `Positioned opposite at screen-left, head and torso angled 3/4 towards screen-right, eyes locked DIRECTLY back into ${speakerName}'s eyes across the space. Rigid listening reaction, unbroken eye contact, lips sealed. Zero camera gaze, zero wandering eyes.`,
      mutualGazeDirective: `[MUTUAL 180-DEGREE CONVERSATIONAL EYE-CONTACT LOCK]: ${speakerName} (screen-right) and ${counterpart} (screen-left) are face-to-face across the space. ${speakerName} speaks directly TO ${counterpart}; ${counterpart}'s undivided attention is locked onto ${speakerName}. Neither character looks at the camera or glances away into empty space.`,
      blockingText: `[SPATIAL & EYELINE MATCH]: ${speakerName} framed at screen-right looking directly screen-left into ${counterpart}'s eyes; ${counterpart} framed at screen-left looking directly screen-right into ${speakerName}'s eyes. Direct 180-degree cinema eyeline axis maintained.`,
    };
  }
  return {
    facingDirective: `Positioned center-frame, head and eyes focused directly forward on ${counterpart} standing directly in front across the space. Intensely locked conversational eye contact. Zero camera gaze, zero wandering eyes.`,
    counterpartFacingDirective: `Positioned opposite in frame depth, eyes focused directly on ${speakerName} with unbroken listening focus. Zero camera gaze.`,
    mutualGazeDirective: `[DIRECT TWO-PERSON EYE-CONTACT LOCK]: ${speakerName} and ${counterpart} maintain direct eye-to-eye conversational contact across the space. Zero wandering gaze.`,
    blockingText: `[SPATIAL BLOCKING]: ${speakerName} maintaining intense eye-to-eye dramatic tension with ${counterpart}.`,
  };
}

export function enforceSpatialBlocking(
  primarySpeaker: string,
  otherCharacters: string[]
): string {
  if (otherCharacters.length === 0) {
    return `[SPATIAL BLOCKING]: ${primarySpeaker} centered in frame with shallow depth-of-field background.`;
  }
  const secondary = otherCharacters[0];
  return `[SPATIAL BLOCKING]: ${primarySpeaker} framed at screen-right (medium close-up focus); ${secondary} positioned screen-left in soft background focus (facing ${primarySpeaker}).`;
}
