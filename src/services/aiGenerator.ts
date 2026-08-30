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
      console.warn('Server generation unavailable, using smart offline engine:', err.message);
    }

    // 3. Fallback: Smart Algorithmic Generator Engine
    console.log('Generating using Smart Algorithmic Generator Engine...');
    if (profile.productionMode === 'episodic_season') {
      return this.generateEpisodicDramaSeason(profile, vaultItems);
    }
    return this.generateSmartMockPlan(profile, vaultItems);
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
      ? `${existing.visualPrompt} [Director Custom Direction: ${customInstruction}]`
      : `${existing.visualPrompt} with enhanced cinematic micro-angles and sharper lighting`;

    const modifiedDialogue = customInstruction
      ? `"${customInstruction} - and that's the raw truth nobody admits."`
      : isHook
      ? `"Let's be completely honest for 10 seconds: ${existing.dialogue.replace(/"/g, '')}"`
      : `"Here's the real shift: ${existing.dialogue.replace(/"/g, '')}"`;

    return {
      ...existing,
      visualPrompt: modifiedVisual,
      dialogue: modifiedDialogue,
      facialExpression: customInstruction ? `Intense expression tailored to: ${customInstruction}` : existing.facialExpression,
      bodyLanguage: customInstruction ? `Dynamic physical movement: ${customInstruction}` : existing.bodyLanguage,
      eyeContactCue: `Direct continuous eye contact locked with viewer for maximum retention`,
      actingDirection: customInstruction ? `Delivers with: ${customInstruction}` : existing.actingDirection,
    };
  },

  // AI DRAMA & EPISODIC SEASONS ENGINE (With Hero, Villain, and Supporting Cast)
  generateEpisodicDramaSeason(profile: CreatorProfile, vaultItems: VaultItem[]): WeeklyPlan {
    const seasonNum = profile.seasonNumber || 1;
    const isDesi = profile.language === 'roman_urdu_hindi';

    // 3-Member Cast Ensemble (Hero, Villain, Supporting Ally)
    const hero: DramaCharacter = profile.castEnsemble?.[0] || {
      id: 'char_hero',
      name: isDesi ? 'Leo / Bilal' : 'Leo',
      role: 'protagonist',
      roleLabel: 'Protagonist / Hero',
      visualAnchor: 'Screen-Left: 24yo determined AI engineer in sleek navy hoodie with sharp focus',
      color: '#26D9E6',
    };

    const villain: DramaCharacter = profile.castEnsemble?.[1] || {
      id: 'char_villain',
      name: isDesi ? 'Marcus / Dawood' : 'Marcus',
      role: 'antagonist',
      roleLabel: 'Antagonist / Villain',
      visualAnchor: 'Screen-Right: 45yo ruthless tech CEO in bespoke charcoal suit with cold arrogant smirk',
      color: '#FF4D6D',
    };

    const supporting: DramaCharacter = profile.castEnsemble?.[2] || {
      id: 'char_supporting',
      name: isDesi ? 'Ayla / Zara' : 'Ayla',
      role: 'supporting',
      roleLabel: 'Supporting Ally / Insider',
      visualAnchor: 'Screen-Center/Background: 23yo elite cybersecurity analyst in dark blazer with holographic tablet',
      color: '#D84DFF',
    };

    const ensemble: DramaCharacter[] = [hero, villain, supporting];

    const episodeTemplates = [
      {
        epNum: 1,
        title: `Episode 1: The Inciting Breach`,
        cliffhanger: `Did you really think the board would let an intern see the master key?`,
        scenes: [
          {
            sNum: 1,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Glaring coldly with hands in pockets on screen-right, completely silent',
            angle: 'Over-the-shoulder Left (Focus on Hero)',
            dialogue: isDesi ? `Marcus, ledger delete nahi hua. Sab records mere paas hain.` : `Marcus, you didn't delete the ledger. I have the cryptographic master records.`,
          },
          {
            sNum: 2,
            speaker: villain,
            listener: hero,
            listenerReaction: 'Standing firm on screen-left, observing silently with intense focus',
            angle: 'Reverse Angle Right (Focus on Villain)',
            dialogue: isDesi ? `Tumhe lagta hai board tumhari baat sunega? Kal 9 baje tak tumhari identity erase ho chuki hogi.` : `You think the board will believe a junior? By 9:00 AM, your access won't even exist.`,
          },
          {
            sNum: 3,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Eyes narrowing with irritation on screen-right',
            angle: 'Two-Shot Split Focus',
            dialogue: isDesi ? `Dekhte hain kal subah kon erase hota hai.` : `We'll see who gets erased when the servers reboot at dawn.`,
          },
        ],
      },
      {
        epNum: 2,
        title: `Episode 2: The Midnight Threat`,
        cliffhanger: `The server room lights suddenly shut down with a heavy metallic lock.`,
        scenes: [
          {
            sNum: 1,
            speaker: villain,
            listener: hero,
            listenerReaction: 'Looking around dark server room with flashlight',
            angle: 'High-Angle Shadow Tracking (Villain)',
            dialogue: isDesi ? `Raat ke 2 baje tum mere office mein kiya kar rahe ho?` : `What are you doing inside my private office at 2:00 AM?`,
          },
          {
            sNum: 2,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Stepping out of the shadows with a smirk',
            angle: 'Low-Angle Hero Shot',
            dialogue: isDesi ? `Wo file dhoond raha hoon jo tumne 3 saal pehle chupaai thi.` : `Looking for the patent file you buried three years ago.`,
          },
          {
            sNum: 3,
            speaker: villain,
            listener: hero,
            listenerReaction: 'Holding drive tightly as lock clicks shut',
            angle: 'Dramatic Close-Up',
            dialogue: isDesi ? `Tum yahan se zinda bahar nahi jaoge.` : `You just crossed the point of no return, kid.`,
          },
        ],
      },
      {
        epNum: 3,
        title: `Episode 3: The Secret Insider`,
        cliffhanger: `Ayla steps forward holding the decryption tablet.`,
        scenes: [
          {
            sNum: 1,
            speaker: supporting,
            listener: hero,
            listenerReaction: 'Shocked to see Ayla in the server vault',
            angle: 'Side-Angle Reveal (Supporting Ally)',
            dialogue: isDesi ? `Leo, ruk jao! Marcus akela nahi hai.` : `Leo, stop! Marcus isn't working alone on this algorithm.`,
          },
          {
            sNum: 2,
            speaker: hero,
            listener: supporting,
            listenerReaction: 'Typing rapidly on tablet, bypassing firewalls',
            angle: 'Two-Shot Ally Framing',
            dialogue: isDesi ? `Ayla? Tum Marcus ke sath mili hui ho?!` : `Ayla? Are you helping Marcus cover this up?!`,
          },
          {
            sNum: 3,
            speaker: supporting,
            listener: hero,
            listenerReaction: 'Eyes widening as biometric lights turn green',
            angle: 'Tight Over-the-shoulder (Ally)',
            dialogue: isDesi ? `Main tumhari jaan bacha rahi hoon. Ye code dekho...` : `I've been undercover for 6 months. Look at this backdoor key...`,
          },
        ],
      },
      {
        epNum: 4,
        title: `Episode 4: The Boardroom Trap`,
        cliffhanger: `The one person Leo trusted hands the decryption key to Marcus.`,
        scenes: [
          {
            sNum: 1,
            speaker: villain,
            listener: supporting,
            listenerReaction: 'Looking down with calculating eyes',
            angle: 'Reverse Angle (Villain)',
            dialogue: isDesi ? `Ayla, decryption drive mere haath mein do.` : `Ayla, hand over the decrypted flash drive now.`,
          },
          {
            sNum: 2,
            speaker: supporting,
            listener: villain,
            listenerReaction: 'Grinning victoriously holding the drive',
            angle: 'Medium Shot (Ally & Villain)',
            dialogue: isDesi ? `Ye lo Marcus. Deal according to plan chalegi.` : `Here it is, Marcus. Just as we agreed in the contract.`,
          },
          {
            sNum: 3,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Laughing quietly with supreme arrogance',
            angle: 'Hero Heartbreak Close-Up',
            dialogue: isDesi ? `Ayla, tumne bhi deal kar li... Lekin tum dono phas chuke ho.` : `You took the money, Ayla... but you both forgot who wrote the encryption.`,
          },
        ],
      },
      {
        epNum: 5,
        title: `Episode 5: The Counter-Attack`,
        cliffhanger: `A red emergency override alarm flashes across all studio screens.`,
        scenes: [
          {
            sNum: 1,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Frowning as monitor lights flash red',
            angle: 'Hero Command Angle',
            dialogue: isDesi ? `System override active ho chuka hai. 60 seconds hain tumhare paas.` : `Override protocol initiated. You have exactly 60 seconds before global broadcast.`,
          },
          {
            sNum: 2,
            speaker: villain,
            listener: hero,
            listenerReaction: 'Smiling calmly with hands on desk',
            angle: 'Villain Panicking Close-Up',
            dialogue: isDesi ? `Tum pagal ho chuke ho! Company barbaad ho jayegi!` : `You've lost your mind! You'll destroy the entire enterprise!`,
          },
          {
            sNum: 3,
            speaker: supporting,
            listener: villain,
            listenerReaction: 'Realizing he got played by both of them',
            angle: 'Supporting Ally Reveal',
            dialogue: isDesi ? `Barbaad company nahi hogi Marcus, sirf tumhara jhoot hoga.` : `Not the company, Marcus. That drive was a tracking beacon.`,
          },
        ],
      },
      {
        epNum: 6,
        title: `Episode 6: The Final Showdown`,
        cliffhanger: `The boardroom doors slam open with federal agents on the steps.`,
        scenes: [
          {
            sNum: 1,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Standing frozen in corner as lights spotlight him',
            angle: 'Wide Boardroom Hero Shot',
            dialogue: isDesi ? `Khel khatam, Marcus. Board live sun raha hai.` : `Game over, Marcus. The board and the press have been listening for 10 minutes.`,
          },
          {
            sNum: 2,
            speaker: villain,
            listener: hero,
            listenerReaction: 'Arms crossed standing next to Ayla',
            angle: 'Low Angle Villain Defeat',
            dialogue: isDesi ? `Tumhe lagta hai tum jeet gaye? Ye to sirf shuruat hai.` : `You think exposing me saves you? You have no idea who actually runs this firm.`,
          },
          {
            sNum: 3,
            speaker: hero,
            listener: villain,
            listenerReaction: 'Being handcuffed by federal security',
            angle: 'Decisive Triumphant Angle',
            dialogue: isDesi ? `Jo bhi ho, kal se chair tumhari nahi hogi.` : `Whoever it is, they're not sitting in your chair tomorrow.`,
          },
        ],
      },
      {
        epNum: 7,
        title: `Episode 7: Season 1 Finale & Twist`,
        cliffhanger: `A mysterious black envelope arrives on Leo's desk marked 'Season 2 - The Architect'.`,
        scenes: [
          {
            sNum: 1,
            speaker: supporting,
            listener: hero,
            listenerReaction: 'Looking at sealed black envelope with golden wax',
            angle: 'Ally Handing Envelope',
            dialogue: isDesi ? `Marcus arrest ho gaya. Lekin ye envelope kis ne bheja?` : `Marcus is in custody. But who delivered this black wax envelope to your desk?`,
          },
          {
            sNum: 2,
            speaker: hero,
            listener: supporting,
            listenerReaction: 'Gasping as camera zooms in on letter',
            angle: 'Hero Unsealing Letter',
            dialogue: isDesi ? `Letter mein likha hai: 'Marcus was just the puppet. Welcome to the real game.'` : `The letter says: 'Marcus was just a pawn. Welcome to the real boardroom.'`,
          },
          {
            sNum: 3,
            speaker: hero,
            listener: supporting,
            listenerReaction: 'Camera pulls back into cinematic darkness',
            angle: 'Season Finale Dramatic Pull-Back',
            dialogue: isDesi ? `Season 2 shuru hota hai ab... Follow for Part 8!` : `Season 2 begins now. Hit follow for the next chapter!`,
          },
        ],
      },
    ];

    const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const days: DayContent[] = episodeTemplates.map((ep, idx) => {
      const emotionalTrigger = EMOTIONAL_TRIGGERS[idx % EMOTIONAL_TRIGGERS.length];

      const masterKeyframePrompt = `Hyper-realistic 9:16 vertical cinematic Three-Shot: On Screen-Left, ${hero.visualAnchor}. On Screen-Right, ${villain.visualAnchor}. In Background, ${supporting.visualAnchor}. Moody high-contrast corporate glass boardroom at night, rainy window reflections, single dramatic overhead spotlight, 8k Unreal Engine 5 render.`;

      const scenes: Scene[] = ep.scenes.map((s) => ({
        sceneNumber: s.sNum,
        duration: s.sNum === 1 ? '0-10s' : (s.sNum === 2 ? '10-20s' : '20-30s'),
        phase: s.sNum === 1 ? 'Hook & Incident (0-10s)' : (s.sNum === 2 ? 'Confrontation (10-20s)' : 'Cliffhanger Climax (20-30s)'),
        speaker: s.speaker.name,
        speakerRole: s.speaker.role,
        listenerName: s.listener.name,
        listenerReaction: s.listenerReaction,
        cameraAngleType: s.angle,
        visualPrompt: `[Strict Speaker Isolation]: ${s.angle} focusing on ${s.speaker.name} (${s.speaker.roleLabel}), animated mouth articulating spoken dialogue with high dramatic intensity. In background, ${s.listener.name} stays completely silent, reacting with: ${s.listenerReaction}.`,
        facialExpression: s.speaker.role === 'protagonist' ? 'Determined piercing gaze, sharp micro-nod' : (s.speaker.role === 'antagonist' ? 'Cynical smirk, cold predatory eyes' : 'Intense calculating expression, scanning room'),
        bodyLanguage: s.speaker.role === 'protagonist' ? 'Stepping firmly forward, decisive gesture' : (s.speaker.role === 'antagonist' ? 'Leaning back, adjusting cuffs' : 'Holding tablet, whispering urgently'),
        eyeContactCue: s.sNum === 3 ? 'Locks direct unblinking eye contact into camera for final 2.5s cliffhanger retention' : 'Intense eye contact locked with scene partner',
        actingDirection: `Speaks with crisp pacing and razor-sharp emotional clarity.`,
        dialogue: s.dialogue,
        alternateHooks: s.sNum === 1 ? [
          s.dialogue,
          `"Your time expired 10 seconds ago, Marcus."`,
          `"Look at the screen, Marcus. The board already knows."`,
        ] : undefined,
        cameraMotion: s.sNum === 1 ? 'Slow forward push-in' : (s.sNum === 2 ? 'Reverse angle parallax cut' : 'Dramatic tension dolly zoom'),
        lightingAndMood: 'High-contrast cyan rim light contrasting with moody amber key light',
      }));

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

  generateSmartMockPlan(profile: CreatorProfile, vaultItems: VaultItem[]): WeeklyPlan {
    const daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const isTalkingObject = profile.archetype === 'talking_object';
    const isHuman = profile.archetype === 'human_influencer';
    const isDesi = profile.language === 'roman_urdu_hindi';

    const days: DayContent[] = daysNames.map((dayName, index) => {
      const emotionalTrigger = EMOTIONAL_TRIGGERS[index % EMOTIONAL_TRIGGERS.length];
      const viralScore = Math.floor(94 + Math.random() * 5);

      if (isTalkingObject) {
        return this.createTalkingObjectDay(index + 1, dayName, profile, emotionalTrigger, viralScore, isDesi);
      } else if (isHuman) {
        return this.createHumanInfluencerDay(index + 1, dayName, profile, emotionalTrigger, viralScore, isDesi);
      } else {
        return this.createFacelessDay(index + 1, dayName, profile, emotionalTrigger, viralScore, isDesi);
      }
    });

    return {
      id: `plan_${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      archetype: profile.archetype,
      productionMode: 'standalone_daily',
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

  createTalkingObjectDay(
    dayNum: number,
    dayName: string,
    profile: CreatorProfile,
    emotionalTrigger: any,
    viralScore: number,
    isDesi: boolean
  ): DayContent {
    const object = profile.objectName || 'Ceramic Coffee Mug';
    const refPrefix = profile.hasReferenceImage ? '[Reference Image Mode]: Using the uploaded master character photo, ' : '';

    const conceptsEn = [
      {
        title: `The "Always Available" Trap: Why You Get Replaced in 48 Hours`,
        hooks: [
          `Bro, you answered an email at 11 PM for a job that would replace you before your coffee gets cold.`,
          `Nobody tells you this: The more available you are, the less valuable you become.`,
          `Did your boss text 'urgent question' this weekend? If you reply now, you're doomed.`,
        ],
        scene2: `High-value people are never accessible on demand. When you make yourself cheap, they treat you like plastic.`,
        scene3: `Close the laptop. Your self-respect left the chat, but you can still save tomorrow. Follow for your daily reality check.`,
        bgm: `Lo-fi melancholic Rhodes piano chords at 85 BPM with punchy subtle bass drop at 0:07s.`,
      },
      {
        title: `Why Hard Workers Stay Broke While "Lazy" People Get Promoted`,
        hooks: [
          `You think 10 hours of silent hard work gets you promoted? The guy who talked for 10 minutes just took your bonus.`,
          `Brutal corporate truth: Hard work without visibility is just unpaid labor.`,
          `Stop being the 'reliable workhorse'. The horse never becomes the jockey.`,
        ],
        scene2: `Competence gets you hired, but visibility gets you paid. Stop hiding behind spreadsheets and start showing value.`,
        scene3: `Work smart, make noise, and stop waiting for a savior. Share this with a coworker who needs this wake-up call.`,
        bgm: `Dark moody synth bassline at 110 BPM with energetic clock tick percussion.`,
      },
    ];

    const conceptsDesi = [
      {
        title: `Weekend Pe Boss Ka 'Urgent Call': Zindagi Bachane Ka 3-Second Rule`,
        hooks: [
          `Bhai, raat 11 baje tumne boss ka email reply kardia? Wo job jo tumhein 2 din mein replace kardegi!`,
          `Corporate life ka sab se bara jhoot: 'Hmari company ek family hai'. Bhai family weekend pe over-time nahi karwati!`,
          `Agar boss ka Saturday ko 'Quick question' ka msg aaye, to 3 second tak phone mat uthana.`,
        ],
        scene2: `Jab tum har waqt available rehte ho na, to log tumhari value khatam samajhte hain. Thori boundary rakhna seekho.`,
        scene3: `Laptop band karo aur sukoon lo. Self-respect bachao aur daily reality check ke liye follow karo!`,
        bgm: `Lo-fi desi fusion chill beat with subtle sitar plucks and modern hip-hop groove.`,
      },
    ];

    const concepts = isDesi ? conceptsDesi : conceptsEn;
    const pick = concepts[(dayNum - 1) % concepts.length];

    const baseScenes: Scene[] = [
      {
        sceneNumber: 1,
        duration: '0-10s',
        phase: 'Hook (0-10s)',
        speaker: 'Bob the Mug',
        speakerRole: 'protagonist',
        visualPrompt: `${refPrefix}Extreme close-up macro shot of ${object} resting on desk at 2:00 AM, screen reflection in ceramic glaze, 3D animated mouth with expressive lip-sync, volumetric warm lamp glow.`,
        facialExpression: 'Exhausted deadpan micro-frown, raising left cartoon eyebrow in sarcastic disbelief, subtle mouth twitch',
        bodyLanguage: 'Subtle forward lean on the desk with tiny steam swirl mimicking a sigh of exhaustion',
        eyeContactCue: 'Piercing unblinking direct eye contact into the camera lens for the first 3.5 seconds to lock hook retention',
        actingDirection: `Stares straight into the camera lens with squinting tired eyes, speaks with razor-sharp comedic clarity.`,
        dialogue: pick.hooks[0],
        alternateHooks: pick.hooks,
        cameraMotion: 'Slow 24fps push-in zoom with anamorphic depth of field',
        lightingAndMood: 'Volumetric warm desk lamp glow with moody dark room background',
      },
      {
        sceneNumber: 2,
        duration: '10-20s',
        phase: 'Retention & Build-up (10-20s)',
        speaker: 'Bob the Mug',
        speakerRole: 'protagonist',
        visualPrompt: `${refPrefix}Dynamic smooth rotation around ${object}, showing realistic textures, 3D animated lips moving in sync with speech, blue ambient rim lighting.`,
        facialExpression: 'Knowing condescending smirk, wide expressive eyes softening into relatable empathy',
        bodyLanguage: 'Gentle tilt to the left side, handle shifting subtly as if shaking head at the viewer',
        eyeContactCue: 'Maintains locked eye contact while speaking, breaking gaze for 0.5s to glance at off-screen laptop then snapping back',
        actingDirection: `Tilts slightly, raising tiny cartoon eyebrow, direct continuous eye contact with viewer.`,
        dialogue: pick.scene2,
        cameraMotion: 'Subtle parallax rotation around object, keeping face locked in center',
        lightingAndMood: 'Deep blue rim light contrasting with amber key light',
      },
      {
        sceneNumber: 3,
        duration: '20-30s',
        phase: 'Climax & CTA (20-30s)',
        speaker: 'Bob the Mug',
        speakerRole: 'protagonist',
        visualPrompt: `${refPrefix}Hero low-angle close up of ${object}, steam rising decisively, crisp shutter speed.`,
        facialExpression: 'Confident triumphant grin, relaxed eyebrow arch, authoritative nod',
        bodyLanguage: 'Standing tall and upright on desk surface, steam pulsing rhythmically with punchline words',
        eyeContactCue: 'Direct locked eye contact with viewer, ending with a charming micro-wink on the final call-to-action',
        actingDirection: `Nods knowingly, slight smirk forming on 3D lips.`,
        dialogue: pick.scene3,
        cameraMotion: 'Low angle steady camera with gradual pull back',
        lightingAndMood: 'Golden hour dramatic backlight with high contrast',
      },
    ];

    return {
      dayNumber: dayNum,
      dayName,
      title: pick.title,
      angleArchetype: emotionalTrigger.label,
      emotionalTrigger,
      viralScore,
      targetEmotion: emotionalTrigger.algorithmicGoal,
      videoFormatMode: profile.videoFormatMode,
      masterKeyframePrompt: `Hyper-realistic 9:16 vertical macro shot of ${profile.characterDna}, cinematic lighting, photorealistic textures, 8k resolution, Unreal Engine 5 render style.`,
      bgmPrompt: pick.bgm,
      scenes: baseScenes,
      platformMetadata: {
        instagram: {
          hookCaption: isDesi ? `Ye baat har 9-to-5 bande ko samajh leni chahiye ☕👇` : `Listen to the mug before you burn out ☕👇`,
          bodyCaption: `${pick.title}.\n\nStop trading your mental peace for people who view you as an expense item.\n\nTake your power back today.`,
          hashtags: ['#talkingobject', '#corporatelife', '#mindsetshift', '#workplacehumor', '#selfworth'],
          callToAction: 'Tag that one coworker who needs this wake-up call today! 👇',
        },
        tiktok: {
          textOverlayHook: isDesi ? `CORPORATE KA SUB SE BARA JHOOT 😳` : `THE UNCOMFORTABLE TRUTH ABOUT BEING TOO AVAILABLE 😳`,
          caption: `${pick.title} #corporatehumor #relatable #viral #careeradvice #mindset`,
          seoKeywords: ['career burnout', 'corporate humor', 'talking object animation', 'boundary setting'],
          audioVibe: 'Sarcastic / Chill Lo-Fi Voiceover vibe with punchy beats',
        },
        youtubeShorts: {
          title: `${pick.title} #shorts`,
          description: `Brutal career truth in 30 seconds. Subscribe for daily wisdom with attitude.`,
          tags: ['shorts', 'career', 'motivation', 'humor', 'animation'],
          pinnedComment: 'What is the worst advice your boss ever gave you? Let’s talk in the comments!',
        },
        threads: {
          threadPost: `Unpopular opinion: Being reachable 24/7 doesn't make you valuable, it makes you disposable. High performers protect their calendar like their life depends on it. Agree or disagree?`,
        },
        pinterest: {
          pinTitle: `${pick.title} - Career Wisdom`,
          pinDescription: `Stop overworking for people who won't remember. Here is why setting strict boundaries is the single greatest career move you will ever make.`,
          suggestedBoard: 'Career Mindset & Growth',
          keywords: ['work boundaries', 'career tips', 'mental clarity', 'workplace motivation'],
        },
        facebook: {
          storyCaption: `One of the most valuable lessons you can learn in life is that not everything deserves your reaction. Silence is often the loudest statement you can make.`,
        },
      },
    };
  },

  createHumanInfluencerDay(
    dayNum: number,
    dayName: string,
    profile: CreatorProfile,
    emotionalTrigger: any,
    viralScore: number,
    isDesi: boolean
  ): DayContent {
    const dna = profile.characterDna;
    const refPrefix = profile.hasReferenceImage ? '[Reference Image Mode]: Using the uploaded master character photo, ' : '';

    const conceptsEn = [
      {
        title: `The 3-Step AI Workflow That Replaced My 8-Hour Workday`,
        hooks: [
          `Most people are still using AI like a glorified search engine. Here is the exact system that saves me 25 hours a week.`,
          `If you are working 10 hours a day in 2026, you are not working hard, you are working outdated.`,
          `Stop asking ChatGPT to write full articles. Here is what top 1% creators actually do.`,
        ],
        scene2: `Stop asking AI to "write an article". Instead, chain specialized models for research, drafting, and micro-editing in a continuous pipeline.`,
        scene3: `I’ve documented the complete workflow in my bio. Comment 'FLOW' and I’ll send you the exact prompt templates.`,
        bgm: `Deep cinematic tech house beat at 122 BPM, sleek bass pluck, atmospheric reverbs.`,
        lifestylePrompt: `Aesthetic candid Instagram photo of ${dna}, sitting in an ultra-modern minimalist coffee boutique with laptop, warm natural sunlight, 35mm film photography style, 8k resolution.`,
        lifestyleCaption: `Mastering leverage is the only cheat code in the modern economy. Working 12 hours isn't a badge of honor anymore—building smart systems is. ☕✨`,
      },
    ];

    const pick = conceptsEn[0];

    return {
      dayNumber: dayNum,
      dayName,
      title: pick.title,
      angleArchetype: emotionalTrigger.label,
      emotionalTrigger,
      viralScore,
      targetEmotion: emotionalTrigger.algorithmicGoal,
      videoFormatMode: profile.videoFormatMode,
      masterKeyframePrompt: `Ultra-high-definition 9:16 vertical master keyframe portrait of ${dna}, photorealistic skin textures, studio lighting, 8k resolution, podcast setup.`,
      bgmPrompt: pick.bgm,
      lifestylePhotoPrompt: pick.lifestylePrompt,
      lifestyleCaption: pick.lifestyleCaption,
      scenes: [
        {
          sceneNumber: 1,
          duration: '0-10s',
          phase: 'Hook (0-10s)',
          speaker: profile.name,
          speakerRole: 'protagonist',
          visualPrompt: `${refPrefix}Cinematic 9:16 vertical framing of ${dna}, sitting behind podcast mic in aesthetic studio, holding espresso cup, looking directly into camera.`,
          facialExpression: 'Charismatic confident micro-smile with slight head tilt, eyebrow raised with curiosity',
          bodyLanguage: 'Leaning forward on studio table, holding espresso cup naturally, open chest posture',
          eyeContactCue: 'Piercing locked eye contact with camera lens for first 3 seconds, natural blinking',
          actingDirection: `Direct piercing eye contact with camera lens, confident natural smile, speaks smoothly with charismatic cadence.`,
          dialogue: pick.hooks[0],
          alternateHooks: pick.hooks,
          cameraMotion: 'Smooth eye-level tracking push-in, 24fps anamorphic lens',
          lightingAndMood: 'Warm studio lighting with soft diffused fill light',
        },
        {
          sceneNumber: 2,
          duration: '10-20s',
          phase: 'Retention & Build-up (10-20s)',
          speaker: profile.name,
          speakerRole: 'protagonist',
          visualPrompt: `${refPrefix}Medium-shot of ${dna} gesturing naturally towards laptop on studio table, golden rim light accentuating hair texture, photorealistic skin pores.`,
          facialExpression: 'Engaging storytelling intensity, warm smile as key insight is delivered',
          bodyLanguage: 'Open hand gestures emphasizing 3 steps, rhythmic body swaying with speech cadence',
          eyeContactCue: 'Glares down at laptop screen for 1 second, then looks directly back up into the viewer’s eyes',
          actingDirection: `Passionate storytelling body language, slight head tilt with engaging direct gaze.`,
          dialogue: pick.scene2,
          cameraMotion: 'Steady medium framing with subtle parallax drift',
          lightingAndMood: 'High-end studio rim lighting with deep cinematic shadows',
        },
        {
          sceneNumber: 3,
          duration: '20-30s',
          phase: 'Climax & CTA (20-30s)',
          speaker: profile.name,
          speakerRole: 'protagonist',
          visualPrompt: `${refPrefix}Crisp slow zoom-in on ${dna} looking straight at viewer, sunset reflections in eyes, luxury aesthetic backdrop.`,
          facialExpression: 'Enthusiastic authoritative smile, decisive head nod',
          bodyLanguage: 'Pointing subtly towards camera with gentle smile, leaning in close',
          eyeContactCue: 'Direct locked eye contact that doesn’t break until video ends',
          actingDirection: `Smiles confidently, giving a decisive nod of authority.`,
          dialogue: pick.scene3,
          cameraMotion: 'Low angle hero shot with slow cinematic zoom-in',
          lightingAndMood: 'Warm ambient backlight with sparkling eye catchlights',
        },
      ],
      platformMetadata: {
        instagram: {
          hookCaption: `The secret to working 4 hours instead of 12 👇✨`,
          bodyCaption: `${pick.title}.\n\nStop trading your health and time for manual tasks when AI workflows can automate 80% of the friction.\n\nSave this for your next project batch!`,
          hashtags: ['#aicreator', '#digitalnomad', '#productivityhack', '#creatorgrowth', '#modernlifestyle'],
          callToAction: `Comment "PROMPTS" and I'll DM you the complete breakdown! 💬`,
        },
        tiktok: {
          textOverlayHook: `THE AI WORKFLOW THAT SAVED ME 25 HOURS A WEEK 🤫`,
          caption: `${pick.title} #aiworkflows #creatorgrowth #productivity #techlifestyle #solopreneur`,
          seoKeywords: ['AI workflow automation', 'creator productivity', 'digital creator lifestyle'],
          audioVibe: 'Sleek luxury electronic beat / high retention sound',
        },
        youtubeShorts: {
          title: `${pick.title} #shorts`,
          description: `How modern creators leverage AI systems to scale content without burning out. Subscribe for weekly breakdowns.`,
          tags: ['shorts', 'ai', 'productivity', 'lifestyle', 'business'],
          pinnedComment: 'What is the single most time-consuming part of your day right now? Drop it below!',
        },
        threads: {
          threadPost: `The biggest mistake new creators make: Trying to do everything manually in 2026. If you are not using AI to script, outline, and schedule, you are competing with one hand tied behind your back.`,
        },
        pinterest: {
          pinTitle: `${pick.title} - AI Creator Guide`,
          pinDescription: `Step-by-step workflow to automate content creation and scale your online brand effortlessly with AI tools.`,
          suggestedBoard: 'Digital Marketing & AI Tools',
          keywords: ['AI tools', 'content creation tips', 'aesthetic lifestyle', 'business strategy'],
        },
        facebook: {
          storyCaption: `For the longest time, I thought being exhausted was proof of hard work. Then I realized the smartest creators don't work harder—they design better systems. Here is what changed everything for me.`,
        },
      },
    };
  },

  createFacelessDay(
    dayNum: number,
    dayName: string,
    profile: CreatorProfile,
    emotionalTrigger: any,
    viralScore: number,
    isDesi: boolean
  ): DayContent {
    return {
      dayNumber: dayNum,
      dayName,
      title: `The 3-Second Psychological Trick to Command Any Room`,
      angleArchetype: emotionalTrigger.label,
      emotionalTrigger,
      viralScore,
      targetEmotion: emotionalTrigger.algorithmicGoal,
      videoFormatMode: profile.videoFormatMode,
      masterKeyframePrompt: `Cinematic 9:16 portrait of a dark marble statue emerging from obsidian shadows, single golden spotlight, rain droplets on dark glass background, 8k resolution noir aesthetic.`,
      bgmPrompt: `Dark ambient drone with intense cinematic sub-bass pulse at 75 BPM, ticking clock sound effect building tension.`,
      scenes: [
        {
          sceneNumber: 1,
          duration: '0-10s',
          phase: 'Hook (0-10s)',
          keyframeImagePrompt: 'Cinematic 9:16 portrait of dark marble statue in golden spotlight',
          visualPrompt: `Dramatic slow push-in through volumetric rain against a high-rise glass window at night, city lights blurring in bokeh, elegant dark sculpture in foreground.`,
          facialExpression: 'Stoic stone carving expression with sharp golden rim light tracing carved jawline',
          bodyLanguage: 'Rigid immovable posture conveying absolute authority',
          eyeContactCue: 'Statue eyes appear to stare through the camera directly into viewer soul',
          actingDirection: `Narrator voice with deep authoritative resonance, precise pauses after key statements.`,
          dialogue: `The most powerful person in any room is never the loudest. They are the one who knows when to remain silent.`,
          alternateHooks: [
            `The most powerful person in any room is never the loudest. They are the one who knows when to remain silent.`,
            `When someone insults you, do not react. Pause for 3 seconds, look in their eye, and say nothing.`,
            `Why do high-status men speak 50% less than everyone else? Because silence is psychological dominance.`,
          ],
          cameraMotion: 'Slow forward dolly with subtle atmospheric fog',
          lightingAndMood: 'Deep low-key shadows with sharp gold edge lighting',
        },
        {
          sceneNumber: 2,
          duration: '10-20s',
          phase: 'Retention & Build-up (10-20s)',
          keyframeImagePrompt: 'Macro shot of dark obsidian chess board with black king in haze',
          visualPrompt: `Macro shot of chess pieces on an obsidian board, a black king moving forward through cinematic haze, shallow depth of field.`,
          facialExpression: 'High contrast shadows moving across marble texture',
          bodyLanguage: 'Steady deliberate physical movement across the chessboard',
          eyeContactCue: 'Focus tracks moving king piece before snapping to wide center frame',
          actingDirection: `Hypnotic delivery speed with intentional 1-second pause before delivering the punchline.`,
          dialogue: `When someone insults or tests you, pause for exactly 3 seconds, look into their left eye, and say nothing. Watch their confidence dissolve.`,
          cameraMotion: 'Dynamic low angle tracking across the board',
          lightingAndMood: 'High contrast dramatic spotlight',
        },
        {
          sceneNumber: 3,
          duration: '20-30s',
          phase: 'Climax & CTA (20-30s)',
          keyframeImagePrompt: 'Rising aerial view through shadowy gothic pillars and golden light',
          visualPrompt: `Rising aerial view through shadowy gothic pillars, golden light piercing the center, dramatic cinematic grade.`,
          facialExpression: 'Majestic timeless stone expression',
          bodyLanguage: 'Ascending motion creating a sense of grand philosophical ascension',
          eyeContactCue: 'Wide shot pulling back into infinite depth',
          actingDirection: `Decisive concluding tone that demands attention.`,
          dialogue: `Silence isn't weakness—it is supreme psychological control. Follow the dark path to master human nature.`,
          cameraMotion: 'Ascending high angle crane shot',
          lightingAndMood: 'Obsidian dark palette with golden highlights',
        },
      ],
      platformMetadata: {
        instagram: {
          hookCaption: `Master the art of silent dominance ♟️👇`,
          bodyCaption: `The 3-Second Psychological Trick.\n\nNever react emotionally to disrespect. When you pause and control your gaze, you force the other person to feel the weight of their own words.\n\nSave this for when you need it.`,
          hashtags: ['#darkpsychology', '#mindset', '#stoic', '#powerlaws', '#bodylanguage'],
          callToAction: `Save this post and drop a ♟️ if you understand the power of silence.`,
        },
        tiktok: {
          textOverlayHook: `THE 3-SECOND SILENCE TRICK THAT DISARMS ANYONE ♟️`,
          caption: `How to win without saying a word #darkpsychology #stoicism #mindset #sigma #bodylanguage`,
          seoKeywords: ['dark psychology tricks', 'body language dominance', 'stoic discipline'],
          audioVibe: 'Deep atmospheric dark phonk / slowed synth sound',
        },
        youtubeShorts: {
          title: `The 3-Second Psychological Trick To Command Any Room #shorts`,
          description: `Learn the subtle art of psychological dominance and silent frame control. Subscribe for daily power principles.`,
          tags: ['shorts', 'psychology', 'stoic', 'mindset', 'power'],
          pinnedComment: 'Have you ever used the silent pause in a real argument? How did they react?',
        },
        threads: {
          threadPost: `Weak people react immediately. Strong people observe, pause, and respond with calibrated precision. Your calm is your superpower.`,
        },
        pinterest: {
          pinTitle: `The Psychology of Silent Power`,
          pinDescription: `Master body language and emotional control with these timeless principles of psychological discipline.`,
          suggestedBoard: 'Mindset & Psychology',
          keywords: ['dark psychology', 'body language tips', 'stoic quotes', 'mental mastery'],
        },
        facebook: {
          storyCaption: `One of the most valuable lessons you can learn in life is that not everything deserves your reaction. Silence is often the loudest statement you can make.`,
        },
      },
    };
  },
};
