import { neon } from '@neondatabase/serverless';

function getDbUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return url;
}

export async function initCreatorOpsDb() {
  const sql = neon(getDbUrl());

  // 1. GmailAccount table
  await sql`
    CREATE TABLE IF NOT EXISTS "GmailAccount" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "subscription" TEXT NOT NULL DEFAULT 'Free',
      "renewalDate" TIMESTAMP(3),
      "browserProfile" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 2. Persona table
  await sql`
    CREATE TABLE IF NOT EXISTS "Persona" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT UNIQUE NOT NULL,
      "displayName" TEXT,
      "assignedDay" INTEGER,
      "niche" TEXT,
      "language" TEXT DEFAULT 'English',
      "targetAudience" TEXT,
      "visualStyle" TEXT,
      "framePrompt" TEXT,
      "masterVideoPrompt" TEXT,
      "weeklyReelsTarget" INTEGER DEFAULT 3,
      "weeklyFeedTarget" INTEGER DEFAULT 4,
      "dailyStoriesTarget" INTEGER DEFAULT 5,
      "gmailAccountId" TEXT,
      "youtubeHandle" TEXT,
      "youtubeUrl" TEXT,
      "instaHandle" TEXT,
      "instaUrl" TEXT,
      "tiktokHandle" TEXT,
      "tiktokUrl" TEXT,
      "facebookHandle" TEXT,
      "facebookUrl" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. DailyUpload table
  await sql`
    CREATE TABLE IF NOT EXISTS "DailyUpload" (
      "id" TEXT PRIMARY KEY,
      "date" TEXT NOT NULL,
      "personaId" TEXT NOT NULL REFERENCES "Persona"("id") ON DELETE CASCADE,
      "videoTitle" TEXT,
      "notes" TEXT,
      "youtubeDone" BOOLEAN NOT NULL DEFAULT false,
      "instaDone" BOOLEAN NOT NULL DEFAULT false,
      "tiktokDone" BOOLEAN NOT NULL DEFAULT false,
      "facebookDone" BOOLEAN NOT NULL DEFAULT false,
      "youtubeUrl" TEXT,
      "instaUrl" TEXT,
      "tiktokUrl" TEXT,
      "facebookUrl" TEXT,
      "allCompleted" BOOLEAN NOT NULL DEFAULT false,
      "feedPostsCount" INTEGER NOT NULL DEFAULT 0,
      "storiesCount" INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DailyUpload_date_personaId_key" UNIQUE ("date", "personaId")
    );
  `;

  // 4. DailyContentPlan table
  await sql`
    CREATE TABLE IF NOT EXISTS "DailyContentPlan" (
      "id" TEXT PRIMARY KEY,
      "date" TEXT NOT NULL,
      "personaId" TEXT NOT NULL REFERENCES "Persona"("id") ON DELETE CASCADE,
      "trendingTopic" TEXT,
      "trendingAudio" TEXT,
      "hook" TEXT,
      "reelScript" TEXT,
      "imagePostType" TEXT,
      "imagePrompt" TEXT,
      "carouselSlides" TEXT,
      "storiesPlan" TEXT,
      "ytTitle" TEXT,
      "ytDescription" TEXT,
      "ytTags" TEXT,
      "tiktokCaption" TEXT,
      "tiktokHashtags" TEXT,
      "instaCaption" TEXT,
      "instaHashtags" TEXT,
      "facebookCaption" TEXT,
      "facebookHashtags" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DailyContentPlan_date_personaId_key" UNIQUE ("date", "personaId")
    );
  `;

  // 5. SystemSettings table
  await sql`
    CREATE TABLE IF NOT EXISTS "SystemSettings" (
      "id" TEXT PRIMARY KEY DEFAULT 'default',
      "provider" TEXT NOT NULL DEFAULT 'greenapi',
      "whatsappPhone" TEXT,
      "callmebotApiKey" TEXT,
      "greenApiIdInstance" TEXT,
      "greenApiApiToken" TEXT,
      "geminiApiKey" TEXT,
      "cronSecret" TEXT DEFAULT 'creatorops_super_secret_cron_token_2025',
      "startHourPKT" INTEGER NOT NULL DEFAULT 14,
      "endHourPKT" INTEGER NOT NULL DEFAULT 23,
      "appUrl" TEXT
    );
  `;

  // 6. Ensure default system settings row exists
  await sql`
    INSERT INTO "SystemSettings" ("id", "provider", "cronSecret", "startHourPKT", "endHourPKT")
    VALUES ('default', 'greenapi', 'creatorops_super_secret_cron_token_2025', 14, 23)
    ON CONFLICT ("id") DO NOTHING;
  `;

  // 7. Seed the 4 Master Personas if not existing
  await seedDefaultPersonas(sql);
}

