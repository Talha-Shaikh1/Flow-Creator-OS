export interface ScheduledTask {
  id: string;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ... 5 = Friday, 6 = Saturday
  dayName: string;
  personaSlug: string;
  personaName: string;
  taskType: 'reel' | 'carousel' | 'stories';
  title: string;
  description: string;
  formatDetails: string;
  targetChannels: ('youtube' | 'instagram' | 'tiktok' | 'facebook')[];
  recommendedPktTimes: string[];
  monetizationGoal: string;
}

export const MASTER_WEEKLY_SCHEDULE: Record<number, ScheduledTask[]> = {
  // 0: SUNDAY
  0: [
    {
      id: 'sun-drama-ep2',
      dayIndex: 0,
      dayName: 'Sunday',
      personaSlug: 'drama.season.episodes',
      personaName: 'Drama Season',
      taskType: 'reel',
      title: 'Drama Episode 2 (Continuation & Plot Twist)',
      description: 'Sunday Binge Release: Resolve Thursday cliffhanger and introduce an unexpected confrontation.',
      formatDetails: '60s Episodic Reel • 4-Clip continuous storyline • High contrast noir lighting',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['7:00 PM PKT', '9:30 PM PKT'],
      monetizationGoal: 'Maximize Sunday watch time and binge playlist saves on YouTube & Facebook.',
    },
    {
      id: 'sun-pets-reel2',
      dayIndex: 0,
      dayName: 'Sunday',
      personaSlug: 'petcomedy.joe.nova',
      personaName: 'Pet Comedy',
      taskType: 'reel',
      title: 'Joe & Nova Sunday Chill Sitcom',
      description: 'Weekend laziness debate between Joe the Cat refusing to move and Nova eager for a walk.',
      formatDetails: '45s Sitcom Reel • Rack focus camera • Single speaker sarcastic dialogue',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['2:00 PM PKT', '6:00 PM PKT'],
      monetizationGoal: 'Drive TikTok & Reels shares among pet owners during relaxed Sunday hours.',
    },
  ],

  // 1: MONDAY
  1: [
    {
      id: 'mon-elena-reel1',
      dayIndex: 1,
      dayName: 'Monday',
      personaSlug: 'elena.uk.eu',
      personaName: 'Elena (UK/EU)',
      taskType: 'reel',
      title: 'Elena Modern Relationships & Mindset Reel',
      description: 'Monday Motivation & relatable relationship dynamic topic to spark high comment debate.',
      formatDetails: '4-Clip Podcast Reel • Shure SM7B mic • Bokeh warm lighting • Locked cheek mole',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['6:30 PM PKT', '9:00 PM PKT'],
      monetizationGoal: 'Trigger Facebook & Instagram comment velocity with relatable female viewer topic.',
    },
  ],

  // 2: TUESDAY
  2: [
    {
      id: 'tue-mushaira-reel1',
      dayIndex: 2,
      dayName: 'Tuesday',
      personaSlug: 'mushaira.animals.urdu',
      personaName: 'AI Mushaira',
      taskType: 'reel',
      title: 'AI Urdu Mushaira (Babbar Sher Host + Bakra Comedy)',
      description: 'Traditional Mehfil-e-Sukhan: Lion Babbar Sher hilarious intro for Janab Bakra Be-Qaraar-ud-Din, followed by satirical 2-line sher.',
      formatDetails: '60s 6x10s Continuous Google Flow Veo • 3D Anthropomorphic Animals • Velvet sherwanis',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['5:00 PM PKT', '8:30 PM PKT'],
      monetizationGoal: 'Viral YouTube Shorts & TikTok FYP reach across South Asian Urdu/Hindi diaspora.',
    },
  ],

  // 3: WEDNESDAY
  3: [
    {
      id: 'wed-pets-reel1',
      dayIndex: 3,
      dayName: 'Wednesday',
      personaSlug: 'petcomedy.joe.nova',
      personaName: 'Pet Comedy',
      taskType: 'reel',
      title: 'Joe & Nova Sitcom Reel (Mid-Week Crisis)',
      description: 'Sarcastic grey cat Joe mocking human working from home, naive Corgi Nova desperately seeking attention.',
      formatDetails: '3-Clip Comedic Dialogue • Deadpan one-liners • Living room setting',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['6:00 PM PKT', '9:00 PM PKT'],
      monetizationGoal: 'High shareability and Facebook Reels recommendation boost.',
    },
  ],

  // 4: THURSDAY
  4: [
    {
      id: 'thu-drama-reel1',
      dayIndex: 4,
      dayName: 'Thursday',
      personaSlug: 'drama.season.episodes',
      personaName: 'Drama Season',
      taskType: 'reel',
      title: 'Drama Episode 1 (Tense Standoff & Cliffhanger)',
      description: 'Pre-weekend suspense episode: High tension revelation that abruptly cuts off at 9.5s on Clip 4.',
      formatDetails: '60s Episodic Reel • Anamorphic lens flare • Dramatic dialogue isolation',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['7:00 PM PKT', '10:00 PM PKT'],
      monetizationGoal: 'Trigger repeat views and comment debates guessing what happens next.',
    },
  ],

  // 5: FRIDAY (TODAY - BIG CAROUSEL & VISUAL PHOTO DUMP DAY)
  5: [
    {
      id: 'fri-mushaira-carousel',
      dayIndex: 5,
      dayName: 'Friday',
      personaSlug: 'mushaira.animals.urdu',
      personaName: 'AI Mushaira',
      taskType: 'carousel',
      title: 'AI Mushaira Friday Special (4-5 Slides Urdu Ash\'aar & Animal Art)',
      description: 'Friday Jumma / Mehfil Special Carousel: Ornate typography with deep emotional & satirical Urdu couplets, paired with royal sherwani animal art.',
      formatDetails: '5-Slide 4:5 Portrait Carousel • Ornate Urdu Nastaliq calligraphy aesthetic • 3D Animal Portraits',
      targetChannels: ['instagram', 'facebook', 'youtube', 'tiktok'],
      recommendedPktTimes: ['2:30 PM PKT (Post-Jumma Peak)', '8:00 PM PKT'],
      monetizationGoal: 'Huge Instagram Save & Share rate, high Facebook community photo album engagement.',
    },
    {
      id: 'fri-elena-carousel',
      dayIndex: 5,
      dayName: 'Friday',
      personaSlug: 'elena.uk.eu',
      personaName: 'Elena (UK/EU)',
      taskType: 'carousel',
      title: 'Elena Aesthetic Photo Dump (4-5 Slides Weekend Prep)',
      description: 'Aesthetic European photo dump carousel: Chic dark knit outfit, London coffee corner, golden hour glow, authentic film grain, signature cheek mole.',
      formatDetails: '5-Slide 4:5 Portrait Carousel • Micro-story captions on each slide • Ultra-realistic skin texture',
      targetChannels: ['instagram', 'facebook', 'tiktok'],
      recommendedPktTimes: ['6:00 PM PKT', '9:00 PM PKT'],
      monetizationGoal: 'Establish genuine influencer authority, aesthetic saves, and brand sponsorship appeal.',
    },
  ],

  // 6: SATURDAY (PRIME TIME REELS RELEASE)
  6: [
    {
      id: 'sat-mushaira-reel2',
      dayIndex: 6,
      dayName: 'Saturday',
      personaSlug: 'mushaira.animals.urdu',
      personaName: 'AI Mushaira',
      taskType: 'reel',
      title: 'Grand Mehfil-e-Sukhan Reel (Punchline Sher & Roaring Daad)',
      description: 'Saturday Prime-Time Mushaira: Janab Kachwa Sust-ul-Mulk delivers surprising fiery philosophical sher. Audience animals roar in applause.',
      formatDetails: '60s 6x10s Continuous Google Flow Veo • Warm chandeliers • Persian rugs',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['6:00 PM PKT', '9:30 PM PKT'],
      monetizationGoal: 'Capture weekend prime-time YouTube Shorts feed and Facebook Reels algorithmic push.',
    },
    {
      id: 'sat-elena-reel2',
      dayIndex: 6,
      dayName: 'Saturday',
      personaSlug: 'elena.uk.eu',
      personaName: 'Elena (UK/EU)',
      taskType: 'reel',
      title: 'Elena Weekend Outing & Dating Realities Reel',
      description: 'Unfiltered conversation on dating red flags vs green flags while getting ready for Saturday dinner.',
      formatDetails: '4-Clip Dynamic Reel • Natural handheld feel • Crisp audio delivery',
      targetChannels: ['youtube', 'instagram', 'tiktok', 'facebook'],
      recommendedPktTimes: ['5:30 PM PKT', '8:30 PM PKT'],
      monetizationGoal: 'Drive high female audience engagement and retention past 40 seconds.',
    },
  ],
};

export function getScheduledTasksForDay(dayIndex: number): ScheduledTask[] {
  return MASTER_WEEKLY_SCHEDULE[dayIndex] || [];
}

export function getWeeklyTargetBreakdown() {
  return {
    'elena.uk.eu': { weeklyReelsTarget: 3, weeklyCarouselTarget: 1, dailyStoriesTarget: 5 },
    'mushaira.animals.urdu': { weeklyReelsTarget: 2, weeklyCarouselTarget: 1, dailyStoriesTarget: 5 },
    'petcomedy.joe.nova': { weeklyReelsTarget: 2, weeklyCarouselTarget: 1, dailyStoriesTarget: 5 },
    'drama.season.episodes': { weeklyReelsTarget: 2, weeklyCarouselTarget: 1, dailyStoriesTarget: 5 },
  };
}
