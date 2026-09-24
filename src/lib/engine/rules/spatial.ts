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
): { blockingText: string; facingDirective: string } {
  if (eyeline === 'screen-right') {
    return {
      facingDirective: `Facing 3/4 right, eyeline strictly locked 15 degrees towards screen-right at off-camera ${counterpartName || 'listener'}`,
      blockingText: `[SPATIAL & EYELINE MATCH]: ${speakerName} framed medium close-up, angled 3/4 towards screen-right. Eyeline is rigidly locked off-axis towards screen-right, establishing direct conversational eye contact with counterpart in reverse shot. No looking towards camera.`,
    };
  }
  if (eyeline === 'screen-left') {
    return {
      facingDirective: `Facing 3/4 left, eyeline strictly locked 15 degrees towards screen-left at off-camera ${counterpartName || 'speaker'}`,
      blockingText: `[SPATIAL & EYELINE MATCH]: ${speakerName} framed reverse medium close-up, angled 3/4 towards screen-left. Eyeline is rigidly locked off-axis towards screen-left, matching the 180-degree cinema eyeline axis. Direct eye contact maintained across the cut.`,
    };
  }
  return {
    facingDirective: 'Centered, looking intently ahead with steady forward focus',
    blockingText: `[SPATIAL BLOCKING]: ${speakerName} centered in frame with shallow depth-of-field background, maintaining steady dramatic tension.`,
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
