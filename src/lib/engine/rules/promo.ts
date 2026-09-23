import {
  StorySpec,
  DayContentPackage,
  VideoVariation,
  EpisodePromo,
  SeasonTrailerPromo,
  SeasonTrailerClip,
} from '@/types';

/**
 * Builds a high-retention 10-second "Next Episode Sneak Peek" promo for a given episode.
 */
export function buildNextEpisodePromo(
  spec: StorySpec,
  currentDayNum: number,
  currentVariation: VideoVariation,
  nextDayPackage?: DayContentPackage
): EpisodePromo {
  const seriesTitle = spec.seriesTitle || spec.customStoryIdea || 'Original Series';
  const format = spec.format || 'character_drama';
  const isSeasonFinale = currentDayNum >= 7;

  if (!isSeasonFinale && nextDayPackage && nextDayPackage.variations.length > 0) {
    const nextVar = nextDayPackage.variations[0];
    const targetDayNumber = currentDayNum + 1;
    const targetEpisodeTitle = nextVar.title || nextDayPackage.episodeTitle || `Episode ${targetDayNumber}`;
    const nextDialogue = nextVar.dialogueScript?.[0]?.line || nextVar.clips?.[0]?.speakerIsolation?.speakingDialogue ||
      'Nothing stays hidden forever. Tomorrow, everything changes.';

    let teaserHook = `Next on ${seriesTitle}: An unexpected twist shakes Episode ${targetDayNumber}.`;
    let soundDesignCue = 'Rising tension orchestral string riser, sudden heartbeat acoustic stop, heavy metal bass drop at 0:09.5s.';
    let visualAction = 'Fast-paced camera dolly push-in on intense confrontation, rapid lens blur, abrupt cut to black.';

    if (format === 'podcast_style') {
      teaserHook = `Coming up tomorrow on ${seriesTitle}: The confession she was terrified to say out loud.`;
      soundDesignCue = 'Intimate studio room tone, sudden sharp breath gasp into microphone, warm vinyl crackle stop.';
      visualAction = 'Gaze shifts directly toward camera with vulnerable micro-expression, lights dim slightly.';
    } else if (format === 'pet_comedy') {
      teaserHook = `Next time with Joe & Nova: A new household disaster pushes Zara to her absolute limit.`;
      soundDesignCue = 'Dramatic cartoon comedy brass swell, hollow ceramic bowl clatter, deadpan cat meow.';
      visualAction = 'Whip pan to Joe sitting in an impossible position with an unbothered deadpan stare.';
    } else if (format === 'object_talking') {
      teaserHook = `Tomorrow: The secret that the kitchen counter has kept for three months.`;
      soundDesignCue = 'Subtle kitchen acoustic reverb, sudden porcelain ceramic clink, tense clock tick.';
      visualAction = 'Low-angle push-in on the espresso cup as a dramatic shadow looms overhead.';
    } else if (format === 'faceless_ambient') {
      teaserHook = `Chapter ${targetDayNumber}: The questions that keep you awake when the rain stops.`;
      soundDesignCue = 'Heavy rain on glass fading into deep atmospheric synth pad, tape stop sound.';
      visualAction = 'Slow glide over nocturnal wet asphalt reflections into glowing neon halo.';
    }

    // 100% Match: Extract upcoming episode's active speaker, counterpart, and exact location setting
    const upcomingSpeaker =
      nextVar.dialogueScript?.[0]?.speaker ||
      nextVar.clips?.[0]?.speakerIsolation?.activeSpeaker ||
      spec.cast?.[0]?.name ||
      'Protagonist';

    const counterpartSpeaker =
      nextVar.dialogueScript?.[1]?.speaker ||
      nextVar.clips?.[0]?.speakerIsolation?.silentCharacters?.[0] ||
      spec.cast?.[1]?.name ||
      'Antagonist';

    const matchingCastMember = spec.cast?.find(
      (c) => c.name.toLowerCase() === upcomingSpeaker.toLowerCase()
    ) || spec.cast?.[0];

    const charAnchorObj =
      nextVar.characterAnchors?.find(
        (c) => c.characterName.toLowerCase() === upcomingSpeaker.toLowerCase()
      ) ||
      nextVar.characterAnchors?.[0] ||
      (matchingCastMember
        ? {
            characterName: matchingCastMember.name,
            anchorPrompt: `[MASTER CHARACTER ANCHOR]: ${matchingCastMember.name} (${matchingCastMember.role}) DNA Lock. ${matchingCastMember.dnaPrompt || matchingCastMember.description || ''} ${spec.visualStyle}`,
          }
        : undefined);

    const locAnchorObj = nextVar.locationAnchors?.[0];
    const locationName =
      locAnchorObj?.locationName ||
      nextVar.clips?.[0]?.locationAnchor ||
      spec.locationSettings?.[0] ||
      'Main Location';
    const locAnchorPrompt =
      locAnchorObj?.anchorPrompt ||
      `[LOCATION MASTER FRAME ANCHOR]: ${locationName}. ${spec.visualStyle}`;

    const startingFramePrompt = nextVar.clips?.[0]?.frameImagePrompt
      ? `[10s SNEAK PEEK PROMO FRAME - NEXT ON ${seriesTitle.toUpperCase()} (EPISODE ${targetDayNumber})]:\n${nextVar.clips[0].frameImagePrompt}\n[CINEMATOGRAPHY]: Cinematic teaser grade, intense rim lighting, 9:16 vertical composition.`
      : `[10s SNEAK PEEK PROMO FRAME - NEXT ON ${seriesTitle.toUpperCase()} (EPISODE ${targetDayNumber})]:\n${charAnchorObj ? charAnchorObj.anchorPrompt : `[MASTER CHARACTER ANCHOR]: ${upcomingSpeaker} DNA Lock. ${spec.visualStyle}`}\n${locAnchorPrompt}\n[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of ${upcomingSpeaker}. Maintain 100% exact facial geometry, cheekbone structure, eyes, and styling without alteration.\n[SCENE BLOCKING]: ${upcomingSpeaker} positioned in dynamic foreground at ${locationName}, caught in high dramatic tension.\n[CINEMATOGRAPHY & LIGHTING]: Shot on ARRI Alexa LF, 85mm Panavision Anamorphic T1.5 prime lens, f/1.8 shallow depth of field. ${spec.visualStyle}, chiaroscuro key lighting, atmospheric haze. 8K photorealistic film still, 9:16 vertical composition.`;

    // Extract key highlights / jhalkiyan of the entire upcoming episode
    const dialogueLines = nextVar.dialogueScript || [];
    const teaserHighlights: string[] = [];
    if (dialogueLines.length >= 3) {
      teaserHighlights.push(`Inciting Clash: "${dialogueLines[0].speaker}: ${dialogueLines[0].line}"`);
      teaserHighlights.push(`Mid-Episode Reversal: "${dialogueLines[1].speaker}: ${dialogueLines[1].line}"`);
      teaserHighlights.push(`Cliffhanger Cutoff: "${dialogueLines[dialogueLines.length - 1].speaker}: ${dialogueLines[dialogueLines.length - 1].line}"`);
    } else if (nextVar.clips && nextVar.clips.length >= 3) {
      teaserHighlights.push(`Opening Beat: ${nextVar.clips[0].sceneName}`);
      teaserHighlights.push(`High-Stakes Confrontation: ${nextVar.clips[1].sceneName}`);
      teaserHighlights.push(`Suspense Climax: ${nextVar.clips[2].sceneName}`);
    } else {
      teaserHighlights.push(`Opening Beat: Hostile confrontation begins at ${locationName}`);
      teaserHighlights.push(`Mid-Scene Twist: Irreversible truth exposed`);
      teaserHighlights.push(`Cliffhanger Cutoff: Final decisive ultimatum`);
    }

    const flowMotionPrompt = nextVar.clips?.[0]?.flowPromptText
      ? `[PROMO TEASER SHOT - NEXT ON ${seriesTitle.toUpperCase()} (EPISODE ${targetDayNumber})]: 9:16 vertical video.\n${nextVar.clips[0].flowPromptText}\n[PROMO POST-HOOK]: At 0:09.2s, the camera snaps rapidly into darkness with a suspended cliffhanger breath. Sound design: ${soundDesignCue}`
      : `[PROMO TEASER SHOT - NEXT ON ${seriesTitle.toUpperCase()} (EPISODE ${targetDayNumber})]: 9:16 vertical video.\n[LOCATION MASTER ANCHOR]: ${locationName}.\n[CHARACTER REFERENCE ANCHORS]: Active Speaker: ${upcomingSpeaker} [ATTACH MASTER REFERENCE IMAGE 1 - ${upcomingSpeaker.toUpperCase()}]. Counterpart: ${counterpartSpeaker} [ATTACH MASTER REFERENCE IMAGE 2 - ${counterpartSpeaker.toUpperCase()}], 100% silent, lips sealed.\n[ACTION]: ${visualAction}\n[SPOKEN DIALOGUE]: "${nextDialogue}" (crisp syllable lip-sync articulation).\n[CADENCE & SFX]: Fast 24fps motion, high cinematic contrast. At 0:09.2s, the camera snaps rapidly into darkness with a suspended cliffhanger breath. Sound design: ${soundDesignCue}`;

    return {
      targetDayNumber,
      targetEpisodeTitle,
      teaserHook,
      teaserDialogue: nextDialogue,
      startingFramePrompt,
      flowMotionPrompt,
      soundDesignCue,
      estimatedAirTime: `Tomorrow • Day ${targetDayNumber}`,
      teaserHighlights,
    };
  }

  // Day 7 / Season Finale -> Season Premiere Promo
  const nextSeasonNum = (spec.seasonNumber || 1) + 1;
  const finaleDialogue = "You thought this was over? We haven't even touched the real truth.";
  const finaleTitle = `Season ${nextSeasonNum} Official Premiere`;
  const finaleHero = spec.cast?.[0]?.name || 'Protagonist';
  const finaleLocation = spec.locationSettings?.[0] || 'Executive Headquarters';

  return {
    targetDayNumber: 8,
    targetEpisodeTitle: finaleTitle,
    teaserHook: `The Season Finale cliffhanger leaves the entire world in jeopardy. Season ${nextSeasonNum} arrives next.`,
    teaserDialogue: finaleDialogue,
    startingFramePrompt: `[OFFICIAL NEXT SEASON TEASER KEYFRAME - ${seriesTitle.toUpperCase()} SEASON ${nextSeasonNum}]:\n[MASTER CHARACTER ANCHOR]: ${finaleHero} DNA Lock. ${spec.visualStyle}.\n[LOCATION MASTER ANCHOR]: ${finaleLocation}.\n[IMAGE REFERENCE ANCHOR]: Attach Master Reference Image of ${finaleHero}.\n[SCENE BLOCKING]: Shadowy silhouette of ${finaleHero} turning slowly toward camera lens against the backdrop of ${finaleLocation}.\n[CINEMATOGRAPHY & LIGHTING]: ARRI Alexa LF, 85mm Panavision anamorphic, chiaroscuro lighting, volumetric smoke, glowing anamorphic lens flare. 9:16 vertical cinema composition, 8k photorealistic.`,
    flowMotionPrompt: `[SEASON FINALE SNEAK PEEK MOTION DIRECTIVE]: 9:16 vertical video.\n[LOCATION MASTER ANCHOR]: ${finaleLocation}.\n[CHARACTER REFERENCE ANCHOR]: ${finaleHero} [ATTACH MASTER REFERENCE IMAGE - ${finaleHero.toUpperCase()}].\n[ACTION]: Slow dramatic camera pull back from a shadowy desk in ${finaleLocation}. ${finaleHero} raises head and whispers: "${finaleDialogue}". Massive sub-bass boom at 0:09.5s as screen cuts abruptly to pure black.\n[SOUND DESIGN]: Deep Inception-style low brass braam, echoing metallic reverb, sudden absolute silence on cut.`,
    soundDesignCue: 'Deep Inception-style low brass braam, echoing metallic reverb, sudden absolute silence on cut.',
    estimatedAirTime: `Coming Soon • Season ${nextSeasonNum}`,
    teaserHighlights: [
      `Next Tier Stakes Escalation`,
      `New Unforgiving Antagonist Emerges`,
      `Global Conspiracy Beyond ${finaleLocation}`,
    ],
  };
}

