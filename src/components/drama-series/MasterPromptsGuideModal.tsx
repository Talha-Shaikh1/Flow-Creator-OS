'use client';

import React, { useState, useMemo } from 'react';
import {
  Film,
  X,
  Sparkles,
  CheckCircle2,
  Copy,
  Download,
  BookOpen,
  Camera,
  Tv,
  Users,
  Search,
  Check,
  ChevronRight,
  Lightbulb,
  Workflow,
  ArrowRight,
  ShieldCheck,
  Info,
  Flame,
  Layers,
} from 'lucide-react';
import {
  CharacterBible,
  CharacterBibleItem,
  FramePromptItem,
  VideoPromptItem,
  TenSecClipDef,
  SeasonStory,
  DirectorQAPackage,
} from '@/types/drama-series';

export interface MasterPromptsGuideProps {
  isOpen: boolean;
  onClose: () => void;
  seasonStory: SeasonStory | null;
  characterBible: CharacterBible | null;
  clipsBreakdown: TenSecClipDef[] | null;
  framePrompts: FramePromptItem[] | null;
  videoPrompts: VideoPromptItem[] | null;
  directorQA: DirectorQAPackage | null;
  targetRuntime: '60s' | '90s' | '120s';
  aspectRatio: '16:9' | '9:16';
}

/**
 * Builds photorealistic 85mm Character DNA Prompt for Midjourney / Flux / Google Flow face locking.
 */
export function buildCharacterAnchorPrompt(
  character: CharacterBibleItem,
  aspectRatio: '16:9' | '9:16' = '16:9',
  worldSetting?: string
): { prompt: string; negativePrompt: string } {
  const outfit =
    typeof character.clothing === 'string'
      ? character.clothing
      : character.clothing?.exactOutfit || 'Cinematic signature tailored attire';

  const accessories =
    typeof character.clothing === 'object' && character.clothing?.accessories
      ? `, accessories: ${character.clothing.accessories}`
      : '';

  const facialStructure =
    typeof character.physicalAppearance === 'object'
      ? `${character.physicalAppearance?.faceStructure || ''}, ${
          character.physicalAppearance?.distinctiveFeatures || ''
        }`.trim()
      : '';

  const morphology =
    typeof character.morphologySpec === 'object'
      ? `${character.morphologySpec?.eyeType ? `eyes: ${character.morphologySpec.eyeType}` : ''}, ${
          character.morphologySpec?.distinctiveFeatures || ''
        }`.trim()
      : '';

  const expression =
    typeof character.acting === 'object'
      ? character.acting?.normalExpression || 'calm, calculating gaze'
      : 'intense, focused cinematic gaze';

  const setting = worldSetting
    ? `in the ambiance of ${worldSetting}`
    : 'cinematic studio backdrop with subtle environmental depth';

  const prompt = `Photorealistic 85mm medium close-up portrait of ${character.name}, ${
    character.speciesObject || character.roleInStory || 'Character'
  }, ${character.ageAppearance || 'adult'}. ${
    facialStructure ? `Facial details: ${facialStructure}. ` : ''
  }${
    morphology ? `Biometric features: ${morphology}. ` : ''
  }Signature expression: ${expression}, direct eye-level gaze. Signature wardrobe: ${outfit}${accessories}. Setting: ${setting}. Award-winning cinematography, soft dramatic key lighting, delicate rim light, volumetric atmospheric haze, hyper-detailed skin pores and realistic texture, 35mm film grain, 8k UHD, masterpiece quality --ar ${aspectRatio} --v 6.1 --style raw`;

  const negativePrompt = `cartoon, anime, 3d animation, CGI render, plastic skin, doll-like, oversaturated, deformed eyes, extra fingers, missing limbs, blur, watermark, low quality, duplicate faces`;

  return { prompt, negativePrompt };
}

