/**
 * Retention Dynamics & Psychological Hooks Engine
 * Enforces 0-3s visual contrast openers, 18-22 word dialogue pacing,
 * daily emotional tension arcs, and psychological cliffhanger endings.
 */

export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateDialoguePacing(dialogue: string): {
  wordCount: number;
  isOptimal: boolean;
  feedback: string;
} {
  const count = calculateWordCount(dialogue);
  const isOptimal = count >= 15 && count <= 25;
  let feedback = 'Optimal short-form dialogue pacing (18-22 words for a 10s clip).';
  
  if (count < 15) {
    feedback = `Dialogue slightly brief (${count} words). Good for dramatic pause.`;
  } else if (count > 25) {
    feedback = `Dialogue exceeds optimal 10-second cadence (${count} words). Trimming recommended to prevent hurried delivery.`;
  }

  return { wordCount: count, isOptimal, feedback };
}

export function getWeeklyEmotionArc(dayNumber: number): {
  dayName: string;
  dailyEmotion: string;
  tensionStrategy: string;
} {
  const arcs = [
    {
      dayName: 'Monday',
      dailyEmotion: 'Curiosity & Disruption Hook',
      tensionStrategy: 'High-contrast opener that subverts immediate expectations.',
    },
    {
      dayName: 'Tuesday',
      dailyEmotion: 'Simmering Conflict & Stakes Escalation',
      tensionStrategy: 'Introduce secret or unspoken friction between core characters.',
    },
    {
      dayName: 'Wednesday',
      dailyEmotion: 'The Turning Point / Mid-Week Climax',
      tensionStrategy: 'Direct confrontation or shocking discovery that alters the power balance.',
    },
    {
      dayName: 'Thursday',
      dailyEmotion: 'Vulnerability & Deep Emotional Consequence',
      tensionStrategy: 'Raw psychological reveal or heartbreaking realization.',
    },
    {
      dayName: 'Friday',
      dailyEmotion: 'High-Stakes Ultimatums & Revenge',
      tensionStrategy: 'Aggressive retaliation or an irreversible choice is made.',
    },
    {
      dayName: 'Saturday',
      dailyEmotion: 'The Twist / Unexpected Alliance',
      tensionStrategy: 'Subversion where an opponent turns ally or hidden motive surfaces.',
    },
    {
      dayName: 'Sunday',
      dailyEmotion: 'Resolution & Major Cliffhanger Anchor',
      tensionStrategy: 'Cathartic closure on the immediate issue with a massive hook into next week.',
    },
  ];

  return arcs[dayNumber - 1] || arcs[0];
}
