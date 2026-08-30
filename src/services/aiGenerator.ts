import { CreatorProfile, WeeklyPlan, DayContent, VaultItem, PerformanceLog, Scene, DramaCharacter } from '../types';
import { geminiService } from './geminiService';
import { EMOTIONAL_TRIGGERS } from '../data/presetTemplates';

export const aiGenerator = {
  async generateWeeklyPlan(
    profile: CreatorProfile,
    userApiKey: string,
    vaultItems: VaultItem[],
    performanceLogs: PerformanceLog[]
  ): Promise<WeeklyPlan> {
    // 1. If user provided their own personal key (BYOK Mode)
    if (userApiKey && userApiKey.trim().length > 8) {
      try {
        console.log('Generating using User Personal Gemini API Key...');
        return await geminiService.generateWeeklyPlanWithGemini(
          userApiKey,
          profile,
          vaultItems,
          performanceLogs
        );
      } catch (err: any) {
        console.warn('User API key failed, trying platform server key:', err.message);
      }
    }

    // 2. Try Platform Server-Side API Key (/api/generate)
    try {
      console.log('Generating using Platform Default Gemini API Key...');
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, vaultItems, performanceLogs }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.plan) {
          return result.plan;
        }
      }
    } catch (err: any) {
      console.warn('Server generation unavailable, using smart dynamic engine:', err.message);
    }

    // 3. Smart Dynamic Generative Synthesizer Engine
    console.log('Generating using Smart Dynamic Generative Synthesizer Engine...');
    if (profile.productionMode === 'episodic_season') {
      return this.generateDynamicDramaSeason(profile, vaultItems);
    }
    return this.generateDynamicStandalonePlan(profile, vaultItems);
  },

  // Re-roll a single scene dynamically
  async reRollScene(
    dayContent: DayContent,
    sceneNumber: number,
    customInstruction?: string
  ): Promise<Scene> {
    const existing = dayContent.scenes.find((s) => s.sceneNumber === sceneNumber) || dayContent.scenes[0];
    const isHook = sceneNumber === 1;

    const modifiedVisual = customInstruction
      ? `${existing.visualPrompt}\n[Director Custom Instruction: ${customInstruction}]`
      : `${existing.visualPrompt}\n[Director Polish: Enhanced volumetric lighting and sharper cinematic camera track]`;

    const modifiedDialogue = customInstruction
      ? `"${customInstruction} - and that's the truth nobody talks about."`
      : isHook
      ? `"Let me give you the unfiltered 10-second reality: ${existing.dialogue.replace(/"/g, '')}"`
      : `"Here's where everything changes: ${existing.dialogue.replace(/"/g, '')}"`;

    return {
      ...existing,
      visualPrompt: modifiedVisual,
      dialogue: modifiedDialogue,
      facialExpression: customInstruction ? `Intense expression tailored to: ${customInstruction}` : existing.facialExpression,
      bodyLanguage: customInstruction ? `Dynamic physical movement: ${customInstruction}` : existing.bodyLanguage,
      eyeContactCue: `Direct locked eye contact with camera lens for maximum viewer retention`,
      actingDirection: customInstruction ? `Delivers with: ${customInstruction}` : existing.actingDirection,
    };
  },

  // HELPER: Format Unified Master Production Prompt (1-Click Google Flow Directive)
  buildUnifiedPrompt(
    cameraAngle: string,
    aspectRatio: string,
    lighting: string,
    subjectAction: string,
    actingCues: { face?: string; body?: string; eyes?: string },
    dialogue: string,
    speakerRole?: string,
    speakerName?: string,
    listenerName?: string,
    listenerReaction?: string
  ): string {
    let prompt = `[Camera & Framing: ${cameraAngle}, Aspect Ratio: ${aspectRatio || '9:16'}, 24fps cinematic motion blur, ${lighting}]\n`;
    if (speakerName) {
      prompt += `[Speaker Isolation: ${speakerName} (${speakerRole || 'Speaker'}) is ACTIVE. Animated mouth delivers spoken dialogue in sharp sync.`;
      if (listenerName && listenerReaction) {
        prompt += ` In background, ${listenerName} remains completely silent, reacting with: ${listenerReaction}.`;
      }
      prompt += `]\n`;
    }
    prompt += `[Subject & Motion: ${subjectAction}]\n`;
    prompt += `[Acting & Micro-Directing: ${actingCues.face || 'Focused expression'}, ${actingCues.body || 'Subtle physical gesture'}, ${actingCues.eyes || 'Direct eye-contact locked with viewer'}]\n`;
    prompt += `[Exact Spoken Lip-Sync Dialogue: "${dialogue}"]`;
    return prompt;
  },

  // 100% DYNAMIC DRAMA & SEASONS SYNTHESIZER (Supports 30s [3 scenes] & 60s [6 scenes])
  generateDynamicDramaSeason(profile: CreatorProfile, vaultItems: VaultItem[]): WeeklyPlan {
    const seasonNum = profile.seasonNumber || 1;
    const isDesi = profile.language === 'roman_urdu_hindi';
    const is60s = profile.videoDuration === '60s';
    const ar = profile.aspectRatio || '9:16';
    const arString = ar === '16:9' ? '16:9 widescreen cinematic framing' : (ar === '1:1' ? '1:1 square framing' : '9:16 vertical smartphone portrait framing');

    const vibes = profile.selectedVibeTags || ['🏢 Corporate Revenge'];
    const twist = profile.customTwistInput || '';
    const isTalkingObject = vibes.some((v) => v.includes('Mug') || v.includes('Avocado') || v.includes('Drink') || v.includes('Laptop') || v.includes('Bottle'));

    // Dynamic 3-Character Casting based on selected vibes
    const hero: DramaCharacter = profile.castEnsemble?.[0] || {
      id: 'char_hero',
      name: isTalkingObject ? 'Bob (The Mug)' : (isDesi ? 'Bilal (Rogue Architect)' : 'Leo (Protagonist)'),
      role: 'protagonist',
      roleLabel: 'Protagonist / Hero',
      visualAnchor: isTalkingObject 
        ? 'Screen-Left: matte navy ceramic mug with 3D expressive eyebrows' 
        : (isDesi ? 'Screen-Left: 24yo sharp developer in dark hoodie' : 'Screen-Left: 24yo determined AI engineer in sleek navy hoodie with sharp focus'),
      color: '#26D9E6',
    };

    const villain: DramaCharacter = profile.castEnsemble?.[1] || {
      id: 'char_villain',
      name: isTalkingObject ? 'Marcus (Energy Can)' : (isDesi ? 'Dawood (Founding Partner)' : 'Marcus (Antagonist)'),
      role: 'antagonist',
      roleLabel: 'Antagonist / Villain',
      visualAnchor: isTalkingObject
        ? 'Screen-Right: sleek red energy drink can with angry lightning decal eyebrows'
        : (isDesi ? 'Screen-Right: 50yo arrogant founding investor in tailored waistcoat' : 'Screen-Right: 45yo ruthless tech CEO in bespoke charcoal suit with cold arrogant smirk'),
      color: '#FF4D6D',
    };

    const supporting: DramaCharacter = profile.castEnsemble?.[2] || {
      id: 'char_supporting',
      name: isTalkingObject ? 'Leo (Avocado)' : (isDesi ? 'Zara (Lead Product PM)' : 'Ayla (Cyber Analyst)'),
      role: 'supporting',
      roleLabel: 'Supporting Ally / Insider',
      visualAnchor: isTalkingObject
        ? 'Screen-Center: chill organic avocado wearing miniature white headphones'
        : (isDesi ? 'Screen-Center: 24yo smart product lead holding iPad' : 'Screen-Center: 23yo elite cybersecurity analyst in dark blazer with holographic tablet'),
      color: '#D84DFF',
    };

    const ensemble: DramaCharacter[] = [hero, villain, supporting];

    // 7 Continuous Dynamic Episodes
    const episodeArc = [
      {
        epNum: 1,
        title: `Episode 1: The Inciting Breach`,
        cliffhanger: `Did you honestly think the board would let an outsider touch the cryptographic key?`,
        themes: isDesi ? 'Subah 9 baje se pehle sab evidence gayab ho jayega.' : 'The encrypted master records were downloaded 3 minutes before system wipe.',
      },
      {
        epNum: 2,
        title: `Episode 2: The Midnight Ultimatum`,
        cliffhanger: `The server room doors lock automatically as heavy security footsteps echo outside.`,
        themes: isDesi ? 'Raat 2 baje office mein tumhara kya kaam tha?' : 'You crossed the perimeter line that nobody comes back from.',
      },
      {
        epNum: 3,
        title: `Episode 3: The Undercover Insider`,
        cliffhanger: `Ayla reveals a secondary backdoor live-streaming to 50,000 shareholders.`,
        themes: isDesi ? 'Main 6 maheene se audit logs record kar rahi thi.' : 'I planted the tracker in Marcus’s private hardware wallet 6 months ago.',
      },
      {
        epNum: 4,
        title: `Episode 4: The Boardroom Betrayal`,
        cliffhanger: `The decryption key is handed over, but a hidden payload triggers.`,
        themes: isDesi ? 'Har insaan ki deal hoti hai, lekin tum dono phas chuke ho.' : 'You paid off the security team, but you forgot who authored the root kernel.',
      },
      {
        epNum: 5,
        title: `Episode 5: The System Override`,
        cliffhanger: `A flashing crimson emergency alert hijacks every presentation screen.`,
        themes: isDesi ? '60 seconds hain tumhare paas, resign karo ya live broadcast dekho.' : 'Global override sequence active. 60 seconds before public transmission.',
      },
      {
        epNum: 6,
        title: `Episode 6: The Final Showdown`,
        cliffhanger: `Federal agents step through the boardroom doors as the live stream peaks.`,
        themes: isDesi ? 'Khel khatam. Board aur media pichle 15 minutes se sun rahe hain.' : 'Game over. The entire regulatory board was on the line.',
      },
      {
        epNum: 7,
        title: `Episode 7: Season 1 Finale & Twist`,
        cliffhanger: `A black wax envelope appears on Leo's desk marked 'Season 2: The Architect'.`,
        themes: isDesi ? 'Marcus to sirf mohra tha. Asal game ab shuru hota hai.' : 'Marcus was just the puppet. Welcome to the real boardroom. Season 2 begins now.',
      },
    ];

    const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const days: DayContent[] = episodeArc.map((ep, idx) => {
      const emotionalTrigger = EMOTIONAL_TRIGGERS[idx % EMOTIONAL_TRIGGERS.length];

      const masterKeyframePrompt = `Hyper-realistic ${arString} Three-Shot (--ar ${ar}): On Screen-Left, ${hero.visualAnchor}. On Screen-Right, ${villain.visualAnchor}. In Background, ${supporting.visualAnchor}. ${twist ? `Story Twist: ${twist}. ` : ''}Cinematic lighting, high-contrast dark mood, rainy window reflections, volumetric light beams, Unreal Engine 5 8k render.`;

      // Build either 3 scenes (30s) or 6 scenes (60s)
      const sceneCount = is60s ? 6 : 3;
      const scenes: Scene[] = [];

      for (let sIdx = 1; sIdx <= sceneCount; sIdx++) {
        const durationStr = is60s 
          ? `${(sIdx - 1) * 10}-${sIdx * 10}s` 
          : `${(sIdx - 1) * 10}-${sIdx * 10}s`;

        let activeSpeaker = hero;
        let listener = villain;
        let angleType = 'Over-the-shoulder Left (Focus on Hero)';
        let phase = `Scene ${sIdx} (${durationStr})`;
        let dialogue = ``;
        let faceCue = ``;
        let bodyCue = ``;
        let eyeCue = ``;
        let actionMotion = ``;
        let lighting = `Cool cyan rim backlight with moody shadows`;

        if (sIdx === 1) {
          phase = `Hook & Conflict (${durationStr})`;
          activeSpeaker = hero;
          listener = villain;
          angleType = 'Over-the-shoulder Left (Focus on Hero)';
          dialogue = isDesi 
            ? `Marcus, tumhara secret ledger delete nahi hua. Sab audit logs mere paas hain.` 
            : `Marcus, you didn't delete the ledger. Every encrypted transaction is in my possession.`;
          faceCue = `Determined piercing glare, tight jawline, furrowed brow`;
          bodyCue = `Stepping firmly forward, holding biometric keycard decisively`;
          eyeCue = `Unblinking direct eye contact into camera lens for first 3 seconds to lock hook`;
          actionMotion = `Slow 24fps push-in on ${hero.name} delivering the ultimatum while ${villain.name} glares coldly in background.`;
        } else if (sIdx === 2) {
          phase = `Villain Counter & Threat (${durationStr})`;
          activeSpeaker = villain;
          listener = hero;
          angleType = 'Reverse Angle Right (Focus on Villain)';
          dialogue = isDesi 
            ? `Tumhe lagta hai board tumhari baat sunega? Kal subah tak tumhari identity erase ho chuki hogi.` 
            : `You think the board will believe an outsider? By dawn, your entire digital footprint won't exist.`;
          faceCue = `Condescending cynical smirk, predatory unblinking stare`;
          bodyCue = `Slowly adjusting cufflinks, leaning back against dark mahogany desk`;
          eyeCue = `Cold arrogant gaze locked on Hero with absolute superiority`;
          actionMotion = `Parallax camera track focusing on ${villain.name} laughing softly while ${hero.name} remains silent on screen-left.`;
          lighting = `Harsh amber key light with deep noir shadows`;
        } else if (sIdx === 3) {
          phase = is60s ? `Insider Intervention (${durationStr})` : `Cliffhanger Climax (${durationStr})`;
          if (is60s) {
            activeSpeaker = supporting;
            listener = hero;
            angleType = 'Center Ally Reveal Shot';
            dialogue = isDesi 
              ? `Leo ruk jao! Marcus akela nahi hai, board ne already live audit authorize kardia hai.` 
              : `Leo, wait! Marcus isn't acting alone—the audit committee has been listening to this entire room.`;
            faceCue = `Urgent calculating expression, raised eyebrows, rapid eye movement`;
            bodyCue = `Stepping into center frame holding glowing tablet with live stream data`;
            eyeCue = `Glances rapidly between both characters before locking onto Hero`;
            actionMotion = `${supporting.name} steps into the light between both characters as tablet glows with green authentication logs.`;
          } else {
            activeSpeaker = hero;
            listener = villain;
            angleType = 'Two-Shot Tension Climax';
            dialogue = isDesi 
              ? `Dekhte hain kal subah kon erase hota hai. Kal ka episode dekhein!` 
              : `We'll see who gets erased when the servers reboot at dawn. Follow for Episode ${ep.epNum + 1}!`;
            faceCue = `Triumphant cold smile, relaxed confident posture`;
            bodyCue = `Tapping enter key on laptop as screen pulses electric blue`;
            eyeCue = `Locks direct eye contact into camera lens for final 2.5s cliffhanger retention`;
            actionMotion = `Dynamic dramatic zoom-in between all characters as alarm pulse illuminates the room.`;
          }
        } else if (sIdx === 4) {
          phase = `The Secret Exposed (${durationStr})`;
          activeSpeaker = villain;
          listener = supporting;
          angleType = 'Low-Angle Villain Fury';
          dialogue = isDesi 
            ? `Ayla, tumne tablet kis ke network se connect kiya hai?! Foran disconnect karo!` 
            : `Ayla, which network is that tablet broadcasting to?! Sever the connection immediately!`;
          faceCue = `Sudden panic breaking through arrogant mask, flared nostrils`;
          bodyCue = `Slamming palm on desk, pointing aggressively at tablet`;
          eyeCue = `Wild darting eyes realizing he walked straight into a trap`;
          actionMotion = `Rapid camera dolly towards ${villain.name} as red warning indicators flash across background glass panels.`;
        } else if (sIdx === 5) {
          phase = `The Turning Point (${durationStr})`;
          activeSpeaker = hero;
          listener = villain;
          angleType = 'Hero Dominance Angle';
          dialogue = isDesi 
            ? `Bohat dair ho chuki hai Marcus. Federal authorities boardroom ke bahar khari hain.` 
            : `Too late, Marcus. The regulatory taskforce has had eyes on this feed for 10 minutes.`;
          faceCue = `Unshakable calm authority, subtle satisfied nod`;
          bodyCue = `Arms crossed comfortably, standing tall against the night skyline`;
          eyeCue = `Piercing resolute eye contact projecting absolute victory`;
          actionMotion = `Smooth sweeping crane shot rising above ${hero.name} as glass doors reflect emergency vehicle lights outside.`;
        } else {
          // sIdx === 6 (60s Climax)
          phase = `60s Season Cliffhanger (${durationStr})`;
          activeSpeaker = hero;
          listener = villain;
          angleType = 'Epic Cliffhanger Three-Shot';
          dialogue = isDesi 
            ? `Khel khatam. Lekin asal mastermind kon tha? Kal ka episode miss mat karna!` 
            : `The reign ends now. But who was the real architect? Hit follow for Episode ${ep.epNum + 1}!`;
          faceCue = `Intriguing suspenseful expression, subtle micro-wink`;
          bodyCue = `Turning smoothly to address camera directly as lights dim`;
          eyeCue = `Unbroken direct eye contact locked into lens until the final second`;
          actionMotion = `Slow cinematic pull-back into dark shadows as the cliffhanger dialogue resonates.`;
        }

        const unifiedPrompt = this.buildUnifiedPrompt(
          angleType,
          ar,
          lighting,
          actionMotion,
          { face: faceCue, body: bodyCue, eyes: eyeCue },
          dialogue,
          activeSpeaker.role,
          activeSpeaker.name,
          listener.name,
          faceCue
        );

        scenes.push({
          sceneNumber: sIdx,
          duration: durationStr,
          phase,
          speaker: activeSpeaker.name,
          speakerRole: activeSpeaker.role,
          listenerName: listener.name,
          listenerReaction: `Observing in tense silence on opposite side of screen`,
          cameraAngleType: angleType,
          visualPrompt: unifiedPrompt,
          facialExpression: faceCue,
          bodyLanguage: bodyCue,
          eyeContactCue: eyeCue,
          actingDirection: `Delivers with crisp Hollywood dialogue pacing under 22 words.`,
          dialogue,
          alternateHooks: sIdx === 1 ? [
            dialogue,
            `"Your time expired 10 seconds ago, Marcus."`,
            `"Look at the monitors, Marcus. The board already knows."`,
          ] : undefined,
          cameraMotion: '24fps cinematic anamorphic camera movement',
          lightingAndMood: lighting,
        });
      }

      return {
        dayNumber: idx + 1,
        dayName: daysNames[idx],
        title: ep.title,
        episodeNumber: ep.epNum,
        episodeTitle: ep.title,
        cliffhangerHook: ep.cliffhanger,
        angleArchetype: `Episode ${ep.epNum} Story Arc`,
        emotionalTrigger,
        viralScore: 98,
        targetEmotion: 'Maximize Binge-Watching & Profile Visits',
        videoFormatMode: 'podcast_fixed',
        masterKeyframePrompt,
        bgmPrompt: `Intense cinematic Hans Zimmer style suspense ostinato at 120 BPM with ticking clock and heavy sub-bass drops.`,
        scenes,
        platformMetadata: {
          instagram: {
            hookCaption: `EPISODE ${ep.epNum}: ${ep.title} ⚡ (Watch till the cliffhanger!) 👇`,
            bodyCaption: `The corporate conspiracy deepens.\n\n${ep.cliffhanger}\n\nEpisode ${ep.epNum + 1} drops tomorrow! Follow so you don't miss the reveal.`,
            hashtags: ['#aidrama', '#shortfilm', '#scifidrama', '#miniseries', '#cliffhanger', '#storytelling'],
            callToAction: `What do you think happens in Episode ${ep.epNum + 1}? Drop your theory in the comments! 👇`,
          },
          tiktok: {
            textOverlayHook: `EPISODE ${ep.epNum}: THE INCIDENT NOBODY SAW COMING 😱`,
            caption: `${ep.title} Part ${ep.epNum} #aidrama #series #story #fyp #viral #movietok`,
            seoKeywords: ['AI drama series', 'short film series', 'binge watch story', 'episode cliffhanger'],
            audioVibe: 'Cinematic Thriller Suspense Audio / Trending Drama Sound',
          },
          youtubeShorts: {
            title: `Episode ${ep.epNum}: ${ep.title} | Season ${seasonNum} #shorts`,
            description: `Full AI Mini-Series Episode ${ep.epNum}. Subscribe and turn on notifications for Episode ${ep.epNum + 1}!`,
            tags: ['shorts', 'drama', 'series', 'story', 'cinematic'],
            pinnedComment: `Episode ${ep.epNum + 1} drops tomorrow at 6 PM EST! Who do you think is the real villain?`,
          },
          threads: {
            threadPost: `Episode ${ep.epNum} of our AI Drama is out. The cliffhanger at the end changes everything. Who saw that coming?`,
          },
          pinterest: {
            pinTitle: `AI Drama Season ${seasonNum} - Episode ${ep.epNum}`,
            pinDescription: `Follow the full 7-episode suspense series crafted with AI cinematography.`,
            suggestedBoard: 'AI Filmmaking & Story Series',
            keywords: ['AI film', 'drama series', 'cinematography', 'storyboard'],
          },
          facebook: {
            storyCaption: `Episode ${ep.epNum} of the mini-series is live. Wait till you see the ending twist.`,
          },
        },
      };
    });

    return {
      id: `plan_season_${seasonNum}_${Date.now()}`,
      profileId: profile.id,
      profileName: `${profile.name} (Season ${seasonNum})`,
      archetype: profile.archetype,
      productionMode: 'episodic_season',
      seasonNumber: seasonNum,
      seasonTitle: profile.seasonTitle || `The Boardroom Protocol (Season ${seasonNum})`,
      seasonSynopsis: profile.seasonSynopsis || `A high-stakes corporate espionage drama where a rogue engineer exposes a \$50B algorithm theft.`,
      castEnsemble: ensemble,
      selectedVibeTags: profile.selectedVibeTags,
      customTwistInput: profile.customTwistInput,
      aspectRatio: profile.aspectRatio,
      contentType: profile.contentType,
      videoFormatMode: 'podcast_fixed',
      videoDuration: profile.videoDuration || '30s',
      language: profile.language || 'english_global',
      hasReferenceImage: profile.hasReferenceImage,
      niche: profile.niche,
      createdAt: Date.now(),
      days,
    };
  },

  // 100% DYNAMIC STANDALONE PLAN SYNTHESIZER (30s [3 clips] vs 60s [6 clips])
  generateDynamicStandalonePlan(profile: CreatorProfile, vaultItems: VaultItem[]): WeeklyPlan {
    const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const isDesi = profile.language === 'roman_urdu_hindi';
    const is60s = profile.videoDuration === '60s';
    const ar = profile.aspectRatio || '9:16';
    const arString = ar === '16:9' ? '16:9 widescreen cinematic framing' : (ar === '1:1' ? '1:1 square social framing' : '9:16 vertical smartphone portrait framing');

    const vibes = profile.selectedVibeTags || ['☕ Sarcastic Coffee Mug'];
    const twist = profile.customTwistInput || '';
    const isTalkingObject = vibes.some((v) => v.includes('Mug') || v.includes('Avocado') || v.includes('Drink') || v.includes('Laptop') || v.includes('Bottle'));
    const isHuman = !isTalkingObject && vibes.some((v) => v.includes('AI Girl') || v.includes('Silicon Valley') || v.includes('Intern'));

    const days: DayContent[] = daysNames.map((dayName, index) => {
      const emotionalTrigger = EMOTIONAL_TRIGGERS[index % EMOTIONAL_TRIGGERS.length];
      const viralScore = Math.floor(94 + Math.random() * 5);

      // Dynamically generate title and core concept
      const titleSeeds = [
        `The "Always Available" Trap: Why Being Too Reliable Ruins Your Career`,
        `Why 10 Hours of Silent Hard Work Won't Get You Promoted in 2026`,
        `The 3-Second Psychological Rule to Shut Down Disrespect Instantly`,
        `Stop Doing Everything Manually: The 3-Step AI Pipeline You Need`,
        `Brutal Corporate Reality: Your Boss Is Not Your Friend`,
        `The Secret Habit That Puts You in the Top 1% of Creators`,
        `Why High-Value People Never Justify Their Decisions to Anyone`,
      ];

      const desiTitleSeeds = [
        `Weekend Pe Boss Ka 'Urgent Call': Zindagi Bachane Ka 3-Second Rule`,
        `Corporate Life Ka Sab Se Bara Jhoot: 'Hmari Company Ek Family Hai'`,
        `Khamoshi Se Kaise Kisi Ko Dominant Karein: Psychological Rule`,
        `2026 Mein AI Ke Sath 4 Ghante Ka Kaam 20 Minute Mein Khatam Karo`,
        `Office Mein 'Sharif' Banna Band Karo: Boundaries Kaise Set Karein`,
        `Top 1% Creators Ka Secret Workflow Jo Koi Nahi Batata`,
        `Jab Log Disrespect Karein To React Mat Karo: Asal Power Sikho`,
      ];

      const title = isDesi ? desiTitleSeeds[index % desiTitleSeeds.length] : titleSeeds[index % titleSeeds.length];

      const masterKeyframePrompt = `Hyper-realistic ${arString} Master Portrait (--ar ${ar}): ${profile.characterDna}. ${twist ? `Director Twist: ${twist}. ` : ''}Cinematic lighting, crisp textures, depth of field, 8k Unreal Engine 5 render.`;

      const sceneCount = is60s ? 6 : 3;
      const scenes: Scene[] = [];

      for (let sIdx = 1; sIdx <= sceneCount; sIdx++) {
        const durationStr = `${(sIdx - 1) * 10}-${sIdx * 10}s`;
        let phase = `Scene ${sIdx} (${durationStr})`;
        let dialogue = ``;
        let faceCue = ``;
        let bodyCue = ``;
        let eyeCue = ``;
        let actionMotion = ``;
        let lighting = `Volumetric studio lighting with warm fill and cool rim light`;

        if (sIdx === 1) {
          phase = `Hook (0-10s)`;
          dialogue = isDesi 
            ? `Bhai, raat 11 baje tumne boss ka email reply kardia? Wo job jo tumhein 2 din mein replace kardegi!` 
            : `You answered an email at 11 PM for a company that would replace your job before your coffee gets cold.`;
          faceCue = isTalkingObject ? `Exhausted deadpan micro-frown, raising left cartoon eyebrow in sarcastic disbelief` : `Confident charismatic gaze with subtle raised eyebrow`;
          bodyCue = isTalkingObject ? `Subtle forward lean on desk with tiny steam swirl of exhaustion` : `Leaning forward on studio table, holding coffee mug naturally`;
          eyeCue = `Piercing unblinking direct eye contact into camera lens for first 3.5 seconds to lock hook retention`;
          actionMotion = `Slow 24fps push-in zoom with anamorphic depth of field focusing on character face.`;
        } else if (sIdx === 2) {
          phase = `Core Truth / Pain Point (10-20s)`;
          dialogue = isDesi 
            ? `Jab tum har waqt available rehte ho na, to log tumhari value zero samajhte hain.` 
            : `High-value people are never accessible on demand. When you make yourself cheap, they treat you like disposable plastic.`;
          faceCue = `Knowing condescending smirk, wide expressive eyes softening into relatable empathy`;
          bodyCue = isTalkingObject ? `Gentle tilt to left side, handle shifting subtly as if shaking head` : `Open hand gestures emphasizing key insight with speech cadence`;
          eyeCue = `Maintains locked gaze, glancing away for 0.5s before snapping back directly to camera`;
          actionMotion = `Smooth parallax rotation around character keeping face locked in center frame.`;
        } else if (sIdx === 3) {
          phase = is60s ? `The Shift / Mechanism (20-30s)` : `Climax & CTA (20-30s)`;
          if (is60s) {
            dialogue = isDesi 
              ? `Yahan aakar 90% log ghalti karte hain. Wo zyada mehnat karte hain jabke unhe boundaries banani chahiye thi.` 
              : `Here is where 90% of people fail: They double down on silent effort instead of designing strategic visibility.`;
            faceCue = `Intense analytical focus, sharp confident nod`;
            bodyCue = `Pointing firmly towards presentation screen or laptop`;
            eyeCue = `Direct commanding eye contact demanding full viewer attention`;
            actionMotion = `Dynamic low-angle camera shift with glowing ambient backlight.`;
          } else {
            dialogue = isDesi 
              ? `Laptop band karo aur apni self-respect bachao. Daily reality check ke liye follow karo!` 
              : `Close the laptop. Your self-respect left the chat, but you can still save tomorrow. Follow for your daily reality check.`;
            faceCue = `Confident triumphant grin, relaxed eyebrow arch, authoritative nod`;
            bodyCue = `Standing tall and upright, gestures delivering final punchline`;
            eyeCue = `Direct locked eye contact ending with a charming micro-wink on final CTA`;
            actionMotion = `Low angle hero shot with gradual cinematic pull back.`;
          }
        } else if (sIdx === 4) {
          phase = `The Framework Breakdown (30-40s)`;
          dialogue = isDesi 
            ? `Pehla rule: Kabhi weekend pe instant reply mat do. Doosra rule: Apne results ko document karo.` 
            : `Rule number one: Never respond instantly on off-hours. Rule number two: Document your business output publicly.`;
          faceCue = `Clear authoritative teaching expression with charismatic smile`;
          bodyCue = `Counting 2 rules on fingers with natural fluid movement`;
          eyeCue = `Locks eyes with viewer, blinking naturally with conversational rhythm`;
          actionMotion = `Eye-level tracking shot moving smoothly across the studio set.`;
        } else if (sIdx === 5) {
          phase = `The Wake-Up Reality (40-50s)`;
          dialogue = isDesi 
            ? `Competence tumhein hire karwati hai, lekin visibility tumhein promote karwati hai. Spreadsheet ke peeche chupna band karo.` 
            : `Competence gets you hired, but visibility gets you paid. Stop hiding behind spreadsheets and start owning your leverage.`;
          faceCue = `Passionate intense storytelling expression, direct piercing gaze`;
          bodyCue = `Leaning in close towards camera lens with commanding presence`;
          eyeCue = `Unwavering intense eye contact cutting straight through the screen`;
          actionMotion = `Slow-motion dramatic push-in as lighting shifts to warm gold key.`;
        } else {
          // sIdx === 6 (60s Climax)
          phase = `60s Final CTA & Follow Hook (50-60s)`;
          dialogue = isDesi 
            ? `Laptop band karo aur apni worth samjho. Ye video us dost ko share karo jise iski sakht zaroorat hai!` 
            : `Stop being the reliable workhorse—the horse never owns the track. Share this with a colleague who needs this wake-up call!`;
          faceCue = `Triumphant smile, decisive final nod of authority`;
          bodyCue = `Decisive closing gesture pointing towards share button`;
          eyeCue = `Direct locked eye contact that doesn't break until the video ends`;
          actionMotion = `Cinematic wide pull-back into full aesthetic studio framing.`;
        }

        const unifiedPrompt = this.buildUnifiedPrompt(
          isTalkingObject ? 'Macro Cinematic Framing' : 'Portrait Medium Shot',
          ar,
          lighting,
          actionMotion,
          { face: faceCue, body: bodyCue, eyes: eyeCue },
          dialogue
        );

        scenes.push({
          sceneNumber: sIdx,
          duration: durationStr,
          phase,
          speaker: profile.name,
          speakerRole: 'protagonist',
          cameraAngleType: isTalkingObject ? 'Macro Cinematic Framing' : 'Portrait Medium Shot',
          visualPrompt: unifiedPrompt,
          facialExpression: faceCue,
          bodyLanguage: bodyCue,
          eyeContactCue: eyeCue,
          actingDirection: `Delivers with razor-sharp comedic or authoritative cadence under 22 words.`,
          dialogue,
          alternateHooks: sIdx === 1 ? [
            dialogue,
            `"Nobody tells you this: The more available you are, the less valuable you become."`,
            `"Did your boss text 'quick question' this Saturday? If you reply, you're doomed."`,
          ] : undefined,
          cameraMotion: '24fps cinematic camera motion',
          lightingAndMood: lighting,
        });
      }

      return {
        dayNumber: index + 1,
        dayName,
        title,
        angleArchetype: emotionalTrigger.label,
        emotionalTrigger,
        viralScore,
        targetEmotion: emotionalTrigger.algorithmicGoal,
        videoFormatMode: profile.videoFormatMode,
        masterKeyframePrompt,
        bgmPrompt: `Lo-fi melancholic Rhodes piano chords at 85 BPM with punchy subtle bass drop at 0:07s.`,
        scenes,
        platformMetadata: {
          instagram: {
            hookCaption: isDesi ? `Ye baat har 9-to-5 bande ko samajh leni chahiye ☕👇` : `Listen carefully before you burn out ☕👇`,
            bodyCaption: `${title}.\n\nStop trading your mental peace for people who view you as an expense item.\n\nTake your power back today.`,
            hashtags: ['#mindsetshift', '#workplacehumor', '#selfworth', '#careeradvice', '#reelsviral'],
            callToAction: 'Tag that one coworker who needs this wake-up call today! 👇',
          },
          tiktok: {
            textOverlayHook: isDesi ? `CORPORATE KA SUB SE BARA JHOOT 😳` : `THE UNCOMFORTABLE TRUTH ABOUT BEING TOO AVAILABLE 😳`,
            caption: `${title} #relatable #viral #careeradvice #mindset #fyp`,
            seoKeywords: ['career burnout', 'corporate humor', 'workplace boundaries', 'creator mindset'],
            audioVibe: 'Sarcastic / Chill Lo-Fi Voiceover vibe with punchy beats',
          },
          youtubeShorts: {
            title: `${title} #shorts`,
            description: `Brutal career truth in short-form. Subscribe for daily wisdom with attitude.`,
            tags: ['shorts', 'career', 'motivation', 'humor', 'mindset'],
            pinnedComment: 'What is the worst workplace advice you ever received? Drop it in the comments!',
          },
          threads: {
            threadPost: `Being reachable 24/7 doesn't make you valuable, it makes you disposable. High performers protect their calendar like their life depends on it.`,
          },
          pinterest: {
            pinTitle: `${title} - Career Wisdom`,
            pinDescription: `Stop overworking for people who won't remember. Here is why setting strict boundaries is the greatest career move you will make.`,
            suggestedBoard: 'Career Mindset & Growth',
            keywords: ['work boundaries', 'career tips', 'mental clarity', 'workplace motivation'],
          },
          facebook: {
            storyCaption: `One of the most valuable lessons you can learn in life is that not everything deserves your reaction. Silence is often the loudest statement you can make.`,
          },
        },
      };
    });

    return {
      id: `plan_${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      archetype: profile.archetype,
      productionMode: 'standalone_daily',
      selectedVibeTags: profile.selectedVibeTags,
      customTwistInput: profile.customTwistInput,
      aspectRatio: profile.aspectRatio,
      contentType: profile.contentType,
      videoFormatMode: profile.videoFormatMode,
      videoDuration: profile.videoDuration || '30s',
      language: profile.language || 'english_global',
      hasReferenceImage: profile.hasReferenceImage,
      castMembers: profile.castMembers,
      niche: profile.niche,
      createdAt: Date.now(),
      days,
    };
  },
};
