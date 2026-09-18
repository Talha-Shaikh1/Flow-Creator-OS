import { StorySpec, ClipPrompt } from '@/types';
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
} {
  const noirDefaults = [
    {
      id: 'char-julian',
      name: 'Julian Vance',
      role: 'Hero' as const,
      description: '32yo high-profile corporate defense attorney fighting betrayal from within.',
      dnaPrompt: '32-year-old aristocratic man, sharp chiseled jawline, intense deep-set dark obsidian eyes, slicked-back charcoal pompadour hair, light tailored 5 o\'clock shadow, sharp cheekbones. Tailored charcoal bespoke three-piece wool suit, crisp white spread collar, silk slate-gray tie. Master 8K photorealistic keyframe portrait.',
      usesReferenceImage: true,
      personalityVibe: 'Stoic, razor-sharp intellect, fierce restrained anger'
    },
    {
      id: 'char-elena',
      name: 'Elena Sterling',
      role: 'Villain' as const,
      description: '30yo ruthless venture partner orchestrating an aggressive hostile takeover.',
      dnaPrompt: '30-year-old cold and calculating woman, chiseled symmetrical cheekbones, piercing icy-hazel eyes, slicked-back raven hair in an immaculate low chignon, flawless matte porcelain complexion, subtle plum lipstick. Minimalist structured midnight-navy double-breasted designer blazer with platinum cuff buttons. Master 8K photorealistic keyframe portrait.',
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
          action: `Medium close-up on ${char1.name} in ${location}. He slams a sealed black folder containing the forged share transfer onto the dark mahogany desk, eyes locked fiercely on ${char2.name}.`,
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
          dialogue: `Marcus is a black-market fixer who sells corporate blood to the highest bidder! Who wired fifty million dollars to his offshore account, ${char2.name}?`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She folds her arms calmly over her structured navy blazer, meeting his gaze without a flicker of panic.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Erased Drive - Interrogation`,
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
          dialogue: `Then listen carefully: Judge Morrison gave us forty-eight hours to burn the original trust documents, or we both disappear into a black site forever.`,
          action: `Over-the-shoulder dramatic composition in ${location}. ${char2.name} backs against the rain-drenched glass window, pale and rigid, delivering the federal countdown.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `The Blackmail Recording - Cliffhanger Countdown`,
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
          dialogue: `You hand that drive over, and you sign our death warrants. The chairman himself ordered those wire transfers five years ago to keep us alive.`,
          action: `Tight reverse shot on ${char2.name} in ${location}. She glares at the drive, a sharp intake of breath signaling the realization of total exposure.`,
          shotType: 'Shot-Reverse-Shot Close-Up',
          sceneName: `The Midnight Exchange - Death Warrant`,
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
          dialogue: `There are only two people alive registered to that vault... you, and the man you swore was buried in the family plot three years ago!`,
          action: `Over-the-shoulder shot in ${location}. ${char1.name} leans in, voice dropping to a deadly whisper before turning sharply toward the rain-soaked window.`,
          shotType: 'Over-the-Shoulder',
          sceneName: `Box 409 - Father Alive Revelation`,
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
          dialogue: `I'm not running without the truth, ${char2.name}. Look me in the eyes and tell me... was my father really the one who ordered the hit?`,
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
          dialogue: `The receiver clicks in my hand... and the voice on the other end speaks: 'Did you really think a plane crash could kill Arthur Vance, son?'`,
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
        : '1.5-second pregnant dramatic pause; heavy silence, breath intake before speech.',
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
            ? 'Intense baritone, controlled fury, crisp English articulation'
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
  };
}
