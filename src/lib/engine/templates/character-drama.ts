import { StorySpec, ClipPrompt, InUniversePostBundle, CastMember, SceneContinuityLock } from '@/types';
import { generateLocationAnchorPrompt, enforceSpatialBlocking } from '../rules/spatial';
import { generateSecBySecTimeline, buildCinematicFlowVeoPrompt } from '../rules/temporal';
import { calculateWordCount } from '../rules/retention';
import { resolveEpisodeContinuity, buildContinuityFramePrompt } from '../rules/continuity';

export interface PlotClipDef {
  speakerName: string;
  silentNames: string[];
  dialogue: string;
  action: string;
  shotType: 'Shot-Reverse-Shot Close-Up' | 'Over-the-Shoulder' | 'Master Wide';
  sceneName: string;
  cameraSetup?: string;
}

export interface PlotData {
  title: string;
  hook: string;
  clips: PlotClipDef[];
}

/**
 * Resolves a dynamic, multi-genre, variation-specific plot for Character Drama.
 * If an existing dialogue script is provided, it prioritizes those exact lines.
 * Otherwise, it adapts dynamically to the custom premise, genre, characters, and variation type.
 */
export function resolveDynamicDramaPlot(
  spec: StorySpec,
  dayNum: number,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook' = 'High Tension',
  char1: CastMember,
  char2: CastMember,
  location: string,
  existingVariation?: any
): PlotData {
  // 1. PRIORITY: If existing variation has custom dialogueScript, preserve those exact lines!
  if (
    existingVariation?.dialogueScript &&
    Array.isArray(existingVariation.dialogueScript) &&
    existingVariation.dialogueScript.length >= 2
  ) {
    const clips: PlotClipDef[] = existingVariation.dialogueScript.slice(0, 4).map((d: any, idx: number) => {
      const isChar2 = d.speaker === char2.name || (idx % 2 === 1 && d.speaker !== char1.name);
      const activeSpeaker = isChar2 ? char2.name : char1.name;
      const counterpart = isChar2 ? char1.name : char2.name;
      const shotType = idx % 2 === 1 ? 'Shot-Reverse-Shot Close-Up' : idx === 0 ? 'Master Wide' : 'Over-the-Shoulder';
      return {
        speakerName: activeSpeaker,
        silentNames: [counterpart],
        dialogue: d.line,
        action: `Medium shot on ${activeSpeaker} in ${location}. Eyes locked with piercing analytical poise across the space, delivering the line with measured dramatic intensity.`,
        shotType: shotType as any,
        sceneName: `${existingVariation.title || `Ep ${dayNum}`} - Scene ${idx + 1}`,
      };
    });

    return {
      title: existingVariation.title || `Ep ${dayNum}: ${variationType}`,
      hook: existingVariation.hookDescription || `A high-stakes confrontation between ${char1.name} and ${char2.name}.`,
      clips,
    };
  }

  // 2. DETECT STORY PREMISE / GENRE
  const idea = `${spec.customStoryIdea || ''} ${spec.genres.join(' ')}`.toLowerCase();
  const isCyber = idea.includes('cyber') || idea.includes('hack') || idea.includes('ai') || idea.includes('tech') || idea.includes('server') || idea.includes('tokyo');
  const isPharma = idea.includes('pharma') || idea.includes('patent') || idea.includes('medical') || idea.includes('cure') || idea.includes('trial') || idea.includes('vaccine') || idea.includes('hospital');
  const isDetective = idea.includes('detective') || idea.includes('police') || idea.includes('crime') || idea.includes('murder') || idea.includes('investigation') || idea.includes('homicide');
  const isHeist = idea.includes('heist') || idea.includes('vault') || idea.includes('bank') || idea.includes('gold') || idea.includes('robbery');

  // =========================================================================
  // CYBER THRILLER MULTI-VARIATION PLOTS (7 DAYS x 3 VARIATIONS)
  // =========================================================================
  if (isCyber) {
    const cyberPlots: Record<number, Record<'High Tension' | 'Emotional Core' | 'Fast Hook', PlotData>> = {
      1: {
        'High Tension': {
          title: `Ep 1: The Root Access Breach - ${char1.name} vs ${char2.name}`,
          hook: `At 03:00 UTC, root administrative access to the quantum mainframe was granted from a private biometric key.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `At exactly 03:00 UTC, someone bypassed our multi-sig quantum firewall... and the terminal logs match your personal retinal key, ${char2.name}.`,
              action: `Medium close-up on ${char1.name} in ${location}. He places an encrypted holographic tablet showing live firewall breach telemetry onto the desk, eyes locked on ${char2.name}.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Root Access Breach - Telemetry',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `I didn't breach the network, ${char1.name}. The syndicate planted an air-gapped backdoor inside our core architecture months before we deployed.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. She calmly turns her monitor around, displaying the unauthorized compiled kernel code with an unflinching gaze.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Root Access Breach - Counter-Proof',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `If the syndicate planted it, ${char2.name}... then why does the exfiltration ledger show fifty terabytes of client biometric data routed to your private server?`,
              action: `Over-the-shoulder dramatic standoff in ${location}. ${char1.name} leans in, voice dropping to a tense whisper before locking eyes across the glowing console.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Root Access Breach - Revelation',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 1: The Stolen Algorithm - ${char1.name} vs ${char2.name}`,
          hook: `Four years of shared mathematical research sold in secret, leaving an unbreakable partnership in ruins.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `We spent four years building this encryption model to protect people, ${char2.name}. Tell me you didn't sell our life's work to the syndicate.`,
              action: `Medium shot on ${char1.name} in ${location}. He holds the printed patent application, voice laced with quiet devastation and disbelief.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Stolen Algorithm - Broken Trust',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `I sold the commercial rights so we could survive, ${char1.name}! The syndicate had our offshore accounts frozen... they gave me thirty hours before they targeted you.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Her composure wavers for a split second, step retreating toward the rain-streaked window.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Stolen Algorithm - Desperate Motive',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `You didn't protect me, ${char2.name}... you handed them the digital keys to control every financial system in this hemisphere.`,
              action: `Over-the-shoulder dramatic hold in ${location}. ${char1.name} slowly lowers the tablet into the dark, turning away with resolute coldness.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Stolen Algorithm - The Cost',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 1: The Severed Uplink - ${char1.name} vs ${char2.name}`,
          hook: `A flashing red emergency terminal and a 60-second countdown to a total data meltdown.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Step away from the primary terminal right now! The emergency kill-switch was activated from an offshore IP, and the purge has already begun.`,
              action: `Master wide into medium push-in in ${location}. Red emergency server lights bathe the room in rhythmic pulses as ${char1.name} strides to the central deck.`,
              shotType: 'Master Wide',
              sceneName: 'Severed Uplink - Emergency Lockout',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `If I release this override key, ${char1.name}, all twelve server nodes will be permanently encrypted by an external zero-day payload!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Both hands locked onto the master console, eyes wide under cold cyan terminal luminescence.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Severed Uplink - Zero Day Standoff',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Look at the payload signature on the wall monitor... that zero-day code was compiled on your personal workstation twenty minutes ago!`,
              action: `Over-the-shoulder sudden zoom in ${location}. ${char1.name} points directly at the glowing compiler timestamp as sirens echo through the building.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Severed Uplink - Signature Match',
            },
          ],
        },
      },
      2: {
        'High Tension': {
          title: `Ep 2: The Erased Proxy - ${char1.name} vs ${char2.name}`,
          hook: `Tracing the ghost transmission routed through an abandoned oceanic relay station.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The proxy node wasn't in Tokyo, ${char2.name}. It was routed through a decommissioned underwater fiber line registered to an intelligence shell company.`,
              action: `Medium close-up on ${char1.name} in ${location}. He slides a decrypted network routing diagram across the glass conference table.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Erased Proxy - Network Trace',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `That shell company belongs to Marcus Kane. He trades government surveillance feeds on the dark web, and he gave me the private decryption keys.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. She slides a titanium hardware token next to the diagram with icy confidence.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Erased Proxy - The Fixer Key',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Marcus Kane didn't give you that key out of loyalty. He was paid twenty million in untraceable crypto by the syndicate patriarch himself.`,
              action: `Over-the-shoulder dramatic tension in ${location}. ${char1.name} leans across the table, shadow falling over the hardware token.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Erased Proxy - Syndicate Wire',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 2: Ghost in the Machine - ${char1.name} vs ${char2.name}`,
          hook: `A hidden archive of personal communications proves that betrayal was planned months in advance.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `I recovered your encrypted backup vault, ${char2.name}. You drafted the syndicate settlement agreement six months before we even launched the product.`,
              action: `Medium close-up on ${char1.name} in ${location}. Voice soft yet razor-sharp with hurt, holding a single printed document.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Ghost in Machine - Premature Draft',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Because I knew what was coming! Our investors were never legitimate venture capitalists... they were cartel front men from day one!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Composure cracking as she reveals the real financial hierarchy.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Ghost in Machine - The Dirty Truth',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `If you knew they were cartel fronts, ${char2.name}... why did you take fifty million dollars to keep me in the dark?`,
              action: `Over-the-shoulder slow camera drift in ${location}. Heavy silence hangs before the final words cut through the room.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Ghost in Machine - The Silence Bought',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 2: The Hardware Key - ${char1.name} vs ${char2.name}`,
          hook: `An encrypted cold-storage drive arrives via courier with a warning: 'You have 24 hours.'`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `This cold-storage hardware drive was delivered to my private residence twenty minutes ago with your handwritten signature on the courier manifest.`,
              action: `Medium shot on ${char1.name} in ${location}. He slams a brushed-metal military flash drive onto the mahogany surface.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Hardware Key - Courier Delivery',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Do not plug that into any local network, ${char1.name}! That drive contains a self-replicating logic bomb that will destroy our cloud servers on contact!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. She lunges forward half a step, reaching out to stop him from connecting the drive.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Hardware Key - Warning',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `I already scanned the partition in an air-gapped sandbox... and the authorization password matches the date we founded this company.`,
              action: `Over-the-shoulder dramatic lock in ${location}. ${char1.name} holds the flashing drive inches from her face, eyes unwavering.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Hardware Key - The Password',
            },
          ],
        },
      },
      3: {
        'High Tension': {
          title: `Ep 3: The Intercepted Wiretap - ${char1.name} vs ${char2.name}`,
          hook: `A sub-audible acoustic frequency intercepted from smart speakers reveals live espionage.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Listen to this high-frequency audio playback, ${char2.name}. Every private strategy session in this penthouse was being mirrored to a federal server.`,
              action: `Medium close-up on ${char1.name} in ${location}. He taps a titanium digital audio analyzer, live green waveforms pulsing on screen.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Intercepted Wiretap - Spectrum Analysis',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `The federal prosecutors offered me immunity, ${char1.name}! If I didn't cooperate, they were going to indict both of us for treason by Friday.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Mask of executive poise fracturing into defensive intensity.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Intercepted Wiretap - Immunity Plea',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `They didn't give you immunity, ${char2.name}. I spoke to the attorney general an hour ago... you were designated the primary target from the beginning.`,
              action: `Over-the-shoulder dramatic confrontation in ${location}. ${char1.name} delivers the devastating truth as rain streaks the glass.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Intercepted Wiretap - Target Confirmed',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 3: The Wire in the Wall - ${char1.name} vs ${char2.name}`,
          hook: `The discovery that their most vulnerable confessions were recorded and weaponized.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `You wore a microphone to dinner last Tuesday. The night I told you about my father's final hospital days... you had a federal transmitter on your collar.`,
              action: `Medium close-up on ${char1.name} in ${location}. Voice cracking with suppressed fury and deep hurt, holding a micro-transmitter.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Wire in Wall - Personal Betrayal',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `I disabled the transmitter during that conversation, ${char1.name}! I would never hand over your family secrets... you have to believe that.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Eyes glistening under soft chiaroscuro lamp light, hand trembling slightly.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Wire in Wall - Desperate Defense',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `I checked the transmission log, ${char2.name}. The audio file was uploaded to the cloud five minutes before you walked out the front door.`,
              action: `Over-the-shoulder dramatic departure in ${location}. ${char1.name} drops the transmitter into a crystal tumbler of amber whiskey.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Wire in Wall - The Drop',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 3: The Surveillance Spike - ${char1.name} vs ${char2.name}`,
          hook: `Every smart device in the penthouse activates simultaneously, broadcasting an audio feed.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Look at the smart panels on the walls... all thirty-two microphones just unmuted themselves in unison!`,
              action: `Master wide shot in ${location}. Ambient ceiling lights flicker amber as acoustic feedback rings softly through the room.`,
              shotType: 'Master Wide',
              sceneName: 'Surveillance Spike - Audio Breach',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Cut the main breaker! Someone is executing an external acoustic sweep of this entire floor right now!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. She rushes toward the utility sub-panel, urgent intensity in every movement.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Surveillance Spike - Breaker Race',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Don't touch that breaker, ${char2.name}! The IP address receiving the live feed is registered to your private home router in Zurich!`,
              action: `Over-the-shoulder sharp pivot in ${location}. ${char1.name} steps between her and the panel, blocking her path with cold authority.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Surveillance Spike - Zurich IP',
            },
          ],
        },
      },
      4: {
        'High Tension': {
          title: `Ep 4: The Midnight Server Drop - ${char1.name} vs ${char2.name}`,
          hook: `An exchange in an underground server vault under the threat of immediate surveillance exposure.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The security perimeter around the underground server farm has been breached. Hand over the physical decryption drive before the sweep team enters.`,
              action: `Medium shot on ${char1.name} in ${location}. Cold blue server rack lights illuminating his sharp profile.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Midnight Drop - Server Perimeter',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `If I give you this drive, ${char1.name}, you'll wipe the evidence that exonerates me and leave me to face the federal grand jury alone.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Clutching the metallic drive case against her chest, resolute defiance.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Midnight Drop - Mutual Distrust',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `We have exactly forty seconds before the blast doors seal this corridor forever. Give me the drive or neither of us walks out of here.`,
              action: `Over-the-shoulder ticking clock beat in ${location}. Heavy hydraulic hiss resonates through the floor as warning lights flash.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Midnight Drop - Blast Doors Closing',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 4: Cold Storage - ${char1.name} vs ${char2.name}`,
          hook: `Trapped between rows of humming server racks, remembering the dream that turned into a prison.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Do you remember when we stood in an empty warehouse with five computers and promised we would never answer to corporate oligarchs?`,
              action: `Medium close-up on ${char1.name} in ${location}. Looking up at the monolithic server racks with nostalgic sorrow.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Cold Storage - Memory of Origins',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `We were naive children, ${char1.name}. The moment we built something worth billions, the oligarchs bought every judge and politician in the state.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Cold, pragmatic tone masking deep existential weariness.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Cold Storage - Pragmatic Truth',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `They bought everyone, ${char2.name}... except me. And tonight you're going to decide whose side you're really on.`,
              action: `Over-the-shoulder dramatic hold in ${location}. An ultimatum delivered with unshakeable moral clarity.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Cold Storage - The Choice',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 4: The Cooling Failure - ${char1.name} vs ${char2.name}`,
          hook: `Liquid nitrogen cooling pumps shut off; servers reaching catastrophic temperature threshold.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The liquid cooling pumps were manually severed! The server cores will reach thermal runaway in sixty seconds!`,
              action: `Master wide tracking shot in ${location}. White nitrogen steam spews across the raised server floor as sirens scream.`,
              shotType: 'Master Wide',
              sceneName: 'Cooling Failure - Thermal Runaway',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `The manual override valve is behind the primary mainframe! Pull the pressure release lever before the circuits melt!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Shielding her eyes against escaping steam, pointing through the mist.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Cooling Failure - Pressure Valve',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The valve has been padlocked from the outside with your security clearance tag attached to the chain!`,
              action: `Over-the-shoulder shocking revelation in ${location}. ${char1.name} holds up the severed brass chain, eyes flashing in the steam.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Cooling Failure - The Padlock',
            },
          ],
        },
      },
      5: {
        'High Tension': {
          title: `Ep 5: The Retinal Lock - ${char1.name} vs ${char2.name}`,
          hook: `An air-gapped biometric vault opens to reveal the ultimate hidden partition.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The air-gapped vault scanner only accepts two optical profiles in the world. Look at the digital ledger log right now.`,
              action: `Medium close-up on ${char1.name} in ${location}. He points to the glowing biometric terminal screen displaying access logs.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Retinal Lock - Biometric Match',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Someone cloned my optical corneal scan, ${char1.name}! Any tier-one intelligence operative with laser imaging could duplicate that pattern!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Rapid speech, cold composure giving way to genuine defensive alarm.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Retinal Lock - Optical Duplication',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `They didn't clone your eye, ${char2.name}. The timestamp confirms you entered this room while I was testifying before the congressional committee!`,
              action: `Over-the-shoulder standoff in ${location}. ${char1.name} brings up the date-stamped surveillance snapshot of her face.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Retinal Lock - The Alibi Broken',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 5: The Master Partition - ${char1.name} vs ${char2.name}`,
          hook: `A secret partition contains the encrypted audio journal of a deceased founder.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The partition you locked away held my father's audio logs from his final week alive. Why did you hide his voice from me?`,
              action: `Medium close-up on ${char1.name} in ${location}. Holding a silver audio drive, raw emotional vulnerability breaking through.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Master Partition - Father Audio',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Because he wasn't the heroic visionary you idolized, ${char1.name}! If you listen to that drive, it will destroy every memory you have of him!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Voice cracking with fierce protective emotion, reaching for his arm.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Master Partition - The Broken Idol',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `I would rather live with a devastating truth than spend another day inside your comfortable fortress of lies.`,
              action: `Over-the-shoulder resolute movement in ${location}. ${char1.name} plugs the drive into the master console as the screen flickers.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Master Partition - The Truth Loaded',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 5: The Laser Bypass - ${char1.name} vs ${char2.name}`,
          hook: `A thermal laser burns through the vault door as an electronic countdown timer beeps.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The laser bypass has breached the outer titanium seal! We have twenty seconds before the halon gas suppression deploys!`,
              action: `Master wide in ${location}. Molten sparks shower against the steel vault door as a thermal drill cuts the secondary lock.`,
              shotType: 'Master Wide',
              sceneName: 'Laser Bypass - Thermal Cut',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Grab the master cryptographic backup and get behind the blast shield right now!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Grabbing the heavy lead-lined case, urgency flashing across her face.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Laser Bypass - Blast Shield',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Look at the casing of the thermal drill... it has the corporate serial numbers of our own security division stamped on the barrel!`,
              action: `Over-the-shoulder shocking realization in ${location}. ${char1.name} illuminates the etched serial stamp with his flashlight.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Laser Bypass - Inside Job',
            },
          ],
        },
      },
      6: {
        'High Tension': {
          title: `Ep 6: The Federal Wiretap Standoff - ${char1.name} vs ${char2.name}`,
          hook: `Approaching sirens, tactical elevator rising, and a live audio call that never disconnected.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Every word we spoke in this corridor was intercepted. Look at your phone right now... the call to the federal prosecutor never disconnected.`,
              action: `Medium close-up on ${char1.name} in ${location}. He grabs her phone from the counter, showing the live active green call running for 47 minutes.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Wiretapped Standoff - Intercept',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `I had to protect myself, ${char1.name}! They promised me full immunity if I delivered the signed confession before the midnight deadline!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Mask of composure completely fracturing into panic as footsteps approach outside.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Wiretapped Standoff - Immunity Confession',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Your immunity deal was revoked twenty minutes ago. The prosecutor used you to pinpoint the GPS coordinates of the master server.`,
              action: `Medium shot on ${char1.name} in ${location}. He turns the phone over to reveal the red revoke alert flashing on the justice portal.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Wiretapped Standoff - Revocation',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 6: The Final Confession - ${char1.name} vs ${char2.name}`,
          hook: `Two former allies stand in the flashing red and blue lights, facing the end of their empire.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Was any of it real, ${char2.name}? The trust, the late nights, the promises... or was I just an asset you managed from the beginning?`,
              action: `Medium close-up on ${char1.name} in ${location}. Flashing red and blue cruiser lights strobing against his face through the blinds.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Final Confession - Was It Real',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `You were the only part of my life that wasn't a calculated lie, ${char1.name}. But when they threatened to bury me in federal prison... I broke.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Single tear catching the blue emergency lights, voice dropping to a fragile whisper.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Final Confession - The Broken Mask',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Then take the master drive and take the service tunnel. Because I will not let them parade you in handcuffs before the world.`,
              action: `Over-the-shoulder dramatic sacrifice in ${location}. ${char1.name} thrusts the drive into her hands, pointing toward the fire exit.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Final Confession - The Escape Offer',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 6: The Sirens Arrive - ${char1.name} vs ${char2.name}`,
          hook: `Sixty seconds until tactical breach as armored SWAT elevators reach the penthouse level.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The tactical elevator just passed floor forty-eight! We have sixty seconds before flashbangs breach the frosted glass lobby doors!`,
              action: `Master wide shot in ${location}. Searchlights slice through the glass windows as heavy elevator cables whine in the shaft.`,
              shotType: 'Master Wide',
              sceneName: 'Sirens Arrive - Floor 48',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `The data wiper needs seventy-five seconds to complete the cryptographic zeroization of the quantum servers!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Staring at the progress bar ticking: 62%... 63%...`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Sirens Arrive - Progress Bar',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `We don't have seventy-five seconds! Listen to the corridor... the breaching charge has already been placed on the outer door!`,
              action: `Over-the-shoulder tense cutoff in ${location}. A metallic clinking sound echoes against the lobby steel as countdown beeps.`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Sirens Arrive - Breaching Charge',
            },
          ],
        },
      },
      7: {
        'High Tension': {
          title: `Ep 7: Season Finale: The Mastermind Revealed - ${char1.name} vs ${char2.name}`,
          hook: `A disconnected analog telephone rings in the empty penthouse as a presumed-dead founder speaks.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The building is surrounded, ${char2.name}. We have ninety seconds before the federal tactical team breaches the private elevators.`,
              action: `Master wide into medium close-up on ${char1.name} in ${location}. Helicopter searchlight beams slice through the glass windows.`,
              shotType: 'Master Wide',
              sceneName: 'Season Finale - Tactical Countdown',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Listen... the rotary phone on the mahogany table is ringing. That is a copper analog line that was disconnected fifteen years ago!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. An antique black rotary telephone suddenly rings with harsh mechanical clatter.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Season Finale - The Disconnected Phone',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `The receiver clicks in my hand... and a chilled baritone voice speaks: 'Did you really think a fake disappearance could silence Arthur Vance, son?'`,
              action: `Dramatic over-the-shoulder close-up in ${location}. ${char1.name} lifts the heavy receiver to his ear as screen abruptly cuts to black at 0:09.5s!`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Season Finale - Arthur Vance Returns',
            },
          ],
        },
        'Emotional Core': {
          title: `Ep 7: Season Finale: Bloodline - ${char1.name} vs ${char2.name}`,
          hook: `The devastating revelation that their mortal rivalry was orchestrated by the very father they sought to honor.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Everything we fought over—the shares, the patents, the syndicate money—was a test designed by my father to see who would survive.`,
              action: `Medium shot on ${char1.name} in ${location}. Holding a handwritten letter sealed with the family wax crest, voice heavy with sorrow.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Season Finale - The Father Test',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `He didn't want partners, ${char1.name}. He wanted a ruthless successor who would sacrifice everything for the family empire.`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Looking at him with deep melancholy as flashing siren lights paint her face.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Season Finale - The Ruthless Successor',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Then he miscalculated. Because I would rather watch this entire empire burn than become the monster he wanted me to be.`,
              action: `Over-the-shoulder dramatic defiance in ${location}. ${char1.name} drops the letter into the flames of the fireplace; screen cuts to black at 0:09.5s!`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Season Finale - The Empire Burned',
            },
          ],
        },
        'Fast Hook': {
          title: `Ep 7: Season Finale: The Blackout - ${char1.name} vs ${char2.name}`,
          hook: `A sudden citywide power grid blink plunges the high-rise into darkness as heavy footsteps approach.`,
          clips: [
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Look at the city skyline outside... the entire downtown power grid just went pitch black!`,
              action: `Master wide shot in ${location}. Towering city skyscrapers outside suddenly lose all power, plunging the room into silhouette.`,
              shotType: 'Master Wide',
              sceneName: 'Season Finale - City Blackout',
            },
            {
              speakerName: char2.name,
              silentNames: [char1.name],
              dialogue: `Backup generators aren't kicking in! That wasn't a municipal outage... that was an EMP strike on our substation!`,
              action: `Tight reverse shot on ${char2.name} in ${location}. Emergency red glow sticks illuminating her panicked expression.`,
              shotType: 'Shot-Reverse-Shot Close-Up',
              sceneName: 'Season Finale - EMP Strike',
            },
            {
              speakerName: char1.name,
              silentNames: [char2.name],
              dialogue: `Heavy footsteps just stepped through the broken lobby doors... and a voice in the dark whispers: 'Welcome home, children.'`,
              action: `Dramatic slow push-in in ${location}. Red emergency shadows silhouette an ominous figure in the doorway; abrupt black cut at 0:09.5s!`,
              shotType: 'Over-the-Shoulder',
              sceneName: 'Season Finale - Welcome Home (Cut to Black)',
            },
          ],
        },
      },
    };

    const dayPlots = cyberPlots[dayNum] || cyberPlots[1];
    return dayPlots[variationType] || dayPlots['High Tension'];
  }

  // =========================================================================
  // CORPORATE / LEGAL NOIR MULTI-VARIATION PLOTS (DEFAULT / GENERAL NOIR)
  // =========================================================================
  const corporatePlots: Record<number, Record<'High Tension' | 'Emotional Core' | 'Fast Hook', PlotData>> = {
    1: {
      'High Tension': {
        title: `Ep 1: The Forged Will - ${char1.name} vs ${char2.name}`,
        hook: `A fast-paced 30s confrontation over 40% stolen company shares and a forged vault authorization.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `At exactly 2:14 AM, forty percent of our family shares were transferred out of the trust... and the digital vault authorization was in your hands, ${char2.name}.`,
            action: `Medium close-up on ${char1.name} in ${location}. He deliberately places a sealed black folder containing the forged share transfer onto the dark mahogany desk, eyes locked with calm intensity on ${char2.name}.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Forged Will - Accusation',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Those signatures weren't forged, ${char1.name}. Your father authorized that emergency transfer himself because he knew your reckless pride would pull this firm into bankruptcy.`,
            action: `Tight reverse medium shot on ${char2.name} in ${location}. She slowly lifts her chin, completely unfazed, smoothly sliding a signed trust authorization form across the desk with icy composure.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Forged Will - Rebuttal',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `If my father authorized it, ${char2.name}... then why does the vault CCTV footage show you deleting the backup logs with Marcus Kane standing beside you?`,
            action: `Over-the-shoulder dramatic standoff in ${location}. ${char1.name} grabs the frosted glass door handle, turning his neck back with piercing intensity to deliver the CCTV revelation.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Forged Will - Cliffhanger',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 1: The Broken Oath - ${char1.name} vs ${char2.name}`,
        hook: `A decade of mutual loyalty shattered when a secret boardroom voting proxy comes to light.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Ten years ago we stood on this terrace and swore we would never become the monsters who ruined our fathers. Look at what you signed today, ${char2.name}.`,
            action: `Medium shot on ${char1.name} in ${location}. He holds the single signed voting proxy sheet, voice heavy with deep emotional betrayal.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Broken Oath - The Oath Remembered',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `I signed it because the board had an emergency indictment ready for you, ${char1.name}! I surrendered our voting rights so you wouldn't spend twenty years in a federal penitentiary!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Her icy mask cracks with fierce protective hurt, step advancing toward him.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Broken Oath - The Sacrifice Claimed',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `You didn't save me from prison, ${char2.name}... you just chose who gets to hold the leash.`,
            action: `Over-the-shoulder slow camera push-in in ${location}. ${char1.name} turns his face toward the night rain, resolute detachment settling in.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Broken Oath - The Leash',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 1: The Midnight Shredder - ${char1.name} vs ${char2.name}`,
        hook: `An industrial shredder humming in the dark executive suite as critical audit documents vanish.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Step away from the shredder right now, ${char2.name}! The compliance team in Geneva already mirrored every keystroke on your terminal.`,
            action: `Master wide into medium close-up in ${location}. ${char1.name} enters the dimly lit office as mechanical shredder teeth whine loudly.`,
            shotType: 'Master Wide',
            sceneName: 'The Midnight Shredder - Caught Red Handed',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `These aren't company records, ${char1.name}! These are confidential letters your father wrote detailing where the fifty million disappeared!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Hands pulling a thick cream envelope back from the feeder slot just in time.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Midnight Shredder - The Father Letters',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Then why is the signature block on that envelope notarized with yesterday's date... and written in your handwriting?`,
            action: `Over-the-shoulder tight zoom in ${location}. ${char1.name} snatches the charred document corner, eyes locking on the fresh ink seal.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Midnight Shredder - Fresh Notary Seal',
          },
        ],
      },
    },
    2: {
      'High Tension': {
        title: `Ep 2: The Erased Drive - ${char1.name} vs ${char2.name}`,
        hook: `A 30s investigation into the erased security drive and the secret payout to fixer Marcus Kane.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Marcus Kane wasn't deleting the backup logs, ${char1.name}. He was extracting the encrypted ledger before someone inside this firm could wipe the evidence forever.`,
            action: `Medium close-up on ${char1.name} in ${location}. He places a high-resolution surveillance photo of Marcus Kane in the vault right in front of ${char2.name}.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Erased Drive - Investigation',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Marcus is a confidential fixer who trades classified corporate intelligence to the highest bidder! Who wired fifty million dollars to his offshore account, ${char2.name}?`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She folds her arms calmly over her structured navy blazer, meeting his gaze without a flicker of panic.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Erased Drive - Strategic Inquiry',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The wire transfer didn't come from a stranger, ${char1.name}. It originated from an offshore account in Zurich registered under your mother's maiden name.`,
            action: `Over-the-shoulder shot in ${location}. ${char1.name} stiffens in disbelief, staring at the Zurich bank routing sheet before stepping into the shadow.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Erased Drive - Zurich Revelation',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 2: The Price of Loyalty - ${char1.name} vs ${char2.name}`,
        hook: `Confronting the shadow payments that severed a lifelong partnership.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `I stood beside you at your mother's funeral, ${char2.name}. I believed you were the one person in this city who couldn't be bought with dirty offshore cash.`,
            action: `Medium shot on ${char1.name} in ${location}. Looking down at the bank routing statement with quiet heartbreak.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Price of Loyalty - Funeral Memory',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `That money didn't buy my soul, ${char1.name}! It bought Marcus Kane's silence so he wouldn't release the audio that would ruin your father's legacy!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Steely jaw clenching as emotional truth pours out.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Price of Loyalty - Silence Bought',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `My father's legacy was already dead, ${char2.name}. The only thing you buried was my ability to ever believe you again.`,
            action: `Over-the-shoulder camera pull-back in ${location}. Cold separation settling between both partners.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Price of Loyalty - The Final Wedge',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 2: The Courier Intercept - ${char1.name} vs ${char2.name}`,
        hook: `A dead courier outside the private garage and an encrypted vault drive in hand.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The private courier who carried the Zurich routing sheets was intercepted in the executive garage ten minutes ago.`,
            action: `Medium shot on ${char1.name} in ${location}. He holds a bloodless tamper-proof courier pouch sealed with security tape.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Courier Intercept - The Pouch',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Did Marcus Kane get the original ledger? Tell me the syndicate enforcers haven't reached the server room!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She drops her briefcase onto the leather sofa with urgent alarm.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Courier Intercept - Syndicate Panic',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Marcus didn't touch the courier, ${char2.name}. The man who signed for the delivery at the guard gate had your biometric access badge!`,
            action: `Over-the-shoulder dramatic confrontational punch in ${location}. ${char1.name} slaps the gate log sheet against the glass.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Courier Intercept - The Badge Match',
          },
        ],
      },
    },
    3: {
      'High Tension': {
        title: `Ep 3: The Blackmail Recording - ${char1.name} vs ${char2.name}`,
        hook: `A deep 40s scene where an encrypted penthouse audio file exposes high-level judicial corruption.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `I received an encrypted audio file thirty minutes ago. Listen to the background acoustic frequency... that was recorded inside this exact penthouse last Thursday.`,
            action: `Medium close-up on ${char1.name} in ${location}. He presses play on a titanium voice recorder resting on the glass coffee table, low audio hiss filling the room.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Blackmail Recording - Playback',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Stop digging into that recording, ${char1.name}! If that audio reaches the federal grand jury, everyone holding equity in this company goes to federal prison.`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She abruptly steps forward, right hand pressing firmly down onto the recorder to stop playback, jaw clenched.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Blackmail Recording - Urgent Threat',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `I'm not worried about federal prison, ${char2.name}. I'm wondering why the third voice on that tape is the chief presiding judge of our trial.`,
            action: `Over-the-shoulder shot in ${location}. ${char1.name} slowly lifts his hand off the table, eyes boring into ${char2.name} with cold, surgical defiance.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Blackmail Recording - The Judge Revelation',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 3: Whispers in the Penthouse - ${char1.name} vs ${char2.name}`,
        hook: `Discovering that the only person you confided in was selling your words to the enemy.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `On this tape, you promised them I would settle out of court by Friday. You sold my legal reputation before we even filed the motion.`,
            action: `Medium close-up on ${char1.name} in ${location}. Looking at ${char2.name} with deep, measured sorrow.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Whispers in Penthouse - Settled Out of Court',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `I settled to stop them from assassinating your character in the press! You have no idea what these power brokers do to idealistic attorneys!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Passionate, defensive justification, eyes glistening under lamp light.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Whispers in Penthouse - Protecting Ideals',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `My ideals survived law school, corporate court, and my father's death. The only thing that killed them was your signature.`,
            action: `Over-the-shoulder somber exit in ${location}. ${char1.name} turns off the audio player with a quiet click.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Whispers in Penthouse - The Death of Ideals',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 3: The Active Bug - ${char1.name} vs ${char2.name}`,
        hook: `A live RF transmitter discovered hidden inside an antique bronze clock.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Look behind the pendulum of this bronze mantel clock. That blinking amber diode has been broadcasting every breath in this room for forty-eight hours.`,
            action: `Master wide into medium close-up in ${location}. ${char1.name} uses needle-nose tweezers to extract a miniature transmitter from the antique clock.`,
            shotType: 'Master Wide',
            sceneName: 'The Active Bug - Extraction',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Don't crush it, ${char1.name}! If the transmission signal goes dead, their technical van on the street will know they've been compromised!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Peering through the blinds into the rainy street four floors below.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Active Bug - Street Van',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Let them know. Because I just traced the radio receiver frequency... and it's tuned directly into the audio console in your private limousine!`,
            action: `Over-the-shoulder dramatic confrontation in ${location}. ${char1.name} drops the tiny bug onto the glass table with a sharp clink.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Active Bug - Limousine Receiver',
          },
        ],
      },
    },
    4: {
      'High Tension': {
        title: `Ep 4: The Midnight Exchange - ${char1.name} vs ${char2.name}`,
        hook: `A clandestine handover of blackmail leverage in the shadowy subterranean executive garage.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Marcus Kane agreed to hand over the original unedited offshore wire transfer ledger. But he demanded you bring the second key yourself, ${char2.name}.`,
            action: `Medium shot on ${char1.name} in ${location}. Rain pours outside as neon reflections streak across his coat collar.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Midnight Exchange - The Demand',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Marcus Kane is setting an ambush, ${char1.name}! If I step into that underground garage with that key, neither of us walks out alive!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Steely eyes narrowing with controlled intensity, refusing to budge from the doorway.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Midnight Exchange - Ambush Warning',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `He's not waiting for an ambush, ${char2.name}. Look out the window... Marcus's black sedan just pulled into our private driveway.`,
            action: `Over-the-shoulder shot in ${location}. ${char1.name} pulls back the heavy velvet curtain as headlights illuminate the rainy courtyard.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Midnight Exchange - Headlights in Driveway',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 4: Shadows in the Rain - ${char1.name} vs ${char2.name}`,
        hook: `Meeting like fugitives in their own firm, realizing how far they have fallen.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Look at us. Whispering in corners, meeting fixers in parking structures... we've become the exact criminal syndicate we swore to take down.`,
            action: `Medium close-up on ${char1.name} in ${location}. Rain drumming hard against the glass, reflection shimmering in dark pools.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Shadows in Rain - Fallen Standards',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Survival in this town is messy, ${char1.name}. Clean hands are a luxury for people who don't have fifty employees depending on their payroll.`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Pouring two fingers of bourbon with steady, unfazed hands.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Shadows in Rain - Clean Hands Luxury',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Don't hide behind the employees, ${char2.name}. Tonight, when Marcus Kane arrives, you're going to tell him the truth about Zurich.`,
            action: `Over-the-shoulder steadfast resolve in ${location}. ${char1.name} pushes the crystal tumbler away, refusing to drink.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Shadows in Rain - The Refusal',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 4: The Approaching Headlights - ${char1.name} vs ${char2.name}`,
        hook: `Black SUVs surround the executive courtyard with high-beam halogen lights.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Those aren't Marcus Kane's headlights. Three black armored Suburbans just blocked the gate entrance with engines running.`,
            action: `Master wide in ${location}. Blinding white halogen beams cut through the rainy blinds, casting stark horizontal shadows.`,
            shotType: 'Master Wide',
            sceneName: 'Approaching Headlights - Armored Suburbans',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `That's the state enforcement division! Grab the physical ledger and meet me at the private fire stairs right now!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Grabbing a leather briefcase from under the desk with lightning speed.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Approaching Headlights - Fire Stairs',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The fire stairs are locked from the outside. Look through the peephole... someone chained the exit doors five minutes ago!`,
            action: `Over-the-shoulder dramatic tension in ${location}. ${char1.name} rattles the heavy exit door handle as heavy boots ascend the stairs.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Approaching Headlights - Chained Exit',
          },
        ],
      },
    },
    5: {
      'High Tension': {
        title: `Ep 5: Box 409 - ${char1.name} vs ${char2.name}`,
        hook: `A 40s scene inside the bank vault corridor: Shattered glass biometric card and the retinal printout.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `At 11:45 PM last night, Safety Deposit Box 409 was unlocked. The biometric keycard was snapped in half and left on the vault floor.`,
            action: `Medium shot on ${char1.name} in ${location}. He places the fractured translucent keycard into the circle of lamp light.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Box 409 - Broken Card',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Look at the optical scan log, ${char1.name}. The scanner registered a retinal match that belongs to someone declared retired three years ago!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She slides the security printout across the dark mahogany table with steely poise.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Box 409 - Retinal Match',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `There are only two people alive registered to that vault... you, and the founder you swore permanently resigned three years ago!`,
            action: `Over-the-shoulder dramatic standoff in ${location}. ${char1.name} leans in, voice dropping to a tense whisper before turning sharply.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Box 409 - The Retired Founder',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 5: The Missing Letters - ${char1.name} vs ${char2.name}`,
        hook: `Box 409 held personal family letters, but someone emptied the vault before sunrise.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Box 409 didn't hold company stock or bearer bonds. It held the private journal my father wrote while he was dying.`,
            action: `Medium close-up on ${char1.name} in ${location}. Staring at the empty velvet box with raw emotional vulnerability.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Missing Letters - Empty Velvet',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `I took that journal to protect you, ${char1.name}! The pages inside would have destroyed every illusion you ever had about your family name!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Stepping toward him, voice trembling with genuine emotional turmoil.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Missing Letters - Shattered Illusion',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Give me the journal, ${char2.name}. Because I will not let you curate my memories of the father who raised me.`,
            action: `Over-the-shoulder cold demand in ${location}. ${char1.name} extends an open hand, unmoving in the chiaroscuro light.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Missing Letters - The Hand Outstretched',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 5: The Vault Alarm - ${char1.name} vs ${char2.name}`,
        hook: `A drill bypass sparks in the safe deposit corridor as sirens blare.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The electronic drill bypass just tripped the silent alarm on Box 409! We have four minutes before the tactical response team arrives!`,
            action: `Master wide in ${location}. Red emergency lights spin along the ceiling as mechanical drill smoke drifts through the air.`,
            shotType: 'Master Wide',
            sceneName: 'Vault Alarm - Silent Trip',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Pull the lock cylinder now! The master cryptographic key is inside the inner steel compartment!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Working the manual bypass tool with frantic, precise skill.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Vault Alarm - Cylinder Pull',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The lock cylinder is already empty. Look at the brass plate... someone drilled this box at two o'clock this morning!`,
            action: `Over-the-shoulder shocking reveal in ${location}. ${char1.name} shines his light into the hollow empty metal compartment.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Vault Alarm - Empty Hollow',
          },
        ],
      },
    },
    6: {
      'High Tension': {
        title: `Ep 6: The Wiretapped Standoff - ${char1.name} vs ${char2.name}`,
        hook: `A 40s sequence where a live federal wiretap and approaching sirens push both partners to the brink.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Every word we spoke in this corridor was intercepted. Look at your phone right now... the call to the federal prosecutor never disconnected.`,
            action: `Medium close-up on ${char1.name} in ${location}. He grabs ${char2.name}'s phone from the counter, showing the live active green call screen running for 47 minutes.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Wiretapped Standoff - Intercept',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `I had to protect myself, ${char1.name}! They promised me full immunity if I delivered the signed confession before the midnight deadline!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She stumbles back half an inch against the bookshelf, mask of composure finally fracturing into panic.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Wiretapped Standoff - Immunity Confession',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Your immunity deal was revoked twenty minutes ago. The prosecutor used you to pinpoint the GPS coordinates of the master server.`,
            action: `Medium shot on ${char1.name} in ${location}. He turns the phone over to reveal the red revoke alert flashing on the Department of Justice portal.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'The Wiretapped Standoff - Revocation',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Look out the window... the sirens have already entered the courtyard, and the tactical elevator is rising right now.`,
            action: `Over-the-shoulder shot in ${location}. ${char1.name} points toward the high-rise balcony as flashing blue and red emergency lights reflect off the ceiling.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'The Wiretapped Standoff - Sirens Approaching',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 6: The Broken Mirror - ${char1.name} vs ${char2.name}`,
        hook: `Looking at each other across the room, realizing that ambition destroyed the only thing worth saving.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `We built a multi-billion dollar firm, ${char2.name}. And standing here tonight, we don't have a single person in this city we can trust.`,
            action: `Medium close-up on ${char1.name} in ${location}. Looking out the panoramic window at the nocturnal city skyline.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Broken Mirror - Empty City',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `I trusted you, ${char1.name}. Until the day your father told me that you were planning to dissolve our partnership.`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Voice quiet and raw, leaning against the dark mahogany bookshelf.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Broken Mirror - The Father Lie',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `My father lied to you, ${char2.name}. He played us against each other so neither of us could ever take control from him.`,
            action: `Over-the-shoulder realization in ${location}. Both partners freeze as the horrifying truth of their manipulation sinks in.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Broken Mirror - Orchestrated War',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 6: The Tactical Sweep - ${char1.name} vs ${char2.name}`,
        hook: `Elevator doors ding on the private penthouse floor as boot steps march in formation.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The private elevator just opened! Tactical agents are in the vestibule right now!`,
            action: `Master wide in ${location}. Heavy tactical boots march in sync on polished marble outside the frosted glass foyer.`,
            shotType: 'Master Wide',
            sceneName: 'Tactical Sweep - In the Vestibule',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `The service elevator key is in the safe! If we don't move in ten seconds, we're trapped in this room!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Frantically spinning the brass combination dial on the wall safe.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Tactical Sweep - Safe Dial',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Stop spinning the dial. The man leading the tactical squad... is Marcus Kane.`,
            action: `Over-the-shoulder shocking reveal in ${location}. ${char1.name} peers through the peephole as shadow moves across the frosted glass.`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Tactical Sweep - Marcus Kane Leads',
          },
        ],
      },
    },
    7: {
      'High Tension': {
        title: `Ep 7: Season Finale: The Federal Ambush - ${char1.name} vs ${char2.name}`,
        hook: `A grand 50s Season Finale: Tactical raid breach, the master drive trade, and the shocking phone call.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The building is surrounded. We have ninety seconds before the federal tactical team breaches the private elevators.`,
            action: `Master wide into medium close-up on ${char1.name} in ${location}. Searchlight beams from tactical police helicopters slice through the glass penthouse windows.`,
            shotType: 'Master Wide',
            sceneName: 'Season Finale - Tactical Countdown',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Take the master drive through the service tunnel, ${char1.name}! You're the only one left who knows the access keys to the offshore accounts.`,
            action: `Tight reverse shot on ${char2.name} in ${location}. She holds the metal briefcase out with trembling hands, tears threatening her otherwise steely expression.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Season Finale - Briefcase Handover',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `I'm not running without the truth, ${char2.name}. Look me in the eyes and tell me... was my father really the one who authorized this hostile operation?`,
            action: `Medium close-up on ${char1.name} in ${location}. He stands firm amid the strobe of police sirens, refusing to grab the emergency bug-out bag.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Season Finale - The Truth Demanded',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Listen... the phone on the desk is ringing. That is a hardwired analog copper line that was disconnected fifteen years ago.`,
            action: `Wide camera tracking shot in ${location}. An antique black rotary phone on the mahogany side table suddenly rings with harsh mechanical clatter.`,
            shotType: 'Master Wide',
            sceneName: 'Season Finale - The Disconnected Phone',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `The receiver clicks in my hand... and the voice on the other end speaks: 'Did you really think an offshore disappearance could silence Arthur Vance, son?'`,
            action: `Dramatic over-the-shoulder close-up in ${location}. ${char1.name} lifts the heavy black receiver to his ear as chilling baritone voice speaks; screen abruptly cuts to pitch black at 0:09.5s!`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Season Finale - Arthur Vance Returns (Cut to Black)',
          },
        ],
      },
      'Emotional Core': {
        title: `Ep 7: Season Finale: The Final Stand - ${char1.name} vs ${char2.name}`,
        hook: `Standing together as the sirens close in, choosing loyalty over self-preservation.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `For seven days we tried to destroy each other, ${char2.name}. But the real enemy was waiting in the shadows all along.`,
            action: `Medium shot on ${char1.name} in ${location}. Flashing red and blue lights painting his face as he stands beside her.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Season Finale - Enemy in Shadows',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `If we walk through those doors together, ${char1.name}... there is no turning back. We will be fighting the most powerful syndicate in the world.`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Clasping his hand firmly with unshakeable partnership.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Season Finale - No Turning Back',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Then let them come. Because tonight, ${char1.name} and ${char2.name} are taking their firm back.`,
            action: `Over-the-shoulder dramatic forward march in ${location}. Both partners step side-by-side toward the double doors; screen cuts to black at 0:09.5s!`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Season Finale - Taking Firm Back (Cut to Black)',
          },
        ],
      },
      'Fast Hook': {
        title: `Ep 7: Season Finale: The Blast - ${char1.name} vs ${char2.name}`,
        hook: `A flashbang detonates in the foyer as the clock strikes midnight.`,
        clips: [
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `Cover your eyes! Breaching charge on the main entrance!`,
            action: `Master wide explosive shock in ${location}. The frosted glass foyer doors burst inward in a cloud of white smoke and flying glass.`,
            shotType: 'Master Wide',
            sceneName: 'Season Finale - Breaching Blast',
          },
          {
            speakerName: char2.name,
            silentNames: [char1.name],
            dialogue: `Grab the master drive and head through the fire exit! I'll hold the server lock from here!`,
            action: `Tight reverse shot on ${char2.name} in ${location}. Shielding her face through smoke, shouting over deafening alarm sirens.`,
            shotType: 'Shot-Reverse-Shot Close-Up',
            sceneName: 'Season Finale - Hold Server Lock',
          },
          {
            speakerName: char1.name,
            silentNames: [char2.name],
            dialogue: `A figure emerges through the white smoke... and the voice speaks: 'Did you miss me, children?' Abrupt cut to pitch black!`,
            action: `Slow cinematic push-in through smoke in ${location}. An aristocratic silhouette steps into the frame; screen cuts abruptly to black at 0:09.5s!`,
            shotType: 'Over-the-Shoulder',
            sceneName: 'Season Finale - Figure in Smoke (Cut to Black)',
          },
        ],
      },
    },
  };

  const dayPlots = corporatePlots[dayNum] || corporatePlots[1];
  return dayPlots[variationType] || dayPlots['High Tension'];
}