/**
 * Builds the official 4-clip cinematic Season Teaser Trailer montage for the full batch.
 */
export function buildSeasonTrailer(
  spec: StorySpec,
  days: DayContentPackage[],
  seasonNum: number = 1,
  seasonTitle: string = 'The Local Betrayal'
): SeasonTrailerPromo {
  const seriesTitle = spec.seriesTitle || spec.customStoryIdea || 'Original Series';
  const format = spec.format || 'character_drama';
  const day1 = days[0];
  const day3 = days[2] || days[0];
  const day6 = days[5] || days[days.length - 1] || days[0];

  const heroName = spec.cast?.[0]?.name || 'Protagonist';
  const villainName = spec.cast?.[1]?.name || 'Antagonist';

  // 1. Trailer Logline & VO Script tailored to format
  let trailerLogline = `In Season ${seasonNum} of ${seriesTitle}, loyalty is currency, and every secret carries a lethal price.`;
  let voScript = [
    'They told you the game was simple.',
    'They said all you had to do was follow the rules.',
    'But when everyone in the room has an agenda...',
    'Truth is the first thing that burns.',
  ];

  if (format === 'podcast_style') {
    trailerLogline = `Season ${seasonNum}: 7 nights of raw revelations, unmasked truths, and the conversations people are terrified to have.`;
    voScript = [
      'We spend so much energy pretending everything is fine.',
      'Until one conversation changes how you see your entire life.',
      'No filters. No scripts. Just the raw, uncomfortable truth.',
      'Welcome to The Unfiltered Table.',
    ];
  } else if (format === 'pet_comedy') {
    trailerLogline = `Season ${seasonNum}: One house. Two pets with completely opposing worldviews. And one human hanging on by a thread.`;
    voScript = [
      'In every household, there is an architect of chaos.',
      'And there is an innocent soul who just wants to throw the ball.',
      'Meet Joe. Meet Nova.',
      'May mercy be on their human’s soul.',
    ];
  } else if (format === 'object_talking') {
    trailerLogline = `Season ${seasonNum}: You walk past them every morning. But you never knew what they were thinking.`;
    voScript = [
      'You look at this counter every single morning.',
      'You think nothing changes here.',
      'You have no idea what happens when you turn around.',
      'The counter remembers everything.',
    ];
  } else if (format === 'faceless_ambient') {
    trailerLogline = `Season ${seasonNum}: A hypnotic journey through nocturnal reflections, forgotten promises, and midnight solace.`;
    voScript = [
      'The city never really sleeps.',
      'It just waits for the noise to die down.',
      'Listen closely to the quiet moments.',
      'They carry every answer you’ve been looking for.',
    ];
  }

  // 2. 4 Trailer Clips Montage
  const clip1Prompt = day1?.variations[0]?.clips[0]?.frameImagePrompt ||
    `[TRAILER SHOT 1/4 - INCITING INCIDENT]: Cinematic establishing shot of ${spec.locationSettings?.[0] || 'Executive Penthouse'}, moody atmospheric lighting, 9:16 vertical composition.`;

  const clip2Prompt = day3?.variations[0]?.clips[1]?.frameImagePrompt ||
    `[TRAILER SHOT 2/4 - MID-SEASON BETRAYAL]: Intense shot-reverse-shot confrontation between ${heroName} and ${villainName}, deep chiaroscuro lighting, intense gaze.`;

  const clip3Prompt = day6?.variations[0]?.clips[day6.variations[0].clips.length - 1]?.frameImagePrompt ||
    `[TRAILER SHOT 3/4 - CLIMAX STANDOFF]: Extreme close-up of ${heroName} delivering a final ultimatum under rain-streaked window reflections, cold rim lighting.`;

  const titleCardPrompt =
    `[TRAILER SHOT 4/4 - OFFICIAL TITLE CARD]: Dark obsidian minimalist cinematic background, volumetric mist, volumetric amber back-light. In bold chiseled metallic platinum serif typography: "${seriesTitle.toUpperCase()}". Subtitle below in crisp gold sans-serif: "SEASON ${seasonNum}: ${seasonTitle.toUpperCase()}". 9:16 vertical cinema poster composition, 8k photorealistic.`;

  const trailerClips: SeasonTrailerClip[] = [
    {
      clipIndex: 1,
      phaseLabel: 'The Inciting Hook',
      shotType: 'Master Wide to Slow Push-In',
      visualAction: 'Slow steady camera push through atmospheric space. Atmosphere thickens as opening voiceover delivers the world premise.',
      dialogueOrVoiceover: voScript[0],
      frameImagePrompt: `[SEASON ${seasonNum} TRAILER SHOT 1/4 (THE HOOK)]: ${clip1Prompt}`,
      flowMotionPrompt: `[TRAILER MOTION 1/4]: 9:16 vertical video. Slow gliding forward tracking shot (24fps). Atmosphere is dense and cinematic. Voiceover: "${voScript[0]}". Sound design: Low sub-bass rumble, ticking pocket watch echo.`,
      soundDesignCue: 'Low sub-bass drone, ticking pocket watch echo, warm atmospheric ambience.',
    },
    {
      clipIndex: 2,
      phaseLabel: 'The Mid-Season Betrayal',
      shotType: 'Rapid Cut / Medium Standoff',
      visualAction: 'Fast dynamic camera cut into an intense confrontation. Micro-expressions tighten as stakes escalate.',
      dialogueOrVoiceover: voScript[1],
      frameImagePrompt: `[SEASON ${seasonNum} TRAILER SHOT 2/4 (THE BETRAYAL)]: ${clip2Prompt}`,
      flowMotionPrompt: `[TRAILER MOTION 2/4]: 9:16 vertical video. Sharp camera push-in. High-tension eye contact, jaw muscles flexing. Voiceover: "${voScript[1]}". Sound design: Sharp orchestral string riser, metallic blade touch.',`,
      soundDesignCue: 'Sharp orchestral string riser, metallic blade scrape, rising heartbeat tempo.',
    },
    {
      clipIndex: 3,
      phaseLabel: 'The Climax Standoff',
      shotType: 'Extreme Close-Up Climax',
      visualAction: 'Extreme high-tension close-up on eye catchlights, rapid rhythmic flashes of the week’s peak moments.',
      dialogueOrVoiceover: voScript[2],
      frameImagePrompt: `[SEASON ${seasonNum} TRAILER SHOT 3/4 (CLIMAX)]: ${clip3Prompt}`,
      flowMotionPrompt: `[TRAILER MOTION 3/4]: 9:16 vertical video. Camera shudders subtly with tension, shallow depth of field. Delivery of decisive line: "${voScript[2]}". At 0:09.5s, rapid whoosh into pure black.',`,
      soundDesignCue: 'Massive Inception brass braam horn, explosive sub-drop, immediate total silence.',
    },
    {
      clipIndex: 4,
      phaseLabel: 'Series Title Reveal',
      shotType: 'Cinematic Title Reveal Card',
      visualAction: 'From total blackness, volumetric light cuts through smoke as the 3D metallic title card slowly floats forward.',
      dialogueOrVoiceover: voScript[3],
      frameImagePrompt: titleCardPrompt,
      flowMotionPrompt: `[TRAILER MOTION 4/4 - TITLE PUNCH]: 9:16 vertical video. Slow floating macro movement of metallic typography "${seriesTitle.toUpperCase()} - SEASON ${seasonNum}". Volumetric light sweeps across letters. Voiceover: "${voScript[3]}". Crisp metallic impact audio on title reveal.`,
      soundDesignCue: 'Heavy cinematic anvil hit (thud!), lingering dark harmonic resonance, fade to black.',
    },
  ];

  return {
    seasonNumber: seasonNum,
    seasonTitle,
    trailerLogline,
    voiceoverScript: voScript,
    soundDesignCues: [
      'Inception-style low brass braam',
      'Accelerating heartbeat clock riser',
      'Sharp metallic whoosh-cuts',
      'Heavy cinematic anvil thud for Title Drop',
    ],
    masterTrailerFramePrompt: clip1Prompt,
    trailerClips,
    titleCardPrompt,
  };
}