export function MasterPromptsGuideModal({
  isOpen,
  onClose,
  seasonStory,
  characterBible,
  clipsBreakdown,
  framePrompts,
  videoPrompts,
  directorQA,
  targetRuntime,
  aspectRatio,
}: MasterPromptsGuideProps) {
  const [activeTab, setActiveTab] = useState<
    'all' | 'characters' | 'frames' | 'videos' | 'guide'
  >('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filmTitle = seasonStory?.seasonTitle || 'Drama Mini-Film';
  const worldSetting = seasonStory?.worldEnvironment || 'Prestige Cinematic Setting';
  const clipsCount =
    clipsBreakdown?.length ||
    (targetRuntime === '120s' ? 12 : targetRuntime === '90s' ? 9 : 6);

  // Extract all characters dynamically from Character Bible + Season Story cast
  const characters: CharacterBibleItem[] = useMemo(() => {
    const list: CharacterBibleItem[] = [...(characterBible?.characters || [])];
    const existingNames = new Set(list.map((c) => c.name.toLowerCase().trim()));

    // Collect all character names from seasonStory
    const storyChars = new Set<string>();
    (seasonStory?.charactersInvolved || []).forEach((c) => storyChars.add(c.trim()));
    (seasonStory?.episodes || []).forEach((ep) => {
      (ep.charactersInvolved || []).forEach((c) => storyChars.add(c.trim()));
    });

    Array.from(storyChars).forEach((name, idx) => {
      if (name && !existingNames.has(name.toLowerCase())) {
        list.push({
          id: `CHAR-0${list.length + 1}`,
          name,
          speciesObject: `${name} — Drama Series Character`,
          ageAppearance: '30s',
          genderPresentation: 'Cinematic Character',
          personality: 'Intense and calculating drama persona with hidden motives',
          roleInStory: idx === 0 ? 'Main Character' : 'Recurring Character',
          morphologySpec: {
            eyeType: 'Expressive dramatic eyes with piercing emotional intensity',
            mouthPlacement: 'Composed jawline with subtle micro-expressions',
            limbPhysics: 'Controlled realistic posture and movements',
            materialTexture: 'Photorealistic human skin texture with visible natural pores',
            distinctiveFeatures: 'Distinctive cinematic bone structure and intense gaze',
          },
          physicalAppearance: {
            headShape: 'Sculpted defined jawline',
            faceStructure: 'Defined cheekbones and striking profile',
            bodyProportions: 'Athletic, elegant posture',
            distinctiveFeatures: 'Realistic cinematic appearance',
          },
          clothing: {
            exactOutfit: 'Tailored luxury dark attire with subtle textured fabric',
            colors: 'Deep neutral palette (charcoal, navy, black)',
            materials: 'Wool, fine cotton, and leather accents',
            accessories: 'Minimalist signature accessory',
            propsNormallyCarried: 'None',
          },
          acting: {
            normalExpression: 'Calculating, watchful gaze',
            happyExpression: 'Subtle knowing smile',
            sadExpression: 'Guarded sorrow, restrained emotion',
            angryExpression: 'Cold controlled intensity',
            comedicExpression: 'Dry sarcastic smirk',
            typicalBodyLanguage: 'Poised, observant, maintaining personal space',
          },
          voice: {
            voiceType: 'Resonant, clear tone',
            ageImpression: '30s',
            accent: 'Neutral prestige accent',
            speakingSpeed: 'Measured (1.0x)',
            emotionalStyle: 'Controlled dramatic intensity',
          },
          continuityRules: [
            'Maintain exact facial features and skin tone',
            'Preserve signature wardrobe and color palette',
          ],
        });
        existingNames.add(name.toLowerCase());
      }
    });

    return list;
  }, [characterBible, seasonStory]);

  // Generate Character DNA Prompts for all characters
  const characterPromptsList = characters.map((c) => ({
    character: c,
    ...buildCharacterAnchorPrompt(c, aspectRatio, worldSetting),
  }));

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compile entire master dossier into Markdown
  const generateMasterMarkdown = () => {
    let md = `# 🎬 ${filmTitle} — Master Production Dossier & Prompts Hub\n\n`;
    md += `**Target Runtime:** ${targetRuntime} (${clipsCount} Clips of 10s)\n`;
    md += `**Aspect Ratio:** ${aspectRatio}\n`;
    md += `**World Environment:** ${worldSetting}\n`;
    md += `**Main Theme / Premise:** ${seasonStory?.mainTheme || seasonStory?.episodes?.[0]?.mainStory || 'N/A'}\n\n`;
    md += `═══════════════════════════════════════════════════════════════\n\n`;

    // 1. CHARACTER DNA PROMPTS
    md += `## 🎭 1. CHARACTER REFERENCE / DNA PROMPTS (Midjourney / Flux / Google Flow)\n`;
    md += `*Use these prompts first to generate reference anchor portraits for each character. Keep these images handy to lock faces and wardrobe!*\n\n`;

    characterPromptsList.forEach((item, idx) => {
      md += `### [CHAR-0${idx + 1}] ${item.character.name} (${item.character.speciesObject || item.character.roleInStory})\n`;
      md += `**Role:** ${item.character.roleInStory}\n`;
      md += `**Personality:** ${item.character.personality}\n`;
      md += `**Prompt:**\n\`\`\`\n${item.prompt}\n\`\`\`\n`;
      md += `**Negative Prompt:**\n\`\`\`\n${item.negativePrompt}\n\`\`\`\n\n`;
    });

    md += `═══════════════════════════════════════════════════════════════\n\n`;

    // 2. SEQUENTIAL PRODUCTION BREAKDOWN (FRAMES + VEO VIDEO PROMPTS)
    md += `## 🎬 2. SEQUENTIAL 10-SECOND CLIPS (STARTING FRAMES + VEO PROMPTS)\n`;
    md += `*Choreographed for 180° Spatial Consistency & Continuous Motion Chaining.*\n\n`;

    for (let i = 0; i < clipsCount; i++) {
      const clipDef = clipsBreakdown?.[i];
      const frame = framePrompts?.[i];
      const video = videoPrompts?.[i];
      const clipNum = i + 1;
      const strategy =
        frame?.frameStrategy ||
        clipDef?.frameReferenceStrategy ||
        (i === 0 ? 'NEW_STARTING_FRAME' : 'USE_PREVIOUS_CLIP_END_FRAME');

      md += `### ────── CLIP ${clipNum} of ${clipsCount} (00:${(i * 10)
        .toString()
        .padStart(2, '0')} - 00:${((i + 1) * 10).toString().padStart(2, '0')}) ──────\n`;
      md += `**Speaker:** ${clipDef?.activeSpeaker || video?.activeSpeaker || 'Speaker'}\n`;
      md += `**Spoken Dialogue:** "${clipDef?.dialogue || video?.dialogueLine || '...'}"\n`;
      md += `**Silent Listener:** ${clipDef?.listenerCharacter || 'Listening counterpart (lips sealed)'}\n`;
      md += `**Continuity Strategy:** ${strategy}\n\n`;

      md += `#### 🖼️ Starting Frame Prompt (Clip ${clipNum}):\n`;
      if (strategy === 'USE_PREVIOUS_CLIP_END_FRAME') {
        md += `> 💡 **CONTINUITY CHAINING NOTE:** Extract the **LAST FRAME** of Clip ${i} and use it as the starting frame for Clip ${clipNum}. Alternatively, if generating fresh:\n`;
      }
      md += `\`\`\`\n${frame?.prompt || 'Frame prompt pending generation'}\n\`\`\`\n\n`;

      md += `#### 🎥 Google Flow / Veo Video Motion Prompt (Clip ${clipNum}):\n`;
      md += `\`\`\`\n${video?.prompt || 'Video prompt pending generation'}\n\`\`\`\n\n`;
    }

    md += `═══════════════════════════════════════════════════════════════\n\n`;

    // 3. COMPLETE WORKFLOW GUIDE
    md += `## 📖 3. COMPLETE GOOGLE FLOW / VEO STEP-BY-STEP WORKFLOW GUIDE\n\n`;
    md += `### Roman Urdu Guide (Asaan Tareeqa):\n`;
    md += `1. **Step 1 - Character Face Lock:** Sab se pehle har character ki reference image banao using Character DNA Prompts. Yeh aap ka Visual Anchor hai taake har clip mein character ka chehra aur kapray 100% same rahen.\n`;
    md += `2. **Step 2 - Clip 1 Frame:** Clip 1 ke liye Starting Frame Prompt Midjourney ya Google Flow mein daal kar pehli frame image banao.\n`;
    md += `3. **Step 3 - Clip 1 Video (Image-to-Video):** Google Flow / Veo mein Image-to-Video mode me jao. Clip 1 ki image upload karo aur Clip 1 ka Video Motion Prompt paste karo. 10 second ki clip generate hogi.\n`;
    md += `4. **Step 4 - 🔑 The Golden Rule (Frame Chaining Secret):** Aglay clips (Clip 2, 3, etc.) ke liye naya image prompt generate krne ki zaroorat nahi agar scene same hai! Clip 1 ki video ka **Aakhri Frame (End Frame)** PNG ke tor par save karo, aur usko Clip 2 ka Starting Frame bana do. Phir Clip 2 ka Video Prompt paste karo. Is se character aur kapray 0.1% bhi change nahi hongy!\n`;
    md += `5. **Step 5 - Dialogue & Lip Sync:** Har 10s clip mein sirf EK banda bolta hai. Doosra character bilkul khamosh (lips sealed) rehta hai.\n`;
    md += `6. **Step 6 - Final Stitching:** CapCut ya Premiere mein saray 10-second clips ko jor lo. Frame Chaining ki wajah se simple cuts bhi bilkul seamless lagenge!\n\n`;

    md += `### English Master Instructions:\n`;
    md += `1. **Character Anchor Setup:** Generate reference portraits for each character using Midjourney/Flux with the Character DNA prompts. Keep them for face-locking.\n`;
    md += `2. **Establish Keyframe 1:** Generate the opening scene image using Clip 1 Frame Prompt.\n`;
    md += `3. **Image-to-Video in Veo:** Upload Clip 1 Starting Frame, paste Clip 1 Video Motion Prompt, and render 10-second video.\n`;
    md += `4. **Continuity Chaining Protocol:** For continuous scenes, extract the last frame of Clip N-1 and use it directly as the start frame for Clip N. This guarantees zero visual drift across the entire 1-2 minute runtime.\n`;
    md += `5. **Timeline Assembly:** Drop clips sequentially into your NLE (Premiere, DaVinci, CapCut). Straight cuts will look completely seamless.\n`;

    return md;
  };

  const handleCopyEverything = () => {
    const md = generateMasterMarkdown();
    handleCopy(md, 'all-master-dossier');
  };

  const handleDownloadMarkdown = () => {
    const md = generateMasterMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filmTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Master_Prompts_Guide.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered lists
  const q = searchQuery.toLowerCase().trim();
  const filteredCharacters = characterPromptsList.filter(
    (item) =>
      !q ||
      item.character.name.toLowerCase().includes(q) ||
      item.character.speciesObject.toLowerCase().includes(q) ||
      item.prompt.toLowerCase().includes(q)
  );

  const filteredClips = useMemo(() => {
    const list = [];
    for (let i = 0; i < clipsCount; i++) {
      const clipDef = clipsBreakdown?.[i];
      const frame = framePrompts?.[i];
      const video = videoPrompts?.[i];
      const clipNum = i + 1;
      const speaker = clipDef?.activeSpeaker || video?.activeSpeaker || `Speaker ${clipNum}`;
      const dialogue = clipDef?.dialogue || video?.dialogueLine || '';
      const prompt = video?.prompt || '';
      const framePrompt = frame?.prompt || '';

      if (
        !q ||
        `clip ${clipNum}`.includes(q) ||
        speaker.toLowerCase().includes(q) ||
        dialogue.toLowerCase().includes(q) ||
        prompt.toLowerCase().includes(q) ||
        framePrompt.toLowerCase().includes(q)
      ) {
        list.push({ clipNum, index: i, clipDef, frame, video, speaker, dialogue });
      }
    }
    return list;
  }, [clipsCount, clipsBreakdown, framePrompts, videoPrompts, q]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Master Prompts Hub & Production Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                  All-In-One Dossier
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {filmTitle} • <span className="text-purple-300">{targetRuntime}</span> ({clipsCount} Clips) • {characters.length} Dynamic Characters • 100% Continuity Chaining
              </p>
            </div>
          </div>

          {/* Quick Universal Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEverything}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 transition"
              title="Copy Complete Dossier (Characters + Frames + Veo Prompts + Guide)"
            >
              {copiedKey === 'all-master-dossier' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied All!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy All Prompts</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download Master Package as Markdown (.md)"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span className="hidden md:inline">Download .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition"
              title="Close Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="px-6 py-3 border-b border-neutral-800/60 bg-neutral-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: '📜 All-In-One Page', badge: `${clipsCount} Clips` },
              { id: 'characters', label: '🎭 Character Prompts', badge: `${characters.length}` },
              { id: 'frames', label: '🖼️ Starting Frames', badge: `${framePrompts?.length || clipsCount}` },
              { id: 'videos', label: '🎥 Veo Video Prompts', badge: `${videoPrompts?.length || clipsCount}` },
              { id: 'guide', label: '📖 Step-by-Step Guide', badge: 'Urdu + Eng' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-sm'
                    : 'bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900 border border-neutral-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-neutral-800/80 text-[10px] text-neutral-300 font-mono">
                  {tab.badge}
                </span>
              </button>
            ))}
          </div>

          {activeTab !== 'guide' && (
            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prompt or speaker..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-1 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          )}
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ALL-IN-ONE DOSSIER VIEW */}
          {activeTab === 'all' && (
            <div className="space-y-8">
              {/* Quick Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-neutral-900/70 to-pink-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Complete Production Package Ready
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Everything in one place: Character Anchors, Starting Keyframes, and 10s Google Flow Prompts.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const text = characterPromptsList
                        .map((c) => `[${c.character.name}]:\n${c.prompt}`)
                        .join('\n\n');
                      handleCopy(text, 'copy-all-chars');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'copy-all-chars' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Cast Prompts
                  </button>
                  <button
                    onClick={() => {
                      const text = (videoPrompts || [])
                        .map((v) => `[Clip ${v.clipNumber} - ${v.activeSpeaker}]:\n${v.prompt}`)
                        .join('\n\n');
                      handleCopy(text, 'copy-all-videos');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-pink-300 border border-pink-500/30 text-xs font-semibold flex items-center gap-1"
                  >
                    {copiedKey === 'copy-all-videos' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy Veo Prompts
                  </button>
                </div>
              </div>

              {/* Section 1: Character Reference Anchors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                      1. Character Reference / DNA Prompts ({characterPromptsList.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Midjourney / Flux / Google Flow 85mm Portraits
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {characterPromptsList.map((item, idx) => (
                    <div
                      key={item.character.id || idx}
                      className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-purple-500/40 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                            {item.character.id || `CHAR-0${idx + 1}`}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {item.character.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mb-2 font-mono line-clamp-1">
                          {item.character.speciesObject || item.character.roleInStory} • {item.character.ageAppearance}
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 font-mono text-[11px] text-neutral-300 leading-relaxed max-h-32 overflow-y-auto mb-2 select-all">
                          {item.prompt}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                        <span className="text-[10px] text-neutral-500 font-mono">--ar {aspectRatio} --v 6.1</span>
                        <button
                          onClick={() => handleCopy(item.prompt, `char-${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 font-semibold transition"
                        >
                          {copiedKey === `char-${idx}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-purple-400" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Sequential Clips Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                      2. Sequential 10-Second Clips & Prompts ({clipsCount} Clips)
                    </h4>
                  </div>
                  <span className="text-[11px] text-neutral-500">
                    Frame Chaining & Camera Motion Prompts
                  </span>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: clipsCount }).map((_, i) => {
                    const clipDef = clipsBreakdown?.[i];
                    const frame = framePrompts?.[i];
                    const video = videoPrompts?.[i];
                    const clipNum = i + 1;
                    const strategy =
                      frame?.frameStrategy ||
                      clipDef?.frameReferenceStrategy ||
                      (i === 0 ? 'NEW_STARTING_FRAME' : 'USE_PREVIOUS_CLIP_END_FRAME');

                    return (
                      <div
                        key={clipNum}
                        className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition"
                      >
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-800/80">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs">
                              {clipNum}
                            </span>
                            <span className="text-xs font-bold text-white">
                              Clip {clipNum} (10s) — {clipDef?.activeSpeaker || video?.activeSpeaker || 'Speaker'}
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              [00:{(i * 10).toString().padStart(2, '0')} - 00:{((i + 1) * 10).toString().padStart(2, '0')}]
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {strategy === 'USE_PREVIOUS_CLIP_END_FRAME' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                                <Workflow className="w-3 h-3 text-emerald-400" />
                                <span>Chaining: Use Clip {i} End Frame</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                                🖼️ Fresh Keyframe
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Spoken Dialogue Line */}
                        {(clipDef?.dialogue || video?.dialogueLine) && (
                          <div className="mb-3 p-2 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center gap-2 font-serif italic">
                            <span className="not-italic font-bold text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">
                              Spoken
                            </span>
                            <span>&ldquo;{clipDef?.dialogue || video?.dialogueLine}&rdquo;</span>
                          </div>
                        )}

                        {/* Prompts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* Frame Prompt */}
                          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                  <Camera className="w-3 h-3 text-purple-400" />
                                  Starting Frame Prompt
                                </span>
                                <button
                                  onClick={() => handleCopy(frame?.prompt || '', `frame-${clipNum}`)}
                                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-semibold"
                                >
                                  {copiedKey === `frame-${clipNum}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>Copy</span>
                                </button>
                              </div>
                              <p className="font-mono text-[11px] text-neutral-300 leading-relaxed select-all">
                                {frame?.prompt || 'Frame prompt pending generation'}
                              </p>
                            </div>
                            {strategy === 'USE_PREVIOUS_CLIP_END_FRAME' && (
                              <div className="mt-2 pt-2 border-t border-neutral-900 text-[10px] text-emerald-400/90 flex items-center gap-1">
                                <Info className="w-3 h-3 shrink-0" />
                                <span>Tip: Clip {i} ka last frame use karein for zero actor change.</span>
                              </div>
                            )}
                          </div>

                          {/* Video Motion Prompt */}
                          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                                  <Film className="w-3 h-3 text-pink-400" />
                                  Google Flow (Veo) Motion Prompt
                                </span>
                                <button
                                  onClick={() => handleCopy(video?.prompt || '', `video-${clipNum}`)}
                                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-semibold"
                                >
                                  {copiedKey === `video-${clipNum}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>Copy</span>
                                </button>
                              </div>
                              <p className="font-mono text-[11px] text-neutral-300 leading-relaxed select-all">
                                {video?.prompt || 'Video prompt pending generation'}
                              </p>
                            </div>
                            {video?.listenerDirective && (
                              <div className="mt-2 pt-2 border-t border-neutral-900 text-[10px] text-neutral-500 font-mono">
                                Listener: {video.listenerDirective}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHARACTER REFERENCE PROMPTS */}
          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="font-bold text-white">How Character Anchors Work:</span> Midjourney, Flux, ya Google Flow Image generator mein har character ka yeh prompt daal kar 85mm portrait image banayein. Yeh image aap ka permanent face/wardrobe reference anchor hai.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filteredCharacters.map((item, idx) => (
                  <div
                    key={item.character.id || idx}
                    className="p-5 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-purple-500/40 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                          {item.character.id || `CHAR-0${idx + 1}`}
                        </span>
                        <h3 className="text-sm font-bold text-white">{item.character.name}</h3>
                        <span className="text-xs text-neutral-400">({item.character.speciesObject})</span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.prompt, `char-full-${idx}`)}
                        className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        {copiedKey === `char-full-${idx}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <span className="text-neutral-500 block text-[9px] uppercase">Outfit</span>
                        <span className="text-neutral-200 line-clamp-1">
                          {typeof item.character.clothing === 'string'
                            ? item.character.clothing
                            : item.character.clothing?.exactOutfit}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <span className="text-neutral-500 block text-[9px] uppercase">Voice</span>
                        <span className="text-neutral-200 line-clamp-1">
                          {typeof item.character.voice === 'string'
                            ? item.character.voice
                            : item.character.voice?.voiceType}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <span className="text-neutral-500 block text-[9px] uppercase">Facial Details</span>
                        <span className="text-neutral-200 line-clamp-1">
                          {item.character.physicalAppearance?.faceStructure || 'Sharp cinematic jaw'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800/80">
                        <span className="text-neutral-500 block text-[9px] uppercase">Aspect Ratio</span>
                        <span className="text-purple-300 font-bold">--ar {aspectRatio}</span>
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="space-y-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1">
                          Photorealistic Reference Prompt:
                        </div>
                        <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-200 leading-relaxed select-all">
                          {item.prompt}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                          Negative Prompt:
                        </div>
                        <div className="p-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono text-[11px] text-neutral-400 select-all">
                          {item.negativePrompt}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STARTING FRAME PROMPTS */}
          {activeTab === 'frames' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
                <Workflow className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="font-bold text-white">Continuity Chaining Rule:</span> Agar Clip 2, 3, etc. ka scene Clip 1 jaisa hi hai tu naya prompt generate krne ki bajaye Clip 1 ki video ka <strong>Aakhri Frame (End Frame)</strong> export kr k aglay clip ka starting frame banao.
                </div>
              </div>

              <div className="space-y-3">
                {filteredClips.map(({ clipNum, index, frame, clipDef }) => {
                  const strategy =
                    frame?.frameStrategy ||
                    clipDef?.frameReferenceStrategy ||
                    (index === 0 ? 'NEW_STARTING_FRAME' : 'USE_PREVIOUS_CLIP_END_FRAME');

                  return (
                    <div
                      key={clipNum}
                      className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs">
                            {clipNum}
                          </span>
                          <span className="text-xs font-bold text-white">Clip {clipNum} Frame Prompt</span>
                          {strategy === 'USE_PREVIOUS_CLIP_END_FRAME' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Chain: Clip {index} End Frame
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              Fresh Keyframe
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleCopy(frame?.prompt || '', `frame-tab-${clipNum}`)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 font-semibold transition"
                        >
                          {copiedKey === `frame-tab-${clipNum}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-purple-400" />
                          )}
                          <span>Copy</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed select-all">
                        {frame?.prompt || 'Frame prompt pending generation'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: VEO VIDEO MOTION PROMPTS */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3">
                <Tv className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                <div className="text-xs text-neutral-300 leading-relaxed">
                  <span className="font-bold text-white">Google Flow / Veo 10s Choreography:</span> Har prompt mein camera movement, active speaker ki facial action, spoken dialogue aur silent listener ka strict directive shamil hai.
                </div>
              </div>

              <div className="space-y-3">
                {filteredClips.map(({ clipNum, video, clipDef, speaker, dialogue }) => (
                  <div
                    key={clipNum}
                    className="p-4 rounded-2xl bg-neutral-900/70 border border-neutral-800 hover:border-pink-500/30 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-pink-950 text-pink-300 border border-pink-500/30 flex items-center justify-center font-mono font-bold text-xs">
                          {clipNum}
                        </span>
                        <span className="text-xs font-bold text-white">
                          Clip {clipNum} (10s) — {speaker}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(video?.prompt || '', `video-tab-${clipNum}`)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1 font-semibold transition"
                      >
                        {copiedKey === `video-tab-${clipNum}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-pink-400" />
                        )}
                        <span>Copy Prompt</span>
                      </button>
                    </div>

                    {dialogue && (
                      <div className="mb-2 p-2 rounded-lg bg-pink-950/20 border border-pink-500/20 text-xs text-pink-200 italic font-serif">
                        &ldquo;{dialogue}&rdquo;
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed select-all">
                      {video?.prompt || 'Video prompt pending generation'}
                    </div>

                    {video?.listenerDirective && (
                      <div className="mt-2 text-[10px] text-neutral-500 font-mono">
                        Listener Directive: {video.listenerDirective}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STEP-BY-STEP WORKFLOW GUIDE (URDU + ENGLISH) */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Roman Urdu Workflow Section */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-purple-500/30 shadow-lg">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-300 border border-purple-500/30 flex items-center justify-center font-black text-sm">
                    🇵🇰
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Google Flow & Veo Step-by-Step Production Guide (Roman Urdu)
                    </h3>
                    <p className="text-[11px] text-purple-300">
                      Har step ko ghor se parhen taake aap ki 1-2 minute ki movie 100% realistic aur consistent bane!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-white flex items-center justify-center text-[10px] font-mono">1</span>
                      Step 1: Character Reference Images (Face Lock)
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Sab se pehle tab <strong className="text-white">&ldquo;Character Prompts&rdquo;</strong> me ja kar har character ka prompt copy karein aur Midjourney ya Flux mein image generate karein. Is image ko save kar len kyun ke yeh aap ka &ldquo;Face Anchor&rdquo; hai taake har clip mein character ka chehra aur kapray bilkul aik jaise rahen.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-white flex items-center justify-center text-[10px] font-mono">2</span>
                      Step 2: Pehla Starting Frame (Clip 1)
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Pehle clip (Clip 1) ka Starting Frame Prompt copy karein aur Midjourney ya Google Flow image generator mein daal kar pehli image bana lein.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-white flex items-center justify-center text-[10px] font-mono">3</span>
                      Step 3: Google Flow (Veo) mein Clip 1 Banana
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Google Flow / Veo mein <strong className="text-white">Image-to-Video</strong> mode select karein. Clip 1 ki image upload karein aur Clip 1 ka <strong>Video Motion Prompt</strong> paste karein. Veo 10 seconds ki video generate karega with exact camera motion aur dialogue lip-sync.
                    </p>
                  </div>

                  {/* Highlighted Secret Rule */}
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                    <h4 className="text-xs font-black text-emerald-300 mb-1 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-emerald-400" />
                      Step 4: 🔑 THE GOLDEN RULE — Frame Chaining (Continuity Secret!)
                    </h4>
                    <p className="text-xs text-emerald-200/90 leading-relaxed">
                      <strong>DHYAN DEIN:</strong> Clip 2 ke liye NAYA image prompt generate krne ki zaroorat nahi hai agar scene same hai!
                      <br />
                      1. Clip 1 ki video ka <strong>Aakhri Frame (End Frame)</strong> export karein (screenshot ya CapCut se freeze frame/PNG).
                      <br />
                      2. Uss End Frame ko Clip 2 ke lye Veo mein <strong>Starting Image</strong> upload karein!
                      <br />
                      3. Phir Clip 2 ka Video Prompt paste kar dein.
                      <br />
                      👉 <em>Is se actors ki position, kapray aur lighting 0.1% bhi change nahi honge aur clips bilkul real movie ki tarah jud jaenge!</em>
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-white flex items-center justify-center text-[10px] font-mono">5</span>
                      Step 5: Lip-Sync aur Audio Rule
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Har 10-second clip mein sirf EK character bolta hai (Active Speaker). Doosra banda khamosh rehta hai (Silent Listener). Spoken line 14 se 18 words tak hoti hai taake 10 seconds me natural delivery ho sake.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800/80">
                    <h4 className="text-xs font-bold text-purple-300 mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-900/60 text-white flex items-center justify-center text-[10px] font-mono">6</span>
                      Step 6: Final Stitching in CapCut / Premiere
                    </h4>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      Sare 10-second clips ko sequence mein CapCut ya Premiere Pro mein daal dein. Frame Chaining ki wajah se simple straight cuts bhi seamless lagenge. Background music aur sound effects add karein aur 4K video export karein!
                    </p>
                  </div>
                </div>
              </div>

              {/* English Production Pipeline Section */}
              <div className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center font-black text-sm">
                    🌐
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Google Flow & Veo Master Workflow (English Standard)
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      Standard Operating Procedure for 1-2 Minute Prestige Mini-Films
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-neutral-300">
                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="font-bold text-white mb-1">1. Reference Anchoring</div>
                    <p className="text-neutral-400 text-[11px]">
                      Render 85mm character portraits using the Character Prompts in Midjourney or Flux. Use these reference images in image-prompting slots to keep faces consistent.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="font-bold text-white mb-1">2. Starting Keyframe Generation</div>
                    <p className="text-neutral-400 text-[11px]">
                      Use Starting Frame Prompt for Clip 1 to establish the 35mm wide composition, lighting tone, and actor placement.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="font-bold text-emerald-400 mb-1">3. Continuity Frame Chaining</div>
                    <p className="text-neutral-400 text-[11px]">
                      For all continuous scenes, extract the exact last frame of Clip N-1 and inject it as the input start-frame for Clip N. This completely eliminates AI drift.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                    <div className="font-bold text-white mb-1">4. 10s Clip Assembly</div>
                    <p className="text-neutral-400 text-[11px]">
                      Place all 6, 9, or 12 clips on the editing timeline. No cross-dissolves needed; frame-chained cuts look like real-camera continuous takes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-800/80 bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Director QA Approved & Production Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEverything}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Complete Package</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
