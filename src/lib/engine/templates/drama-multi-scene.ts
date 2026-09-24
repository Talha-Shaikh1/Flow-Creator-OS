import { StorySpec, CastMember, CleanLocationPlate, PlatformSocialMetadata, InUniversePostBundle } from '@/types';
import { generateCleanLocationPlatePrompt } from '../rules/spatial';

export interface MultiSceneBeat {
  sceneNumber: 1 | 2 | 3;
  sceneName: string;
  locationName: string;
  timeRange: string;
  lightingTheme: string;
}

export interface MultiScenePlotDef {
  title: string;
  hook: string;
  scenes: MultiSceneBeat[];
  clips: Array<{
    speakerName: string;
    silentNames: string[];
    dialogue: string;
    action: string;
    shotType: 'Master Wide' | 'Shot-Reverse-Shot Close-Up' | 'Over-the-Shoulder' | 'Dynamic Tracking';
    sceneNumber: 1 | 2 | 3;
    sceneName: string;
    sceneLocation: string;
    eyelineDirection: 'screen-left' | 'screen-right' | 'center-forward';
    lightingTheme: string;
    cameraSetup: string;
  }>;
}

/**
 * 7-Day Multi-Scene Narrative Matrix (3 Locations & 6 Clips per Episode)
 * Designed specifically for 60-second episodes in Gemini Omni Flash 1.1 (6 clips x 10 seconds).
 */