async function seedDefaultPersonas(sql: any) {
  // Persona 1: Elena (Monday)
  await sql`
    INSERT INTO "Persona" (
      "id", "name", "displayName", "assignedDay", "niche", "language", "targetAudience", 
      "visualStyle", "framePrompt", "masterVideoPrompt", "weeklyReelsTarget", "weeklyFeedTarget", "dailyStoriesTarget"
    ) VALUES (
      'persona-elena-uk-eu',
      'elena.uk.eu',
      'Elena (UK/EU Influencer)',
      1,
      'Modern Relationships, Mindset & Daily Vlog',
      'English',
      'UK/Europe 18-35 females',
      'Warm cinematic lighting, 85mm portrait bokeh, natural skin texture with locked cheek beauty mole',
      '24yo woman with brunette hair, green eyes, natural subtle makeup, distinct signature cheek beauty mole on cheekbone. Styling: gold layered necklace, off-shoulder dark knit top. Warm, relatable, authentic real skin texture with visible pores.',
      '4-clip podcast reel setup. Shure SM7B microphone in foreground, soft ambient room glow, slow push-in camera motion, single speaker dialogue.',
      3, 4, 5
    ) ON CONFLICT ("name") DO NOTHING;
  `;

  // Persona 2: AI Mushaira (Tuesday & Saturday)
  await sql`
    INSERT INTO "Persona" (
      "id", "name", "displayName", "assignedDay", "niche", "language", "targetAudience", 
      "visualStyle", "framePrompt", "masterVideoPrompt", "weeklyReelsTarget", "weeklyFeedTarget", "dailyStoriesTarget"
    ) VALUES (
      'persona-mushaira-urdu',
      'mushaira.animals.urdu',
      'AI Mushaira (Mehfil-e-Sukhan)',
      2,
      'Traditional Urdu Shayari & Satirical Animal Mushaira',
      'Urdu',
      'South Asian youth, Pakistan, India, Global Urdu lovers',
      'Cinematic 3D animated Mehfil-e-Sukhan, anthropomorphic animals in traditional velvet sherwanis, pagris, vintage mic, Persian carpets, wooden pillars, warm golden lamps',
      'Anthropomorphic goat poet (Bakra) wearing royal maroon velvet sherwani with embroidered collar and traditional pagri, standing at a vintage brass microphone on an ornate wooden stage. Persian carpets, warm glowing chandeliers in background, seated anthropomorphic animal audience in blurred background.',
      '6-clip continuous 60s Google Flow Veo production. Dynamic opening with Lion host Babbar Sher funny title intro, poet delivering 2-line sher with emotional/satirical cadence, enthusiastic audience wah-wah reactions, camera pans across Persian stage.',
      2, 4, 5
    ) ON CONFLICT ("name") DO NOTHING;
  `;

  // Persona 3: Pet Comedy (Wednesday)
  await sql`
    INSERT INTO "Persona" (
      "id", "name", "displayName", "assignedDay", "niche", "language", "targetAudience", 
      "visualStyle", "framePrompt", "masterVideoPrompt", "weeklyReelsTarget", "weeklyFeedTarget", "dailyStoriesTarget"
    ) VALUES (
      'persona-pet-comedy',
      'petcomedy.joe.nova',
      'Pet Comedy (Joe & Nova Sitcom)',
      3,
      'Pet Comedy Sitcom & Millennial Pet Parenting',
      'English / Hinglish',
      'Pet lovers, comedy reel viewers, 18-40 global',
      'Cozy modern apartment living room, cinematic depth of field, rack focus between cat and dog, realistic animal expressions',
      'Grey British Shorthair cat Joe sitting smugly on the armrest of a navy velvet sofa with silver round JOE collar tag, looking condescendingly at a fluffy cream Corgi Nova on the rug.',
      '3-clip comedic dialogue, deadpan sarcastic cat one-liners, hyper naive dog reaction, single speaker isolation.',
      2, 3, 5
    ) ON CONFLICT ("name") DO NOTHING;
  `;

  // Persona 4: Drama Season (Thursday)
  await sql`
    INSERT INTO "Persona" (
      "id", "name", "displayName", "assignedDay", "niche", "language", "targetAudience", 
      "visualStyle", "framePrompt", "masterVideoPrompt", "weeklyReelsTarget", "weeklyFeedTarget", "dailyStoriesTarget"
    ) VALUES (
      'persona-drama-season',
      'drama.season.episodes',
      'Drama Season (Episodic Series)',
      4,
      'Episodic Mystery Drama & Continuous Cinematic Storylines',
      'Urdu / English',
      'Series bingers, drama and mystery reel lovers',
      'High contrast noir cinematic lighting, moody shadows, continuous character continuity, tense cliffhanger framing',
      'Cinematic dramatic scene, tense character standoff, continuous narrative aesthetic, anamorphic lens flare.',
      'Continuous multi-episode narrative pacing, suspenseful camera track, dialogue isolation, cliffhanger pause at 9.5s.',
      2, 3, 5
    ) ON CONFLICT ("name") DO NOTHING;
  `;
}
