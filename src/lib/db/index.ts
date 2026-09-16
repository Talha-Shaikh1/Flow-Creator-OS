import { neon } from '@neondatabase/serverless';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is missing.');
  }
  return url;
}

export function getDb() {
  const sql = neon(getDatabaseUrl());
  return sql;
}

export async function initDb() {
  const sql = getDb();
  
  // 1. Characters table with user isolation
  await sql`
    CREATE TABLE IF NOT EXISTS saved_characters (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'guest_anonymous',
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      description TEXT NOT NULL,
      dna_prompt TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE saved_characters ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'guest_anonymous';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_chars_user ON saved_characters (user_id);`;

  // 2. Batches table with user isolation
  await sql`
    CREATE TABLE IF NOT EXISTS saved_batches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'guest_anonymous',
      spec JSONB NOT NULL,
      batch JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE saved_batches ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'guest_anonymous';`;
  await sql`CREATE INDEX IF NOT EXISTS idx_batches_user ON saved_batches (user_id, updated_at DESC);`;

  // 3. Workflows table with user isolation
  await sql`
    CREATE TABLE IF NOT EXISTS saved_workflows (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'guest_anonymous',
      name TEXT NOT NULL,
      niche_type TEXT NOT NULL,
      workflow JSONB NOT NULL,
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`ALTER TABLE saved_workflows ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT 'guest_anonymous';`;

  // 4. Content Calendar & Adoption Tracker table
  await sql`
    CREATE TABLE IF NOT EXISTS content_calendar_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'guest_anonymous',
      batch_id TEXT NOT NULL,
      day_number INT NOT NULL,
      scheduled_date DATE NOT NULL,
      variation_id TEXT NOT NULL,
      variation_title TEXT NOT NULL,
      format TEXT NOT NULL,
      is_adopted BOOLEAN DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'draft',
      clips_summary JSONB,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_calendar_user_date ON content_calendar_events (user_id, scheduled_date ASC);`;

  // 5. System Users & Roles table
  await sql`
    CREATE TABLE IF NOT EXISTS system_users (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      image_url TEXT,
      role TEXT NOT NULL DEFAULT 'creator',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users (role);`;
}

export async function resetAndCleanDb() {
  const sql = getDb();
  
  // Drop legacy/test tables
  await sql`DROP TABLE IF EXISTS system_users CASCADE;`;
  await sql`DROP TABLE IF EXISTS content_calendar_events CASCADE;`;
  await sql`DROP TABLE IF EXISTS saved_characters CASCADE;`;
  await sql`DROP TABLE IF EXISTS saved_batches CASCADE;`;
  await sql`DROP TABLE IF EXISTS saved_workflows CASCADE;`;
  await sql`DROP TABLE IF EXISTS story_specs CASCADE;`;
  await sql`DROP TABLE IF EXISTS clips CASCADE;`;
  await sql`DROP TABLE IF EXISTS series_continuity CASCADE;`;

  // Re-initialize clean isolated tables
  await initDb();
}
