import { StorySpec, ClipPrompt, InUniversePostBundle } from '@/types';
import { generateLocationAnchorPrompt, enforceSpatialBlocking } from '../rules/spatial';
import { generateSecBySecTimeline, buildCinematicFlowVeoPrompt } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';

export function buildCharacterDramaClips(
  spec: StorySpec,
  dayEmotion: string,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook',
  dayNum: number = 1
): {
  title: string;
  hookDescription: string;
  clips: ClipPrompt[];
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  dialogueScript: { speaker: string; line: string; timing: string }[];
  inUniversePosts?: InUniversePostBundle;
} {
  const noirDefaults = [
    {
      id: 'char-julian',
      name: 'Julian Vance',
      role: 'Hero' as const,
      description: '32yo high-profile corporate defense attorney fighting betrayal from within.',
      dnaPrompt: 'Original fictional character, 32-year-old aristocratic man with distinct non-celebrity digital human facial structure, sharp chiseled jawline, intense deep-set dark obsidian eyes, slicked-back charcoal pompadour hair, light tailored 5 o\'clock shadow, sharp cheekbones. Tailored charcoal bespoke three-piece wool suit, crisp white spread collar, silk slate-gray tie. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Stoic, razor-sharp intellect, fierce restrained anger'
    },
    {
      id: 'char-elena',
      name: 'Elena Sterling',
      role: 'Villain' as const,
      description: '30yo ruthless venture partner orchestrating an aggressive hostile takeover.',
      dnaPrompt: 'Original fictional character, 30-year-old cold and calculating woman with distinct non-celebrity digital human facial structure, chiseled symmetrical cheekbones, piercing icy-hazel eyes, slicked-back raven hair in an immaculate low chignon, flawless matte porcelain complexion, subtle plum lipstick. Minimalist structured midnight-navy double-breasted designer blazer with platinum cuff buttons. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Unflinching, icy composure, dismissive smirk, calculating'
    }
  ];

  const char1 = spec.cast[0] || noirDefaults[0];
  const char2 = spec.cast[1] || noirDefaults[1];
  const location = spec.locationSettings[0] || 'Penthouse Study at Night';
  const season = spec.seasonNumber || 1;

  // Hollywood Noir Episodic Tangible Clue Dictionary with Dynamic Story Pacing
  interface PlotClipDef {
    speakerName: string;
    silentNames: string[];
    dialogue: string;
    action: string;
    shotType: 'Shot-Reverse-Shot Close-Up' | 'Over-the-Shoulder' | 'Master Wide';
    sceneName: string;
    cameraSetup?: string;
  }

  interface PlotData {
    title: string;
    hook: string;
    clips: PlotClipDef[];
  }

  const season1Plots: Record<number, PlotData> = {
    1: {
      title: `Ep 1: The Forged Will - ${char1.name} vs ${char2.name}`,
      hook: `A fast-paced 30s confrontation over 40% stolen company shares and a forged vault authorization.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `At exactly 2:14 AM, forty percent of our family shares were transferred out of the trust... and the digital vault authorization was in your hands, ${char2.name}.`,
          action: `Medium close-up on ${char1.name} in ${location}. He deliberately places a sealed black folder containing the forged share transfer onto the dark mahogany desk, eyes locked with calm intensity on ${char2.name}.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Forged Will - Accusation`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Those signatures weren't forged, ${char1.name}. Your father authorized that emergency transfer himself because he knew your reckless pride would pull this firm into bankruptcy.`,
          action: `Tight reverse medium shot on ${char2.name} in ${location}. She slowly lifts her chin, completely unfazed, smoothly sliding a signed trust authorization form across the desk with icy composure.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Forged Will - Rebuttal`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `If my father authorized it, ${char2.name}... then why does the vault CCTV footage show you deleting the backup logs with Marcus Kane standing beside you?`,
          action: `Over-the-shoulder dramatic standoff in ${location}. ${char1.name} grabs the frosted glass door handle, turning his neck back with piercing intensity to deliver the CCTV revelation.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Forged Will - Cliffhanger`,
        },
      ],
    },
    2: {
      title: `Ep 2: The Erased Drive - ${char1.name} vs ${char2.name}`,
      hook: `A 30s investigation into the erased security drive and the secret payout to fixer Marcus Kane.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Marcus Kane wasn't deleting the backup logs, ${char1.name}. He was extracting the encrypted ledger before someone inside this firm could wipe the evidence forever.`,
          action: `Medium close-up on ${char1.name} in ${location}. He places a high-resolution surveillance photo of Marcus Kane in the vault right in front of ${char2.name}.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Erased Drive - Investigation`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Marcus is a confidential fixer who trades classified corporate intelligence to the highest bidder! Who wired fifty million dollars to his offshore account, ${char2.name}?`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She folds her arms calmly over her structured navy blazer, meeting his gaze without a flicker of panic.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Erased Drive - Strategic Inquiry`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `The wire transfer didn't come from a stranger, ${char1.name}. It originated from an offshore account in Zurich registered under your mother's maiden name.`,
          action: `Over-the-shoulder shot in ${location}. ${char1.name} stiffens in disbelief, staring at the Zurich bank routing sheet before stepping into the shadow.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Erased Drive - Zurich Revelation`,
        },
      ],
    },
    3: {
      title: `Ep 3: The Blackmail Recording - ${char1.name} vs ${char2.name}`,
      hook: `A deep 40s scene where an encrypted penthouse audio file exposes high-level judicial corruption.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `I received an encrypted audio file thirty minutes ago. Listen to the background acoustic frequency... that was recorded inside this exact penthouse last Thursday.`,
          action: `Medium close-up on ${char1.name} in ${location}. He presses play on a titanium voice recorder resting on the glass coffee table, low audio hiss filling the room.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Blackmail Recording - Playback`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Stop digging into that recording, ${char1.name}! If that audio reaches the federal grand jury, everyone holding equity in this company goes to federal prison.`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She abruptly steps forward, right hand pressing firmly down onto the recorder to stop playback, jaw clenched.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Blackmail Recording - Desperate Stop`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `You didn't stop it because of the stock, Elena. You stopped it because the second voice on that tape belongs to Federal Judge Arthur Morrison.`,
          action: `Medium shot on ${char1.name} in ${location}. He unplugs the backup audio speaker, looking directly into ${char2.name}'s eyes as the judge's voice rings clear.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Blackmail Recording - Judge Identified`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Then listen carefully: Judge Morrison gave us forty-eight hours to revoke the original trust documents, or we both lose our legal credentials and corporate authority forever.`,
          action: `Over-the-shoulder dramatic composition in ${location}. ${char2.name} backs against the rain-drenched glass window, pale and rigid, delivering the federal countdown.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Blackmail Recording - Urgent Countdown`,
        },
      ],
    },
    4: {
      title: `Ep 4: The Midnight Exchange - ${char1.name} vs ${char2.name}`,
      hook: `A 30s standoff over a cold-storage flash drive containing thirty thousand unredacted bribes.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `The drive is in my coat pocket. Thirty thousand unredacted transactions showing every single bribe paid to the state regulatory commission.`,
          action: `Medium close-up on ${char1.name} in ${location}. He pulls a brushed-metal military-grade flash drive from his charcoal wool coat, holding it under the desk lamp.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Midnight Exchange - Flash Drive`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `You hand that drive over, and you terminate our careers forever. The chairman himself authorized those transactions five years ago to keep us protected.`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She glares at the drive, a sharp intake of breath signaling the realization of total exposure.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Midnight Exchange - Executive Risk`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Then take the keys to the underground vault. Because in ninety seconds, the building's lockdown protocol activates and locks both of us inside.`,
          action: `Over-the-shoulder shot in ${location}. ${char1.name} clicks the remote lock button, heavy metallic deadbolts engaging with an ominous echo.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Midnight Exchange - Vault Lockdown`,
        },
      ],
    },
    5: {
      title: `Ep 5: Safety Deposit Box 409 - ${char1.name} vs ${char2.name}`,
      hook: `A 40s scene revealing the drilled-out Geneva vault and an impossible biometric signature.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `We stood outside safety deposit box 409 this morning. The titanium lock was drilled out from the inside. Where is my father's original handwritten will?`,
          action: `Medium close-up on ${char1.name} in ${location}. He places a broken biometric sensor card onto the table, hairline fractures running through the glass chip.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `Box 409 - Broken Chip`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `I didn't touch box 409, ${char1.name}! Someone with registered biometric clearance emptied that locker two hours before our flight touched down in Geneva.`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She turns pale, her eyes widening slightly as the impossibility of the biometric log sinks in.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `Box 409 - Alibi`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Look at the digital log printout, Elena. The scan registered a retinal match that only exists in one person's optical medical records.`,
          action: `Medium shot on ${char1.name} in ${location}. He slides the retinal match log sheet across the mahogany table into the circle of lamp light.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `Box 409 - Retinal Scan`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `There are only two people alive registered to that vault... you, and the founder you swore had permanently resigned three years ago!`,
          action: `Over-the-shoulder shot in ${location}. ${char1.name} leans in, voice dropping to a tense whisper before turning sharply toward the rain-soaked window.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `Box 409 - Founder Resignation Revelation`,
        },
      ],
    },
    6: {
      title: `Ep 6: The Wiretapped Standoff - ${char1.name} vs ${char2.name}`,
      hook: `A 40s sequence where a live federal wiretap and approaching sirens push both partners to the brink.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Every word we spoke in this corridor was intercepted. Look at your phone right now... the call to the federal prosecutor never disconnected.`,
          action: `Medium close-up on ${char1.name} in ${location}. He grabs ${char2.name}'s phone from the counter, showing the live active green call screen running for 47 minutes.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Wiretapped Standoff - Intercept`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `I had to protect myself, ${char1.name}! They promised me full immunity if I delivered the signed confession before the midnight deadline!`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She stumbles back half an inch against the bookshelf, mask of composure finally fracturing into panic.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Wiretapped Standoff - Immunity Confession`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Your immunity deal was revoked twenty minutes ago. The prosecutor used you to pinpoint the GPS coordinates of the master server.`,
          action: `Medium shot on ${char1.name} in ${location}. He turns the phone over to reveal the red revoke alert flashing on the Department of Justice portal.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Wiretapped Standoff - Revocation`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `Look out the window... the sirens have already entered the courtyard, and the tactical elevator is rising right now.`,
          action: `Over-the-shoulder shot in ${location}. ${char1.name} points toward the high-rise balcony as flashing blue and red emergency lights reflect off the ceiling.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Wiretapped Standoff - Sirens Approaching`,
        },
      ],
    },
    7: {
      title: `Ep 7: Season Finale: The Federal Ambush - ${char1.name} vs ${char2.name}`,
      hook: `A grand 50s Season Finale: Tactical raid breach, the master drive trade, and the shocking phone call.`,
      clips: [
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `The building is surrounded. We have ninety seconds before the federal tactical team breaches the private elevators.`,
          action: `Master wide into medium close-up on ${char1.name} in ${location}. Searchlight beams from tactical police helicopters slice through the glass penthouse windows.`,
          shotType: 'Master Wide',
          sceneName: `Season Finale - Tactical Countdown`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Take the master drive through the service tunnel, ${char1.name}! You're the only one left who knows the access keys to the offshore accounts.`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She holds the metal briefcase out with trembling hands, tears threatening her otherwise steely expression.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `Season Finale - Briefcase Handover`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `I'm not running without the truth, ${char2.name}. Look me in the eyes and tell me... was my father really the one who authorized this hostile operation?`,
          action: `Medium close-up on ${char1.name} in ${location}. He stands firm amid the strobe of police sirens, refusing to grab the emergency bug-out bag.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `Season Finale - The Truth Demanded`,
        },
        {
          speakerName: char2.name,
          silentNames: [char1.name],
          dialogue: `Listen... the phone on the desk is ringing. That is a hardwired analog copper line that was disconnected fifteen years ago.`,
          action: `Wide camera tracking shot in ${location}. An antique black rotary phone on the mahogany side table suddenly rings with harsh mechanical clatter.`,
          shotType: 'Dynamic Tracking' as any,
          sceneName: `Season Finale - The Disconnected Phone`,
        },
        {
          speakerName: char1.name,
          silentNames: [char2.name],
          dialogue: `The receiver clicks in my hand... and the voice on the other end speaks: 'Did you really think an offshore disappearance could silence Arthur Vance, son?'`,
          action: `Dramatic over-the-shoulder close-up in ${location}. ${char1.name} lifts the heavy black receiver to his ear as chilling baritone voice speaks; screen abruptly cuts to pitch black at 0:09.5s!`,
          shotType: 'Over-the-Shoulder',
          sceneName: `Season Finale - Arthur Vance Returns (Cut to Black)`,
        },
      ],
    },
  };

  const activePlot = season1Plots[dayNum] || season1Plots[1];

  const title = activePlot.title;
  const hookDescription = activePlot.hook;

  const clips: ClipPrompt[] = activePlot.clips.map((cDef, idx) => {
    const isLast = idx === activePlot.clips.length - 1;
    const activeChar = cDef.speakerName === char2.name ? char2 : char1;
    const silentList = cDef.silentNames.map((name) => (name === char2.name ? char2 : char1));

    const timeline = generateSecBySecTimeline(
      activeChar.name,
      silentList.map((s) => s.name),
      cDef.dialogue,
      cDef.action,
      isLast
        ? 'Heavy footsteps, metallic deadbolt touch, rising suspense string swell, sudden abrupt sub-bass drop.'
        : 'Tension sub-bass drone, sharp prop interaction reverberating in room, continuous rain on glass.',
      undefined,
      isLast
        ? '1-second suspended breath before delivering the final revelation line.'
        : '1.5-second measured dramatic pause; heavy silence, calm breath intake before speech.',
      isLast // ONLY TRUE FOR THE VERY LAST CLIP!
    );

    const flowPrompt = buildCinematicFlowVeoPrompt({
      clipIndex: idx + 1,
      totalClips: activePlot.clips.length,
      sceneName: cDef.sceneName,
      shotType: cDef.shotType,
      locationAnchor: location,
      activeSpeaker: {
        name: activeChar.name,
        dnaPrompt: activeChar.dnaPrompt,
        voiceTone:
          activeChar.role === 'Hero'
            ? 'Intense baritone, authoritative focus, crisp English articulation'
            : 'Poised, cold, resonant feminine cadence, unwavering composure',
      },
      silentCharacters: silentList.map((s) => ({ name: s.name, dnaPrompt: s.dnaPrompt })),
      dialogue: cDef.dialogue,
      cameraSetup:
        cDef.cameraSetup ||
        '85mm cinematic portrait lens, f/1.8 shallow depth of field, anamorphic lens flares from rain streaks on window.',
      lightingTheme:
        'Moody chiaroscuro cinema lighting, deep shadows, warm mahogany reflections, cool blue rim light on jawline.',
      timeline,
      cliffhangerNote: isLast
        ? 'Clip abruptly cuts to black at 0:09.5s on a suspended high-stakes revelation and audio drop.'
        : undefined,
      negativePromptDirectives:
        'morphing, blurred facial features, double heads, unnatural lip sync, low quality, glitching, cartoonish distortion, erratic jitter.',
    });

    return {
      clipIndex: idx + 1,
      totalClips: activePlot.clips.length,
      sceneName: cDef.sceneName,
      locationAnchor: location,
      masterKeyframeLock: `Master frame of ${location}. ${enforceSpatialBlocking(
        activeChar.name,
        silentList.map((s) => s.name)
      )} Rainy window background with soft bokeh.`,
      shotType: cDef.shotType,
      frameImagePrompt: `[VIDEO FRAME IMAGE ${idx + 1}/${activePlot.clips.length} - STARTING KEYFRAME (FLUX / MIDJOURNEY)]:
[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of ${activeChar.name}. Retain 100% exact facial geometry, cheekbone structure, eyes, and hair styling identical to the reference image without alteration or face morphing.
[SCENE BLOCKING & ACTION]: ${cDef.action}
[CINEMATOGRAPHY & LIGHTING]: ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field. Global Hollywood / Netflix Noir aesthetic, high-contrast chiaroscuro lighting, deep venetian blind shadows, warm practicals, atmospheric rain bokeh. Master 8K photorealistic film still.`,
      speakerIsolation: {
        activeSpeaker: activeChar.name,
        speakingDialogue: cDef.dialogue,
        silentCharacters: silentList.map((s) => s.name),
        cameraCutApplied: true,
      },
      timeline,
      flowPromptText: flowPrompt,
      retentionHookReasoning: isLast
        ? 'Abrupt 0:09.5s cutoff on tangible mystery forces audience to binge next episode.'
        : 'Continuous scene momentum with seamless match-cut to counterpart.',
      pacingWordCount: calculateWordCount(cDef.dialogue),
    };
  });

  const inUniverseBundles: Record<number, InUniversePostBundle> = {
    1: {
      btsPost: {
        title: `🎬 Film Set BTS: The Forged Will (Take 4)`,
        angleDescription: `Director monitor angle with ARRI Alexa LF rig and boom mic in soft focus foreground`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: On-set production still of ${char1.name} (original fictional man, distinct non-celebrity digital human, sharp jawline, tailored charcoal suit) seated in the corner of the luxury ${location} set, reviewing a highlighted yellow paper script between takes. In the soft-focus foreground, a professional matte-black ARRI Alexa LF cinema camera on a heavy tripod and sound boom microphone are visible. Cinematic studio stage lighting, C-stands, warm amber practical lights, authentic film crew atmosphere. 35mm film still, Kodak Vision3 500T, subtle film grain, natural depth of field.`,
        caption: `Take 4 of the 02:14 AM trust transfer standoff. Between scenes, staying locked in ${char1.name}'s headspace. The energy on set tonight is electric. 🎬📁`,
        hashtags: ['#FilmSetBTS', '#BehindTheScenes', '#IndieCinema', '#Veo2', '#CharacterDrama', '#Filmmaking'],
      },
      propPost: {
        title: `🔍 Tangible Clue: 40% Forged Share Trust Certificates`,
        clueName: `Embossed Share Transfer Documents & Open Montblanc Pen`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: High-end cinematic macro flat-lay photograph of official corporate share transfer trust certificates dated 02:14 AM spread across a dark polished mahogany desk. An open Montblanc Meisterstück fountain pen rests beside the contested signature line. Deep Venetian blind chiaroscuro shadows slice across the embossed legal gold wax seal. Photorealistic 8K, tactile paper grain, rich ink sheen, ARRI Alexa LF 50mm macro lens, moody noir lighting.`,
        caption: `Evidence Exhibit A: At 02:14 AM, forty percent of the firm's equity moved without board approval. Look closely at the counter-signature. Who authorized it? 🕵️‍♂️📜`,
        hashtags: ['#ForensicClue', '#StoryClue', '#CorporateNoir', '#Whodunnit', '#PlotTwist'],
      },
      candidPost: {
        title: `🌃 In-Universe Set Lore: Penthouse Rain Balcony`,
        moodDescription: `Solitary moment on the rainy terrace overlooking nocturnal skyscraper lights`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char1.name} (original fictional man, distinct non-celebrity digital human, tailored charcoal three-piece suit, slate-gray tie slightly loosened) standing on the wet glass balcony of the ${location} at 2:30 AM. Nocturnal city skyscrapers shrouded in rain fog glow in the background with amber and cyan bokeh. He holds a crystal tumbler of amber drink, staring pensively into the skyline. ARRI Alexa LF, 85mm anamorphic prime lens, high-contrast noir lighting, rain droplets running down glass barrier.`,
        caption: `Some decisions can't be undone once the sun comes up. 2:30 AM above the skyline. 🌧️🥃`,
        hashtags: ['#NoirVibes', '#CinematicMood', '#CharacterLore', '#MidnightThoughts', '#InUniverse'],
      },
    },
    2: {
      btsPost: {
        title: `🎬 Film Set BTS: The Erased Drive Blocking`,
        angleDescription: `Blocking rehearsal with director near dark oak archival filing cabinets`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: On-set production photograph of ${char2.name} (original fictional woman, distinct non-celebrity digital human, structured midnight-navy blazer) listening attentively to director blocking notes near dark oak archival filing cabinets in ${location}. In the background, C-stand lighting equipment, an amber diffusion panel, and a boom operator are visible in soft focus. Authentic Hollywood soundstage environment, 35mm film still, Kodak Vision3 500T, subtle film grain.`,
        caption: `Rehearsing the pacing for Scene 2B. Precision blocking is everything when fifty million dollars is on the line. 🎬🎙️`,
        hashtags: ['#FilmSetBTS', '#DirectorNotes', '#Cinematography', '#ActorsLife', '#Veo2'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Brushed-Metal Encrypted SSD`,
        clueName: `Brushed-Metal Encrypted SSD & Zurich Bank Wire Routing Sheet`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: Cinematic macro flat-lay photograph of a military-grade brushed-metal external SSD drive resting next to a folded Zurich bank wire transfer routing sheet showing a $50,000,000 transaction. A faint pulsing emerald LED indicator glows on the metallic casing. ARRI Alexa LF 50mm macro lens, moody cool-blue sidelighting, crisp tactile textures, 8K resolution.`,
        caption: `Exhibit B: The erased security drive wasn't erased after all. The Zurich routing numbers don't lie. Who was the real recipient? 💾🔒`,
        hashtags: ['#ForensicClue', '#CyberMystery', '#CorporateEspionage', '#TheErasedDrive'],
      },
      candidPost: {
        title: `📚 In-Universe Set Lore: The Archival Shelves`,
        moodDescription: `Quiet inspection of confidential ledgers in the private study library`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char2.name} (original fictional woman, distinct non-celebrity digital human, structured navy blazer) standing in front of floor-to-ceiling dark oak bookshelves lined with confidential leather-bound ledgers in ${location}. Her fingertips lightly trace the spine of a vintage corporate journal under dramatic chiaroscuro key lighting. Master 8K cinematic portrait, anamorphic lens flare.`,
        caption: `Every corporate empire has a paper trail it tries to bury. Not this one. 📖🕯️`,
        hashtags: ['#CharacterLore', '#InUniverse', '#CorporateIntrigue', '#StoryWorld'],
      },
    },
    3: {
      btsPost: {
        title: `🎬 Film Set BTS: The Wiretap Playback Rehearsal`,
        angleDescription: `Cinematographer checking focal depth on the living salon coffee table`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: Production still capturing the film crew setting up a low-angle shot in the penthouse salon. ${char1.name} and ${char2.name} (original fictional characters, distinct non-celebrity digital humans) rehearse the dramatic pause across the coffee table while the focus puller measures distance with a laser tape. Soft studio haze, ARRI sky-panels overhead, authentic filmmaking craft. 35mm film still, natural grain.`,
        caption: `Setting up the 85mm anamorphic frame for the audio tape reveal. Silence speaks louder than words on set. 🎬🎧`,
        hashtags: ['#FilmSetBTS', '#Cinematographer', '#BehindTheScenes', '#IndieFilm', '#Veo2'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Titanium Audio Recorder with Glowing Waveforms`,
        clueName: `Titanium Voice Recorder with Illuminated Amber Frequency Bars`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: Macro cinematic photograph of a sleek titanium digital voice recorder resting on a smoked glass coffee table. Illuminated amber digital frequency waveform bars pulse on its OLED screen alongside an inserted encrypted micro-SD card. Reflections of city lights in the glass table, moody atmospheric chiaroscuro lighting, tactile brushed aluminum texture, 8K resolution.`,
        caption: `Exhibit C: 30 minutes of recorded audio from inside this room. The second voice on that tape changes everything. 🎙️⚠️`,
        hashtags: ['#AudioEvidence', '#ForensicProp', '#BlackmailTape', '#PlotClue'],
      },
      candidPost: {
        title: `🛋️ In-Universe Set Lore: Chesterfield Corner Reflection`,
        moodDescription: `Solitary contemplation deep in a leather armchair as the tape plays`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char1.name} (original fictional man, distinct non-celebrity digital human) seated deep in a vintage chesterfield dark leather armchair in the corner of ${location}, head resting on hand, eyes fixed thoughtfully on the rain-drenched floor-to-ceiling glass. Warm amber table lamp glow contrasting with nocturnal blue city bokeh. Cinematic 8K still.`,
        caption: `When you finally hear the voice of the person who orchestrated the betrayal. 🥃🌧️`,
        hashtags: ['#NoirVibes', '#Solitude', '#InUniverseLore', '#DramaticMoment'],
      },
    },
    4: {
      btsPost: {
        title: `🎬 Film Set BTS: Steel Vault Lighting Setup`,
        angleDescription: `Gaffer adjusting cool-blue rim lighting near heavy vault security doors`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: Production photograph of the lighting crew and gaffer positioning a cool-blue Astera Titan tube light beside the heavy steel vault doors on set. ${char1.name} (original fictional man, non-celebrity digital human) holds the prop flash drive, conferring with the camera operator on the fluid head. Cinematic film set atmosphere, haze, cables on floor, professional production still.`,
        caption: `Crafting the midnight exchange atmosphere with cool cyan rim lights and theatrical haze. 90 seconds until lockdown. 🎬💡`,
        hashtags: ['#FilmSetBTS', '#GafferLife', '#Cinematography', '#LightingDesign', '#Veo2'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Cold-Storage Drive & Transaction Register`,
        clueName: `Brushed-Metal Cold-Storage Flash Drive & Regulatory Transaction Ledger`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: High-definition cinematic macro flat-lay of a heavy brushed-metal military-grade flash drive with laser-etched serial numbers resting atop a printed regulatory transaction manifest with unredacted wire entries. Chiaroscuro desk lamp illumination, crisp micro-lettering, tactile paper texture, 8K photorealistic.`,
        caption: `Exhibit D: Thirty thousand unredacted transactions. The physical key to five years of covered operations. 🔑📑`,
        hashtags: ['#ForensicClue', '#ClassifiedData', '#Whodunnit', '#EvidenceExhibit'],
      },
      candidPost: {
        title: `🏢 In-Universe Set Lore: Executive Elevator Foyer`,
        moodDescription: `Leaning against dark granite walls under architectural recessed lights`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char2.name} (original fictional woman, non-celebrity digital human, structured navy blazer) leaning against a polished black granite elevator foyer wall in the corporate tower at midnight, checking the tactical security display under cool architectural downlights. Cinematic reflection in the polished granite, suspenseful isolation, 8K film portrait.`,
        caption: `The elevator is coming up. There are no safe exits left in this building. ⏱️🏢`,
        hashtags: ['#InUniverse', '#HighStakes', '#CorporateNoir', '#MidnightHour'],
      },
    },
    5: {
      btsPost: {
        title: `🎬 Film Set BTS: Safe Deposit Vault Dolly Track`,
        angleDescription: `Camera dolly track setup along the brass safe deposit locker corridor`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: On-set production still showing the camera dolly on curved steel tracks in the vaulted safe deposit box corridor set. ${char2.name} (original fictional woman, non-celebrity digital human) stands by locker 409 while the camera operator preps a creeping push-in shot. Director reviewing frame on a portable SmallHD monitor. 35mm film aesthetic, Kodak Vision3, natural film grain.`,
        caption: `Dolly tracking into Locker 409. The slower the camera moves, the higher the tension climbs. 🎬🎥`,
        hashtags: ['#FilmSetBTS', '#CameraDolly', '#FilmmakingCraft', '#SetLife', '#Veo2'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Shattered Biometric Card of Box 409`,
        clueName: `Fractured Biometric Security Card & Retinal Log Printout`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: Macro photograph of a shattered translucent biometric security card labeled 'VAULT ACCESS - BOX 409' with hairline glass fractures across an exposed microchip, resting next to a printed optical retinal scan report with official security stamps. Dramatic low-key lighting, reflective broken glass shards, 8K resolution.`,
        caption: `Exhibit E: Box 409 was breached from the inside. The optical retinal match belongs to a person declared retired three years ago. 🔬🗄️`,
        hashtags: ['#ForensicEvidence', '#SafetyDepositBox', '#PlotTwist', '#MysteryClue'],
      },
      candidPost: {
        title: `🏦 In-Universe Set Lore: Vault Perspective Corridor`,
        moodDescription: `Walking down the endless brass safe deposit locker corridor into deep shadow`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char1.name} (original fictional man, non-celebrity digital human, tailored coat) walking slowly down the endless vaulted safe deposit corridor lined with hundreds of polished brass locker doors receding into deep shadowy perspective. Overhead circular warm lights casting rhythmic golden pools on the floor. 8K cinematic film still.`,
        caption: `Some vaults were never meant to be opened. 🏦🔐`,
        hashtags: ['#CinematicMood', '#NoirAtmosphere', '#VaultSecrets', '#InUniverse'],
      },
    },
    6: {
      btsPost: {
        title: `🎬 Film Set BTS: Emergency Flashing Light Rig`,
        angleDescription: `Special effects lighting rig simulating police cruisers reflecting into penthouse`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: Production still capturing the lighting technician operating a rotating red and blue emergency beacon rig outside the penthouse studio windows. ${char1.name} and ${char2.name} (original fictional characters, non-celebrity digital humans) confer with the director near the Venetian blinds. Authentic studio soundstage, grip equipment, atmospheric smoke machine haze. 35mm film still.`,
        caption: `Simulating the sirens closing in for the Ep 6 standoff. The red and blue sweep against the dark blinds sets the entire mood. 🎬🚨`,
        hashtags: ['#FilmSetBTS', '#SFXLighting', '#PracticalEffects', '#BehindTheScenes', '#Veo2'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Active Wiretapped Smartphone`,
        clueName: `Luxury Smartphone with Active Federal Prosecutor Call Screen (47:12)`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: Macro cinematic photograph of a black luxury smartphone resting on a dark executive desk. The screen displays an active call in glowing emerald green: 'Federal Special Prosecutor - 47:12' with a real-time pulsing audio frequency graph. Emergency red and blue reflections streak across the glass screen. Photorealistic 8K, shallow depth of field.`,
        caption: `Exhibit F: The line was open for 47 minutes. Every confession, every secret, recorded straight to federal servers. 📱🔴`,
        hashtags: ['#WiretapEvidence', '#FederalInvestigation', '#ForensicProp', '#Standoff'],
      },
      candidPost: {
        title: `🚨 In-Universe Set Lore: Standoff at the High Window`,
        moodDescription: `Watching emergency sirens enter the corporate courtyard below`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char2.name} (original fictional woman, non-celebrity digital human, midnight blazer) standing motionless by the towering executive glass window as rhythmic blue and red emergency light pulses paint the ceiling and dark venetian blinds. Tension-filled silhouette, cinematic film still, 8K resolution.`,
        caption: `Immunity revoked. The tactical elevator is already on its way up. 🚨⏳`,
        hashtags: ['#InUniverse', '#NoWayOut', '#Standoff', '#CorporateThriller'],
      },
    },
    7: {
      btsPost: {
        title: `🎬 Film Set BTS: Season Finale Cut-to-Black Take`,
        angleDescription: `Director holding clapperboard for the final confrontation take with rain FX`,
        imagePrompt: `[BEHIND-THE-SCENES FILM SET PHOTOGRAPH]: On-set production photograph of the director marking the clapperboard 'EPISODE 7 - SEASON FINALE - TAKE 7' right in front of the ARRI Alexa LF camera. In the background, ${char1.name} (original fictional man, non-celebrity digital human) stands by the antique rotary phone under heavy artificial rain mist against the penthouse glass. Production crew in action, authentic film set craft, 35mm grain.`,
        caption: `The final take of Season 1. When the receiver clicks and the voice speaks... cut to black! What a journey this season has been. 🎬🖤`,
        hashtags: ['#SeasonFinale', '#FilmSetBTS', '#WrapParty', '#IndieSeries', '#Veo2', '#Filmmaking'],
      },
      propPost: {
        title: `🔍 Tangible Clue: Antique Analog Rotary Phone`,
        clueName: `Heavy Black Rotary Phone with Coiled Copper Cord`,
        imagePrompt: `[FORENSIC MACRO PROP STILL]: Macro cinematic still of an antique heavy black bakelite rotary telephone on a polished dark mahogany side table. The heavy receiver is slightly lifted off the cradle, coiled black cord taut. A single warm amber desk lamp casts long dramatic noir shadows across the rotary dial. Atmospheric film haze, rich tactile textures, 8K photorealistic.`,
        caption: `Exhibit G: An analog line disconnected fifteen years ago. When it rings in an empty room, you don't pick it up unless you're ready to meet an unexpected voice. ☎️⚡`,
        hashtags: ['#SeasonFinaleClue', '#ArthurVanceReturns', '#Cliffhanger', '#NoirProp'],
      },
      candidPost: {
        title: `🚪 In-Universe Set Lore: The Service Tunnel Stairwell`,
        moodDescription: `Solitary pause at the emergency escape threshold lit by red exit signs`,
        imagePrompt: `[IN-UNIVERSE CINEMATIC CANDID]: ${char1.name} (original fictional man, non-celebrity digital human, charcoal coat) standing at the threshold of a dark industrial concrete service tunnel staircase, illuminated only by a glowing red emergency exit sign and rising steam from ventilation pipes. Heavy cinematic shadows, solitary suspense, 8K film portrait.`,
        caption: `Take the briefcase and disappear, or answer the phone? The choice that ends Season 1. 🚪🔴`,
        hashtags: ['#InUniverse', '#SeasonFinale', '#TheChoice', '#CliffhangerEnding'],
      },
    },
  };

  const inUniverseBundle = inUniverseBundles[dayNum] || inUniverseBundles[1];

  return {
    title,
    hookDescription,
    clips,
    characterAnchors: [
      {
        characterName: char1.name,
        anchorPrompt: `[MASTER CHARACTER REFERENCE ANCHOR]: ${char1.name}. ${char1.dnaPrompt} Global Hollywood / Netflix Noir aesthetic. ARRI Alexa LF 85mm prime lens, volumetric chiaroscuro studio lighting, neutral dark studio backdrop. Generate and save this master portrait once, then attach as Reference Image in all video prompts to eliminate face drift.`,
      },
      {
        characterName: char2.name,
        anchorPrompt: `[MASTER CHARACTER REFERENCE ANCHOR]: ${char2.name}. ${char2.dnaPrompt} Global Hollywood / Netflix Noir aesthetic. ARRI Alexa LF 85mm prime lens, volumetric chiaroscuro studio lighting, neutral dark studio backdrop. Generate and save this master portrait once, then attach as Reference Image in all video prompts to eliminate face drift.`,
      },
    ],
    locationAnchors: [
      {
        locationName: location,
        anchorPrompt: generateLocationAnchorPrompt(location, spec.visualStyle, spec.tone),
      },
    ],
    dialogueScript: activePlot.clips.map((c, idx) => ({
      speaker: c.speakerName,
      line: c.dialogue,
      timing: `0:${idx * 10 < 10 ? '0' : ''}${idx * 10 + 2} - 0:${idx * 10 + 7}`,
    })),
    inUniversePosts: inUniverseBundle,
  };
}
