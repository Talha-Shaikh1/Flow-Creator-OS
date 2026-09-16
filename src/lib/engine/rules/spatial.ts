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

export function generateCharacterDNAPrompt(
  name: string,
  role: string,
  visualStyle: string
): string {
  return `[CHARACTER DNA LOCK - ${name.toUpperCase()}]: Role: ${role}. Visual Style: ${visualStyle}. Fixed biometric identifiers, distinct facial bone structure, signature wardrobe texture, consistent hairstyle and color grading. Consistent character rendering across all angles.`;
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