export function resolve7DayMultiScenePlot(
  spec: StorySpec,
  dayNum: number,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook' = 'High Tension',
  char1: CastMember,
  char2: CastMember,
  existingVariation?: any
): MultiScenePlotDef {
  const idea = `${spec.customStoryIdea || ''} ${spec.genres.join(' ')}`.toLowerCase();
  const isCyber = idea.includes('cyber') || idea.includes('hack') || idea.includes('ai') || idea.includes('tech') || idea.includes('server') || idea.includes('tokyo');
  const isPharma = idea.includes('pharma') || idea.includes('patent') || idea.includes('medical') || idea.includes('cure') || idea.includes('trial') || idea.includes('vaccine') || idea.includes('hospital');
  const isDetective = idea.includes('detective') || idea.includes('police') || idea.includes('crime') || idea.includes('murder') || idea.includes('investigation') || idea.includes('homicide');
  const isHeist = idea.includes('heist') || idea.includes('vault') || idea.includes('bank') || idea.includes('gold') || idea.includes('robbery');

  // Multi-genre location generator for 3 scenes per day
  const getSceneLocations = (day: number) => {
    if (isCyber) {
      const cyberLocs: Record<number, [string, string, string]> = {
        1: ['Quantum Mainframe Server Room at 03:00 UTC', 'High-Speed Glass Elevator Overlooking Cyber City', 'Underground Subterranean Cable Terminal'],
        2: ['Neon-Lit Cyber Penthouse Terminal', 'Rain-Slicked Shinjuku Alleyway', 'Blacked-Out Tactical Command Van Interior'],
        3: ['Biometric Archive Vault', 'Industrial Concrete Fire Stairwell', 'Rooftop Satellite Transceiver Grid at Midnight'],
        4: ['Encrypted War Room with Holographic Projections', 'Secure Soundproofed Glass Corridor', 'Abandoned Sub-Basement Fiber Hub'],
        5: ['High-Frequency Trading Floor After Hours', 'Moving Bullet Train First-Class Cabin', 'Industrial Waterfront Container Docks'],
        6: ['Federal Cyber Crime Interrogation Suite', 'Emergency Server Evacuation Tunnel', 'Private Hangar Midnight Runaway Jet'],
        7: ['Executive Skyline Penthouse During Thunderstorm', 'Mainframe Core Cooling Facility', 'Suspension Bridge Overlook Under Heavy Rain'],
      };
      return cyberLocs[day] || cyberLocs[1];
    }

    if (isDetective) {
      const detLocs: Record<number, [string, string, string]> = {
        1: ['Dimly Lit Detective Precinct Archives at Midnight', 'Corridor Outside Crime Scene with Yellow Police Tape', 'Rain-Streaked Unmarked Police Cruiser Interior'],
        2: ['Forensic Pathology Examination Lab', 'Dimly Lit Emergency Hospital Stairwell', 'Foggy Industrial Waterfront Pier at 02:00 AM'],
        3: ['Victim Private Luxury Penthouse Study', 'Service Freight Elevator Shaft', 'Underground Concrete Parking Cellar'],
        4: ['Chief Inspector Soundproof Office', 'Precinct Evidence Locker Room', 'Old Railway Yard Abandoned Boxcar'],
        5: ['Federal Courthouse Holding Cell', 'Surveillance Van Monitoring Station', 'Rooftop Clocktower Overlooking Foggy City'],
        6: ['Blackmail Suspect Safehouse Hideout', 'Damp Brick Fire Escape Staircase', 'Harbor Shipping Container Perimeter'],
        7: ['Storm-Swept Harbor Lighthouse Standoff', 'Flooded Sub-Level Drainage Facility', 'Midnight Expressway Overpass in Downpour'],
      };
      return detLocs[day] || detLocs[1];
    }

    // Default: Corporate Noir & Betrayal Thriller
    const corpLocs: Record<number, [string, string, string]> = {
      1: ['Luxury Mahogany Penthouse Study at Night', 'High-Speed Glass Elevator Overlooking City Skyline', 'Underground Wet Concrete Executive Parking Garage'],
      2: ['Confidential Boardroom with Frozen Audit Screen', 'Private Tinted Mercedes S-Class Backseat', 'Private Subterranean Safety Deposit Vault'],
      3: ['Dark Oak Corporate Archival Library', 'Industrial Steel Emergency Fire Stairwell', 'Rooftop Helipad Perimeter at Midnight'],
      4: ['Executive Corner Office During Rainstorm', 'Secure Marble Corridor with Surveillance Domes', 'Sub-Basement Encrypted Server Backup Archive'],
      5: ['Dimly Lit Waterfront Private Club Salon', 'Moving Night Limousine in Heavy Traffic', 'Industrial Pier Behind Luxury Marina'],
      6: ['Federal Audit Interrogation Conference Room', 'Secure Emergency Escape Stairwell', 'Private Aviation Terminal Midnight Runway'],
      7: ['Penthouse Master Suite Under Violent Storm', 'Industrial Rooftop Mechanical Room with Spinning Fans', 'Rain-Drenched Suspension Bridge Overlook'],
    };
    return corpLocs[day] || corpLocs[1];
  };

  const [loc1, loc2, loc3] = getSceneLocations(dayNum);
  const is90s = spec.clipDurationSeconds === 90;

  // 3 Dynamic Scenes (Scaled for 60s or 90s)
  const scenes: MultiSceneBeat[] = [
    {
      sceneNumber: 1,
      sceneName: is90s
        ? `Scene 1: The Reveal & Confrontation (00s - 30s)`
        : `Scene 1: The Reveal & Confrontation (00s - 20s)`,
      locationName: loc1,
      timeRange: is90s ? '00s - 30s' : '00s - 20s',
      lightingTheme: 'Moody chiaroscuro key lighting, Venetian blind shadows, cool blue rim light matching glass window reflections',
    },
    {
      sceneNumber: 2,
      sceneName: is90s
        ? `Scene 2: Transit & Hidden Conspiracy (30s - 60s)`
        : `Scene 2: Transit & Hidden Conspiracy (20s - 40s)`,
      locationName: loc2,
      timeRange: is90s ? '30s - 60s' : '20s - 40s',
      lightingTheme: 'Dynamic passing neon lights, rhythmic moving shadows, tinted glass interior ambience, high-contrast reflections',
    },
    {
      sceneNumber: 3,
      sceneName: is90s
        ? `Scene 3: The Climax & Irreversible Ultimatum (60s - 90s)`
        : `Scene 3: The Climax & Irreversible Ultimatum (40s - 60s)`,
      locationName: loc3,
      timeRange: is90s ? '60s - 90s' : '40s - 60s',
      lightingTheme: 'High-contrast noir shadows, flickering industrial fluorescent tube lights, wet reflective asphalt puddles',
    },
  ];

  // 7-Day Script Arcs: 9 beats per day across 3 dynamic scenes (3 beats per scene)
  // For 90s: All 9 beats are used (Clips 1-3 in Scene 1, 4-6 in Scene 2, 7-9 in Scene 3).
  // For 60s: Slices to 6 core beats (Clips 1-2 in Scene 1, 4-5 in Scene 2, 7 & 9 in Scene 3).
  const defaultDialogueMatrix: Record<number, Array<{ speaker: string; dialogue: string; action: string; shotType: any; sceneNum: 1 | 2 | 3 }>> = {
    1: [
      // Scene 1: Penthouse Study (0-20s or 0-30s)
      {
        speaker: char1.name,
        dialogue: `At exactly 03:00 UTC, forty percent of company equity was transferred... and the digital signature is yours, ${char2.name}.`,
        action: `Medium close-up on ${char1.name}. Leaning over the desk with controlled fury, locking eyes screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `I didn't steal those shares, ${char1.name}. Someone cloned my biometric key three months before this audit ever started.`,
        action: `Reverse medium close-up on ${char2.name}. Facing screen-left with cold unwavering composure, holding up the cloned keycard.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `Then explain why the encrypted server ledger shows the transfer was confirmed from inside this exact room fifteen minutes ago.`,
        action: `Over-the-shoulder dramatic standoff. ${char1.name} slams the illuminated audit tablet onto mahogany, staring intently screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      // Scene 2: Glass Elevator / Transit (20-40s or 30-60s)
      {
        speaker: char1.name,
        dialogue: `Then why are the offshore bank confirmation codes pinging your personal satellite phone right now?`,
        action: `Tracking medium shot inside the glass elevator. ${char1.name} steps closer, phone display glowing in the dark, facing screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `Because whoever framed me wants us fighting each other while they liquidate the Zurich accounts!`,
        action: `Tight close-up on ${char2.name} inside the moving elevator. Eyeline locked screen-left, breathless intensity in her eyes.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `Look down at the lobby display... our company access privileges were wiped thirty seconds after the elevator doors closed!`,
        action: `Reverse angle on ${char1.name} pointing down at the flashing red terminal in the elevator wall, looking screen-left with rising dread.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      // Scene 3: Underground Garage (40-60s or 60-90s)
      {
        speaker: char1.name,
        dialogue: `Look at the surveillance feed downstairs, ${char2.name}. Your personal driver is waiting with an armed escort.`,
        action: `Dramatic wide-to-medium shot in the wet parking garage. ${char1.name} points towards the idling black sedan, facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `That's not my driver, ${char1.name}... that's the hit squad our father hired before he died!`,
        action: `Extreme close-up on ${char2.name} in the garage shadows. Eyeline locked screen-left, chilling realization before abrupt cut.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Get behind the reinforced pillar right now, ${char2.name}... because their lead SUV just racked a round into the chamber!`,
        action: `Tight reverse close-up on ${char1.name} grabbing ${char2.name}'s sleeve and pulling her into deep shadow, facing screen-right. Gunshot echoes, abrupt blackout!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    2: [
      // Day 2 Arc
      {
        speaker: char2.name,
        dialogue: `Get in the car before their sniper acquires a clean thermal lock on your chest, ${char1.name}!`,
        action: `Fast push-in on ${char2.name} holding the reinforced car door open, eyeline locked screen-right with urgent authority.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `You knew about father's shadow trust all along, didn't you? You watched me sign those forged documents!`,
        action: `Reverse close-up on ${char1.name}, collar drenched in rain, facing screen-left with furious realization.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `I tried to warn you in Geneva! But you were too blind with ambition to see the federal net closing around us!`,
        action: `Over-the-shoulder intense standoff. ${char2.name} slams the door shut, locking eyes screen-right as headlights sweep the glass.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `I signed the exact same contract, ${char1.name}. The moment either of us goes to the police, the trust detonates.`,
        action: `Interior medium shot inside the moving car. Passing streetlights flickering across ${char2.name}'s face, looking screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `Then we don't go to the police... we breach father's private vault before the Zurich market opens.`,
        action: `Tight reverse shot on ${char1.name} in the car backseat. Eyeline locked screen-left, jaw setting into hard resolve.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `Their chase vehicles just crossed the bridge behind us! Turn off the headlights and take the freight tunnel now!`,
        action: `Low-angle tracking shot inside the dark vehicle. Passing emergency tunnel tiles reflecting across ${char2.name}'s eyes, looking screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `The vault requires two simultaneous retinal scans. If one of us betrays the other inside, the room seals forever.`,
        action: `Atmospheric low-angle shot outside the reinforced vault door. ${char2.name} stands under buzzing security lights, facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Then pray neither of us blinks... because the timer just hit thirty seconds.`,
        action: `Extreme tight close-up on ${char1.name}'s eye reflecting the amber countdown diode, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `Retinal match confirmed... step inside before the halon gas suppression seals the airlock!`,
        action: `Tight reverse close-up on ${char2.name} crossing the heavy vault threshold as pneumatic sirens begin wailing. Screen snaps to black!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    3: [
      // Day 3 Arc
      {
        speaker: char1.name,
        dialogue: `The vault is empty, ${char2.name}... except for this single titanium recorder addressed to both of us.`,
        action: `Medium shot on ${char1.name} holding up the illuminated recorder in the library, looking screen-right in disbelief.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `Press play, ${char1.name}. Whatever father left on that tape is the reason three people were executed this week.`,
        action: `Reverse close-up on ${char2.name} against dark oak bookshelves, eyeline locked screen-left with tense composure.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `Listen to the background frequency on the recording... that's the private encrypted line of the federal courthouse.`,
        action: `Over-the-shoulder focus on the glowing audio waveform display. ${char1.name} leans in with razor focus, facing screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `Listen to this voice... that's not our father on the tape. That's the Federal District Attorney.`,
        action: `Tracking medium shot along the steel stairwell. ${char1.name} holds the speaker to his ear, looking screen-right in shock.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `The District Attorney didn't open an investigation on us... he's the silent partner who organized the syndicate!`,
        action: `Tight reverse shot on ${char2.name} clutching the emergency handrail, looking screen-left with cold fury.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `He's not building a prosecution case... he's liquidating our family assets to fund his own political syndicate!`,
        action: `Close-up on ${char1.name} on the rain-swept stairwell landing, phone screen reflecting transfer sums, facing screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `Look up at the helipad... the federal helicopter just touched down, and they aren't carrying arrest warrants.`,
        action: `Dramatic wide shot on the wind-swept rooftop helipad. Rotors whipping through midnight fog, ${char1.name} facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `They came to burn the evidence, ${char1.name}. And we're the only evidence left standing.`,
        action: `Tight close-up on ${char2.name}'s face illuminated by sweeping searchlights, facing screen-left with unflinching defiance.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Pocket the titanium drive and grab the emergency flare... we drop through the service chute before they breach the roof!`,
        action: `Extreme tight close-up on ${char1.name}'s hand igniting the crimson distress flare. Blinding red sparks shower the lens; cut to black!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    4: [
      // Day 4 (Midpoint Twist) Arc
      {
        speaker: char2.name,
        dialogue: `I copied the audio tape onto a cold-storage drive. We have exactly one hour before they track this signal.`,
        action: `Medium close-up on ${char2.name} in the rainy boardroom, slotting the drive into a laptop, facing screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `There's a third signature on the offshore syndicate ledger, ${char2.name}... and it's someone inside this room.`,
        action: `Reverse shot on ${char1.name} sliding the forensic audit paper across the glass table, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `If you think I had anything to do with those wire transfers, check the forensic timestamps right now!`,
        action: `Over-the-shoulder push-in. ${char2.name} spins the laptop screen around to show the live encrypted audit trace, looking screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `Don't look at me like that, ${char1.name}. My signature was forged with the same encrypted cipher they used on you!`,
        action: `Moving tracking shot down the marble corridor. ${char2.name} walking alongside ${char1.name}, facing screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `I'm not accusing you, ${char2.name}... look at the initials at the bottom. It says 'A.V.'... Arthur Vance!`,
        action: `Tight reverse close-up on ${char1.name} stopping dead in his tracks in the hallway, looking screen-left with stunned horror.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `Arthur Vance died two years ago in a private plane crash in the Alps! That's mathematically impossible!`,
        action: `Medium close-up on ${char2.name} clutching the marble archway, color completely draining from her cheeks, looking screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `If father is alive... then every funeral, every tear, and every stock crash was an orchestrated performance!`,
        action: `Medium shot in the sub-basement archive vault. ${char2.name} backs away against the metal door, facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Then explain why his private biometric transponder just logged into this building three minutes ago...`,
        action: `Extreme tight close-up on the blinking red server status light reflecting in ${char1.name}'s eyes, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `Look at the elevator control bank... the master suite car was just called from the sub-level. He's coming up right now!`,
        action: `Extreme close-up on the illuminated floor counter ticking upwards: 1... 2... 3... Ding! Sudden abrupt blackout cut!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    5: [
      // Day 5 (Dark Night of the Soul) Arc
      {
        speaker: char1.name,
        dialogue: `The building is in total federal lockdown. All exterior comms are severed and our keycards are revoked.`,
        action: `Medium shot on ${char1.name} checking the red-locked biometric door in the warehouse salon, facing screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `Father planned this entire inheritance war. He pitted us against each other to see who was ruthless enough to inherit the syndicate.`,
        action: `Reverse close-up on ${char2.name} staring at the glowing emergency monitor, facing screen-left with bitter clarity.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `And we fell into every single trap he set for four long years, tearing this family apart for nothing.`,
        action: `Over-the-shoulder shot on ${char1.name} leaning against the cracked window, rain streaming down the glass, facing screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `We spent two years destroying each other's lives for a prize that was never meant to be real.`,
        action: `Tracking medium shot along the deserted subway platform under yellow lights. ${char1.name} pacing, facing screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `It becomes real the moment we broadcast his master ledger to every news syndicate in the world.`,
        action: `Tight reverse shot on ${char2.name} holding up the satellite uplink terminal, eyes burning screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `The global broadcast will destroy our names, our family reputation, and every company share we own.`,
        action: `Reverse medium close-up on ${char1.name} stopping in front of the rumbling subway tracks, eyes locked screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `If we press broadcast, the federal strike team on the roof won't take us into custody... they will shoot on sight.`,
        action: `Wide shot on the high-rise observation deck amidst whistling midnight winds. ${char1.name} facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `Then take the second gun from my coat, ${char1.name}... because tonight, we stop playing defense.`,
        action: `Tight close-up on ${char2.name} handing over the dark steel weapon, looking screen-left with fierce resolve.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Cock the hammer and watch the fire door... they just blew the emergency hinges off the frame!`,
        action: `Extreme close-up on ${char1.name}'s thumb pulling back the hammer with a sharp metallic click. Sound of door buckling; cut to black!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    6: [
      // Day 6 (The Counter-Attack Setup) Arc
      {
        speaker: char2.name,
        dialogue: `The uplink is ready at the private runway. We have nine minutes before the syndicate jets touch down.`,
        action: `Medium close-up on ${char2.name} inside the terminal hangar, checking the encrypted countdown, facing screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `The District Attorney just arrived with six black SUVs. They've completely encircled the tarmac.`,
        action: `Reverse close-up on ${char1.name} looking through the rain-streaked terminal window, facing screen-left with steely calm.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `Let them encircle us. Every second they spend on this runway is another gigabyte transferred to the Swiss auditors.`,
        action: `Over-the-shoulder tracking. ${char2.name} locks the satellite uplink case onto the transport cart, facing screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `The moment they breach the perimeter, our automated proxy leaks their bank records to the Swiss authorities.`,
        action: `Tracking medium shot along the sterile hospital corridor towards the emergency bay. ${char2.name} walking, facing screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `You knew this would happen from Day 1... you intentionally baited them into exposing their entire infrastructure!`,
        action: `Tight reverse shot on ${char1.name} with sudden admiration and disbelief, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `Our father taught me one thing before he disappeared: when the wolves come, you don't run... you lock the gate behind them.`,
        action: `Medium close-up on ${char2.name} looking screen-left with a chilling, triumphant smirk, chin held high.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `Look at the tarmac floodlights switching on... they are moving tactical units into position.`,
        action: `Wide cinematic shot on the midnight runway. Heavy rain whipping across yellow tarmac lights, ${char2.name} facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Look at the head SUV door opening, ${char2.name}... that isn't the District Attorney stepping out into the rain.`,
        action: `Extreme tight close-up on ${char1.name}'s eyes widening in pure disbelief at the tarmac, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `The man stepping into the downpour... has our father's silver signet ring on his finger!`,
        action: `Extreme close-up on a silver heirloom signet ring catching the harsh airfield floodlight. Thunder crack; instant cut to black!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
    7: [
      // Day 7 (Season Finale Climax & Master Cliffhanger) Arc
      {
        speaker: char1.name,
        dialogue: `It really is him... after four years of funerals and lies, Arthur Vance is standing right in front of us.`,
        action: `Medium shot on ${char1.name} on the rain-swept bridge overlook, lightning illuminating his drenched coat, facing screen-right.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char2.name,
        dialogue: `He didn't come back to save us, ${char1.name}. He came back because we are the only two people who know the access codes to the offshore vault!`,
        action: `Reverse close-up on ${char2.name}, voice cutting through the thunderous downpour, looking screen-left with furious defiance.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `He's offering us twenty million each to hand over the drive and disappear into South America forever.`,
        action: `Over-the-shoulder dramatic standoff on the observation point. Wind howling as ${char1.name} faces ${char2.name}, eyes locked screen-right.`,
        shotType: 'Over-the-Shoulder',
        sceneNum: 1,
      },
      {
        speaker: char1.name,
        dialogue: `He claims if we hand him the decryption key tonight, he will erase every criminal record linking us to the syndicate.`,
        action: `Tracking shot inside the industrial machine room as rotating ventilation fan shadows slice through the room. ${char1.name} facing screen-right.`,
        shotType: 'Dynamic Tracking',
        sceneNum: 2,
      },
      {
        speaker: char2.name,
        dialogue: `If we take his money, we become the monsters he raised us to be. I would rather watch every dollar burn to ashes.`,
        action: `Tight reverse shot on ${char2.name} gripping the encrypted hard drive over the deep industrial abyss, facing screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `Then we destroy the drive right here in front of him... and end this corrupt dynasty forever.`,
        action: `Tight close-up on ${char1.name} stepping alongside ${char2.name}, hand locking over hers above the whirling turbine fans, looking screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 2,
      },
      {
        speaker: char1.name,
        dialogue: `His sniper on the bridge just raised his rifle, ${char2.name}! Make the call right now!`,
        action: `Dramatic wide shot on the stormy suspension bridge. Headlights piercing fog, rain crashing onto the metal railings. ${char1.name} facing screen-right.`,
        shotType: 'Master Wide',
        sceneNum: 3,
      },
      {
        speaker: char2.name,
        dialogue: `Press the broadcast key, ${char1.name}... let the entire world see what the Vance family is made of!`,
        action: `Extreme close-up on ${char2.name}'s thumb slamming down onto the illuminated transmit trigger, eyes locked screen-left.`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
      {
        speaker: char1.name,
        dialogue: `Broadcast transmitted to four hundred global news networks! Welcome to the end of the empire!`,
        action: `Extreme close-up on the green transmission bar reaching 100%. Thunder crack, deafening sniper crack, instant pitch black!`,
        shotType: 'Shot-Reverse-Shot Close-Up',
        sceneNum: 3,
      },
    ],
  };

  const rawDayBeats = defaultDialogueMatrix[dayNum] || defaultDialogueMatrix[1];

  // Dynamically slice based on target episode duration:
  // If 90s: use all 9 beats (3 clips per scene x 3 scenes = 9 clips x 10s = 90s)
  // If 60s: use 6 beats (2 clips per scene x 3 scenes = 6 clips x 10s = 60s)
  const dayBeats = is90s
    ? rawDayBeats
    : [rawDayBeats[0], rawDayBeats[1], rawDayBeats[3], rawDayBeats[4], rawDayBeats[6], rawDayBeats[8]];

  // Map into detailed clips with 180-degree cinema eyeline matching!
  const clips = dayBeats.map((d, idx) => {
    const sceneDef = scenes.find((s) => s.sceneNumber === d.sceneNum) || scenes[0];
    const eyeline: 'screen-left' | 'screen-right' = idx % 2 === 0 ? 'screen-right' : 'screen-left';
    const counterpartName = d.speaker === char1.name ? char2.name : char1.name;

    return {
      speakerName: d.speaker,
      silentNames: [counterpartName],
      dialogue: d.dialogue,
      action: d.action,
      shotType: d.shotType,
      sceneNumber: d.sceneNum,
      sceneName: `${sceneDef.sceneName.split(':')[0]} - Clip ${idx + 1}`,
      sceneLocation: sceneDef.locationName,
      eyelineDirection: eyeline,
      lightingTheme: sceneDef.lightingTheme,
      cameraSetup: idx % 2 === 0
        ? '50mm prime cinematic lens, shallow depth of field f/1.8, eye-level camera pushing in gently'
        : '85mm portrait telephoto lens, reverse angle match, shallow focus on face with soft background bokeh',
    };
  });

  const episodeTitles: Record<number, { title: string; hook: string }> = {
    1: {
      title: `Ep 1: The Root Breach - ${char1.name} vs ${char2.name}`,
      hook: `A midnight biometric breach in the boardroom uncovers a forged trust and a fatal betrayal.`,
    },
    2: {
      title: `Ep 2: The Double Contract - Escape to the Vault`,
      hook: `Mortal rivals must survive an underground sniper ambush to reach the patriarch's locked records.`,
    },
    3: {
      title: `Ep 3: The Titanium Wire - The Partner Unmasked`,
      hook: `An encrypted audio recording reveals the prosecutor leading the investigation is the syndicate's architect.`,
    },
    4: {
      title: `Ep 4: The Ghost in the Ledger - The Midpoint Shock`,
      hook: `The dead patriarch's biometric signature logs into the company mainframe in real time.`,
    },
    5: {
      title: `Ep 5: Broken Allegiances - Night in the Underground`,
      hook: `Trapped inside a sealed skyscraper, the two heirs form an irreversible pact to burn the syndicate down.`,
    },
    6: {
      title: `Ep 6: The Runway Siege - The Trap Springs`,
      hook: `Encircled by federal SUVs on a midnight tarmac, the counter-attack begins as the gate locks behind them.`,
    },
    7: {
      title: `Ep 7: The Master of Shadows - Season 1 Climax Finale`,
      hook: `On a storm-swept suspension bridge, the presumed-dead father demands his life's fortune... or their lives.`,
    },
  };

  const meta = episodeTitles[dayNum] || {
    title: `Ep ${dayNum}: High Stakes Standoff`,
    hook: `A high-tension confrontation across three cinematic locations.`,
  };

  return {
    title: meta.title,
    hook: meta.hook,
    scenes,
    clips,
  };
}

/**
 * Generates Hollywood VIP Behind-The-Scenes (BTS) Image Prompts with Movie Production Gear.
 */
export function generateVIPBehindTheScenesPost(params: {
  dayNum: number;
  seriesTitle: string;
  char1: CastMember;
  char2: CastMember;
  scene1Location: string;
}): {
  title: string;
  imagePrompt: string;
  caption: string;
  hashtags: string[];
  angleDescription: string;
} {
  const btsPrompt = `Candid, high-budget behind-the-scenes film set photograph from a major cinematic drama production. In the foreground, an ARRI Alexa Mini LF cinema camera mounted on a professional Steadicam rig with an external Atomos monitor displaying live camera playback of ${params.char1.name}. In the midground, the actors playing ${params.char1.name} and ${params.char2.name} in their tailored dark wardrobe are laughing candidly between takes with the female director who is holding a marked leather-bound episode script binder. Overhead matte-black C-stands holding softbox diffused lighting, boom microphone hovering above, professional sound recordist wearing studio headphones in background. Setting is the authentic movie set of ${params.scene1Location}. Shot on 35mm film stock, crisp 8K resolution, genuine film production atmosphere with soft background blur.`;

  return {
    title: `Ep ${params.dayNum} Film Set BTS: The Camera Rig & Director Rehearsal`,
    imagePrompt: btsPrompt,
    caption: `Cameras off, smiles on! 😄 In front of the camera, ${params.char1.name} and ${params.char2.name} are ready to tear each other apart, but behind the scenes... this 10-second climax took 5 takes to get the eyeline perfect! Which character's acting felt more realistic to you today? Comment below! 👇`,
    hashtags: [
      '#BehindTheScenes',
      '#FilmMaking',
      '#BTS',
      '#CinemaSet',
      '#MovieProduction',
      '#DirectorLife',
      '#ActorLife',
      '#ViralReels',
    ],
    angleDescription: 'High-end cinema camera rig in foreground with lead actors laughing candidly on set with director.',
  };
}

/**
 * Generates Dual Cross-Platform Metadata for Episode AND for BTS Post.
 * YouTube: SEO Title (<70 chars), 1,000-char Description (synopsis, timestamps, cast, CTA), Tags, Hashtags.
 * Instagram / TikTok / Facebook: 300-char Hook Caption + Comment Debate Question + Tiered Viral Hashtags.
 */
export function generateDualCrossPlatformMetadata(params: {
  seriesTitle: string;
  seasonNumber: number;
  dayNum: number;
  episodeTitle: string;
  hook: string;
  char1Name: string;
  char2Name: string;
  scenes: MultiSceneBeat[];
  lastCliffhangerDialogue: string;
}): {
  episode: PlatformSocialMetadata;
  bts: PlatformSocialMetadata;
} {
  const cleanEpTitle = params.episodeTitle.replace(/^Ep \d+:\s*/, '');

  // 1. EPISODE METADATA
  const episodeYoutubeTitle = `HE CAUGHT HER RED-HANDED! 😱 | Ep ${params.dayNum}: ${cleanEpTitle}`.slice(0, 70);

  const is90s = params.scenes[0]?.timeRange?.includes('30s');
  const ts1 = '0:00';
  const ts2 = is90s ? '0:30' : '0:20';
  const ts3 = is90s ? '0:60' : '0:40';

  const episodeYoutubeDescription = `Watch Episode ${params.dayNum} of "${params.seriesTitle}" (Season ${params.seasonNumber})!

📖 EPISODE SYNOPSIS & STORYLINE:
${params.hook}
When high-stakes confidential corporate audit records are unsealed at midnight, ${params.char1Name} and ${params.char2Name} are forced into an irreversible psychological and physical confrontation. Across three dynamic cinematic locations, dark secrets regarding forged company shares, shadow accounts, and offshore wiretaps explode into the open. As loyalties fracture and federal countdowns tick down, neither character can afford a single misstep without losing their life, their freedom, or their legacy.

⏱️ EXACT SCENE-BY-SCENE TIMESTAMPS:
${ts1} - Scene 1: The Inciting Confrontation (${params.scenes[0]?.locationName || 'Penthouse Study'})
${ts2} - Scene 2: The Secret Signal & Escalation (${params.scenes[1]?.locationName || 'Glass Elevator'})
${ts3} - Scene 3: The Climax Standoff & Cliffhanger (${params.scenes[2]?.locationName || 'Underground Garage'})

🎭 CAST & CHARACTERS:
• ${params.char1Name} — The Determined Lead Attorney / Heir fighting betrayal from within
• ${params.char2Name} — The Cold, Calculating Corporate Partner orchestrating the hostile takeover
Directed & produced with Gemini Omni Flash 1.1 camera-first directives via FlowCreator OS Studio.

🎥 PRODUCTION & CINEMATOGRAPHY SPECIFICATIONS:
• Camera: ARRI Alexa Mini LF paired with Panavision Anamorphic T1.5 Primes
• Lighting: Chiaroscuro high-contrast volumetric keys with soft background bokeh
• Ratio: 9:16 Vertical Cinema Composition (Shorts / Reels / TikTok)
• Motion: 24fps cinema cadence with strict 180-degree eyeline blocking

🔍 TARGETED SEARCH KEYWORDS & TOPICS:
drama series 2026, web series, revenge thriller, full episode, corporate betrayal drama, best short drama, pakistani drama latest episode, hindi web series, high tension suspense, micro drama episode, trending series, dramatic showdown, legal thriller, betrayal story, cinematic shorts, episode ${params.dayNum}

💬 AUDIENCE DEBATE POLL — COMMENT BELOW:
Agar aap ${params.char1Name} ki jagah hotay to kya karte:
1️⃣ Police aur federal prosecutors ko inform karte?
2️⃣ Badla khud lete aur syndicate ko expose karte?
Drop your vote 1 ya 2 below! 👇

🔔 SUBSCRIBE & TURN ON BELL NOTIFICATIONS for Episode ${(params.dayNum % 7) + 1} releasing tomorrow! Don't miss the shocking season twist!`;

  const episodeYoutubeTags = [
    'drama series',
    `episode ${params.dayNum}`,
    'short film 2026',
    'crime thriller',
    'betrayal drama',
    'full episode',
    'micro drama',
    'cinematic shorts',
    'mystery series',
    'pakistani drama',
    'hindi drama',
    'web series episode',
    'thriller shorts',
    'omni flash video',
    'revenge thriller',
    'legal drama',
    'high tension',
    'storytelling',
    'viral series',
    'hollywood noir',
  ];

  const episodeSocialCaption = `“${params.lastCliffhangerDialogue.slice(0, 75)}...” 🥶\n\nEp ${params.dayNum} out now! Jab saboot samne aaya to sab badal gaya. Agar aap ${params.char1Name} ki jagah hotay to kya karte?\n\n1️⃣ Seedha arrest karwate\n2️⃣ Badla khud lete\n\nDrop 1 ya 2 in comments! 👇`.slice(0, 300);

  const episodeSocialHashtags = [
    '#dramaseries',
    '#shortdrama',
    '#cinematic',
    '#fyp',
    '#viral',
    '#thriller',
    '#revenge',
    '#tiktokdrama',
    '#reelsdrama',
    '#foryoupage',
  ];

  // 2. BTS POST METADATA
  const btsYoutubeTitle = `HOW WE SHOT EPISODE ${params.dayNum} STUNT & LIGHTING! 🎬 (Behind The Scenes)`.slice(0, 70);

  const btsYoutubeDescription = `Take an exclusive look behind the scenes of Episode ${params.dayNum} of "${params.seriesTitle}"!

From rigging the ARRI Alexa Mini LF on the Steadicam to locking the 180-degree eyeline between ${params.char1Name} and ${params.char2Name}, see how our director and cinematography team built the high-tension mood across three dynamic locations.

🎥 PRODUCTION GEAR BREAKDOWN:
• Camera: ARRI Alexa Mini LF with Anamorphic Prime Lenses
• Rig: Steadicam M-2 with Atomos Ninja High-Bright Director Monitor
• Lighting: Diffused softbox grid & high-contrast chiaroscuro keys
• Sound: Sennheiser MKH 416 boom mic with isolated dialogue capture

🔍 BTS SEARCH KEYWORDS & TOPICS:
behind the scenes filmmaking, movie set lighting, arri alexa mini lf, steadicam operator, actor rehearsal, cinematic lighting setup, short film production, direct cinematography, ai filmmaking workflow

💬 BTS QUESTION:
Did the lighting in the underground scene make you feel the tension? Tell us what you loved most about today's episode!

👉 Don't forget to watch the full Episode ${params.dayNum} on our channel!`;

  const btsYoutubeTags = [
    'behind the scenes',
    'filmmaking bts',
    'movie set',
    'director breakdown',
    'arri camera',
    'steadicam',
    'actor bloopers',
    'short film making',
    'cinematography lighting',
    'drama series bts',
    'film production',
    'camera rig',
    'lighting tutorial',
    'movie magic',
  ];

  const btsSocialCaption = `Camera off, smiles on! 😄 Set par ${params.char1Name} aur ${params.char2Name} jhagadte hain, lekin off-screen yeh scene 5 takes me shoot hua! Kiska acting sab se realistic laga? Comment 1 or 2! 👇`.slice(0, 300);

  const btsSocialHashtags = [
    '#behindthescenes',
    '#filmmaking',
    '#bts',
    '#movieproduction',
    '#actorlife',
    '#cinematography',
    '#directorlife',
    '#viralreels',
    '#fyp',
  ];

  return {
    episode: {
      youtube: {
        title: episodeYoutubeTitle,
        description: episodeYoutubeDescription,
        tags: episodeYoutubeTags,
        hashtags: ['#DramaSeries', '#ShortFilm', '#Thriller', '#YouTubeShorts', `#Ep${params.dayNum}`],
      },
      social: {
        caption: episodeSocialCaption,
        hashtags: episodeSocialHashtags,
        commentCallToAction: `Agar aap ${params.char1Name} ki jagah hotay to kya karte? Comment 1 ya 2! 👇`,
      },
    },
    bts: {
      youtube: {
        title: btsYoutubeTitle,
        description: btsYoutubeDescription,
        tags: btsYoutubeTags,
        hashtags: ['#BehindTheScenes', '#FilmMaking', '#BTS', '#MovieSet', '#Shorts'],
      },
      social: {
        caption: btsSocialCaption,
        hashtags: btsSocialHashtags,
        commentCallToAction: 'Kiska acting sab se realistic laga? Comment below! 👇',
      },
    },
  };
}
