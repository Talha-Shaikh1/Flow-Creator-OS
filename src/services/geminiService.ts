import { CreatorProfile, WeeklyPlan, VaultItem, PerformanceLog } from '../types';

export const geminiService = {
  async generateWeeklyPlanWithGemini(
    apiKey: string,
    profile: CreatorProfile,
    vaultItems: VaultItem[],
    performanceLogs: PerformanceLog[]
  ): Promise<WeeklyPlan> {
    const pastTopics = vaultItems.slice(0, 20).map((v) => `"${v.topic}" (${v.angle})`).join(', ');
    
    // Learning Flywheel: Extract historical learnings from past 24h feedback
    const viralLearnings = performanceLogs
      .filter((l) => l.result === 'viral')
      .slice(0, 5)
      .map((l) => `Viral Winner: "${l.videoTitle}" -> Key Reason: ${l.keyLearnings || l.diagnostic?.aiGrowthRecommendation}`)
      .join('; ');

    const flopLearnings = performanceLogs
      .filter((l) => l.result === 'flop')
      .slice(0, 5)
      .map((l) => `Drop-off Flop: "${l.videoTitle}" -> Avoid: ${l.diagnostic?.dropOffDiagnosis} (${l.keyLearnings})`)
      .join('; ');

    const isDesi = profile.language === 'roman_urdu_hindi';
    const is60s = profile.videoDuration === '60s';
    const sceneCount = is60s ? 6 : 3;

    const systemPrompt = `
You are the world's most elite AI Video Director, Hollywood Cinematographer, and Viral Algorithm Engineer specializing in Google Flow (Veo), Kling, and short-form video retention.

MULTI-STAGE LOOP ENGINEERING INSTRUCTIONS:
1. STAGE 1 (Viral Psychology & Hook Ideation): Formulate 7 psychologically addictive daily angles avoiding past topics.
2. STAGE 2 (Cinematic Micro-Directing): For every 10-second scene, direct exact photorealistic lighting (volumetric, rim, bokeh), camera lenses (24fps anamorphic), exact micro-expressions (eyebrow micro-twitches, deadpan smirks), body language, and locked eye-contact retention cues.
3. STAGE 3 (Retention & Dialogue Pacing Self-Critique): Ensure spoken dialogues are timed precisely for 10-second clips (under 22 words per scene) so Google Flow's native audio engine delivers crisp, non-rushed speech.

CREATOR DNA & FORMAT:
- Name: ${profile.name}
- Archetype: ${profile.archetype} (${profile.archetype === 'talking_object' ? `Object: ${profile.objectName || 'Coffee Mug'}, Metaphor: ${profile.objectMetaphor || 'Corporate Burnout'}` : 'Human Influencer / Faceless Niche'})
- Language / Slang: ${isDesi ? 'Roman Urdu / Hindi (Desi viral relatable slang)' : 'English (Global US/UK viral slang)'}
- Video Format Mode: ${profile.videoFormatMode === 'podcast_fixed' ? 'FIXED 1-MASTER FRAME (Podcast style, reuse master frame for all clips)' : 'CINEMATIC MULTI-SCENE (Transitions between dynamic angles)'}
- Duration: ${profile.videoDuration || '30s'} (${sceneCount} scenes of 10s each)
- Aspect Ratio: ${profile.aspectRatio}
- Reference Image Mode: ${profile.hasReferenceImage ? 'User will upload their saved master character image as First Frame in Google Flow' : 'Generate new 8k Master Keyframe prompt'}
- Character DNA: ${profile.characterDna}
- Niche & Topic: ${profile.niche}

AUTONOMOUS LEARNING FLYWHEEL (FROM 24H CREATOR FEEDBACK):
- Winning Patterns to Double Down On: [${viralLearnings || 'None yet - establish high-baseline'}]
- Drop-Off Mistakes to Avoid: [${flopLearnings || 'None yet - keep hook within first 2.5s'}]
- Past Locked Topics (DO NOT REPEAT): [${pastTopics || 'None yet'}]

OUTPUT RULES:
- Return ONLY valid raw JSON matching the required schema.
- For each day, provide:
  - masterKeyframePrompt: 8k photorealistic starting image prompt.
  - ${sceneCount} Scenes of 10s each with visualPrompt, facialExpression, bodyLanguage, eyeContactCue, dialogue (<22 words), and 3 alternateHooks for Scene 1.
  - bgmPrompt: Audio mood prompt.
  - platformMetadata: Tailored captions and hashtags for Instagram, TikTok, YouTube Shorts.
`;

    const schemaExample = `{
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Monday",
      "title": "Topic title",
      "angleArchetype": "Shock & Curiosity",
      "viralScore": 97,
      "targetEmotion": "Maximize 3s Hook Retention",
      "videoFormatMode": "${profile.videoFormatMode}",
      "masterKeyframePrompt": "Hyper-realistic 9:16 macro shot of ${profile.characterDna}...",
      "bgmPrompt": "Lo-fi synth bass at 85 BPM...",
      "scenes": [
        {
          "sceneNumber": 1,
          "duration": "0-10s",
          "phase": "Hook (0-10s)",
          "visualPrompt": "Macro 8k shot with volumetric lighting...",
          "facialExpression": "Exhausted deadpan micro-frown with eyebrow twitch...",
          "bodyLanguage": "Subtle forward lean on desk...",
          "eyeContactCue": "Piercing unblinking direct eye contact into camera for 3.5s...",
          "actingDirection": "Stares straight into camera lens...",
          "dialogue": "Exact spoken line under 20 words.",
          "alternateHooks": [
            "Hook option 1",
            "Hook option 2",
            "Hook option 3"
          ],
          "cameraMotion": "Slow 24fps push-in zoom",
          "lightingAndMood": "Warm amber lamp glow"
        }
      ],
      "platformMetadata": {
        "instagram": {
          "hookCaption": "Caption hook",
          "bodyCaption": "Full body caption",
          "hashtags": ["#tag1", "#tag2"],
          "callToAction": "Drop a comment 👇"
        },
        "tiktok": {
          "textOverlayHook": "OVERLAY HOOK TEXT",
          "caption": "TikTok caption #tags",
          "seoKeywords": ["keyword 1", "keyword 2"],
          "audioVibe": "Trending audio vibe"
        },
        "youtubeShorts": {
          "title": "Shorts Title #shorts",
          "description": "Shorts description",
          "tags": ["shorts", "tag1"],
          "pinnedComment": "Comment prompt"
        },
        "threads": { "threadPost": "Thread post" },
        "pinterest": { "pinTitle": "Pin title", "pinDescription": "Pin desc", "suggestedBoard": "Board", "keywords": ["kw"] },
        "facebook": { "storyCaption": "FB story" }
      }
    }
  ]
}`;

    const fullPrompt = `${systemPrompt}\n\nSchema Example:\n${schemaExample}\n\nGenerate the complete 7-Day JSON Plan now:`;

    // Cascade list of modern models
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Empty response from Gemini');

        const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        return {
          id: `plan_${Date.now()}`,
          profileId: profile.id,
          profileName: profile.name,
          archetype: profile.archetype,
          contentType: profile.contentType,
          videoFormatMode: profile.videoFormatMode,
          videoDuration: profile.videoDuration || '30s',
          language: profile.language || 'english_global',
          hasReferenceImage: profile.hasReferenceImage,
          niche: profile.niche,
          createdAt: Date.now(),
          days: parsed.days || [],
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed, attempting next in cascade:`, err.message);
      }
    }

    throw new Error(`Gemini generation failed: ${lastError?.message || 'All models exhausted'}`);
  },
};