export function buildCharacterDramaClips(
  spec: StorySpec,
  dayEmotion: string,
  variationType: 'High Tension' | 'Emotional Core' | 'Fast Hook' = 'High Tension',
  dayNum: number = 1,
  existingVariation?: any
): {
  title: string;
  hookDescription: string;
  clips: ClipPrompt[];
  characterAnchors: { characterName: string; anchorPrompt: string }[];
  locationAnchors: { locationName: string; anchorPrompt: string }[];
  dialogueScript: { speaker: string; line: string; timing: string }[];
  inUniversePosts?: InUniversePostBundle;
  sceneContinuityLock?: SceneContinuityLock;
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

  // Dynamic plot resolution: adapts to custom premise, variation type, or existing variation dialogue!
  const activePlot = resolveDynamicDramaPlot(
    spec,
    dayNum,
    variationType,
    char1,
    char2,
    location,
    existingVariation
  );

  const title = activePlot.title;
  const hookDescription = activePlot.hook;
  const continuity = resolveEpisodeContinuity(spec, dayNum, title, 'character_drama');

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
      seriesTitle: spec.seriesTitle,
      seasonNumber: spec.seasonNumber || 1,
      seasonTitle: spec.seasonTitle,
      episodeNumber: dayNum,
      episodeTitle: activePlot.title.replace(/^Ep \d+:\s*/, '').split(' - ')[0],
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
      vocalModulation:
        activeChar.role === 'Hero'
          ? 'Delivery starts with calm, quiet restraint (narmi), gradually hardening into a sharp, steely edge of legal authority (sakhti), dropping to a cold whisper on the final name.'
          : 'Voice starts with an icy, dismissive calm (narmi), shifting into an unflinching, steely cadence of executive certainty (sakhti) without raising volume.',
    });

    const activeWardrobe =
      continuity.wardrobeLocks.find(
        (w) => w.characterName.toLowerCase() === activeChar.name.toLowerCase()
      )?.exactOutfit || continuity.wardrobeLocks[0]?.exactOutfit || 'Tailored bespoke dark styling';

    const counterpartChar = silentList[0] || (activeChar.name === char1.name ? char2 : char1);

    const frameImagePrompt = buildContinuityFramePrompt({
      clipIndex: idx + 1,
      totalClips: activePlot.clips.length,
      activeSpeaker: activeChar.name,
      counterpart: counterpartChar.name,
      location,
      sceneName: cDef.sceneName,
      actionText: cDef.action,
      continuity,
    });

    const continuityRole: 'master_anchor' | 'reverse_angle_match' | 'culmination_match' =
      idx === 0
        ? 'master_anchor'
        : idx === 1
        ? 'reverse_angle_match'
        : 'culmination_match';

    const continuityReferenceTag =
      idx === 0
        ? '🎯 MASTER ANCHOR KEYFRAME (Generate First: Sets scene & wardrobe DNA)'
        : `🔄 CONTINUITY REVERSE SHOT (Attach Keyframe 1 as Style Ref: ${continuity.midjourneyContinuityRecipe})`;

    return {
      clipIndex: idx + 1,
      totalClips: activePlot.clips.length,
      sceneName: cDef.sceneName,
      locationAnchor: location,
      masterKeyframeLock: `Master frame of ${location}. ${enforceSpatialBlocking(
        activeChar.name,
        silentList.map((s) => s.name)
      )} Wardrobe: ${activeWardrobe}. ${continuity.lightingSetup}.`,
      shotType: cDef.shotType,
      frameImagePrompt,
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
      sceneWardrobe: activeWardrobe,
      continuityRole,
      continuityReferenceTag,
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
    sceneContinuityLock: {
      masterKeyframeIndex: 1,
      timeOfDay: continuity.timeOfDay,
      lightingSetup: continuity.lightingSetup,
      roomGeography: continuity.roomGeography,
      wardrobeLocks: continuity.wardrobeLocks,
      midjourneyContinuityRecipe: continuity.midjourneyContinuityRecipe,
    },
  };
}
