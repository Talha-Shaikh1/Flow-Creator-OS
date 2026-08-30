import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || '';

export const sql = databaseUrl && !databaseUrl.includes('ep-sample') ? neon(databaseUrl) : null;

let tablesInitialized = false;

// Initialize Database Schema if tables don't exist
export async function ensureDbInit() {
  if (!sql) return;
  if (tablesInitialized) return;

  try {
    // 1. Creator Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS creator_profiles (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        archetype VARCHAR(100) NOT NULL,
        niche VARCHAR(255) NOT NULL,
        object_name TEXT,
        object_metaphor TEXT,
        character_dna TEXT NOT NULL,
        aspect_ratio VARCHAR(20) NOT NULL,
        visual_style TEXT NOT NULL,
        tone VARCHAR(255) NOT NULL,
        target_audience TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `;

    // 2. Weekly Plans Table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_plans (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        profile_id VARCHAR(255) NOT NULL,
        profile_name VARCHAR(255) NOT NULL,
        archetype VARCHAR(100) NOT NULL,
        niche VARCHAR(255) NOT NULL,
        days_json JSONB NOT NULL,
        created_at BIGINT NOT NULL
      );
    `;

    // 3. Anti-Repetition Vault Items Table
    await sql`
      CREATE TABLE IF NOT EXISTS vault_items (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        topic TEXT NOT NULL,
        angle VARCHAR(255) NOT NULL,
        emotional_trigger VARCHAR(255),
        archetype VARCHAR(100) NOT NULL,
        used_in_date VARCHAR(50) NOT NULL
      );
    `;

    // 4. Performance Feedback Logs Table
    await sql`
      CREATE TABLE IF NOT EXISTS performance_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        plan_id VARCHAR(255) NOT NULL,
        video_title TEXT NOT NULL,
        day_number INT NOT NULL,
        emotional_trigger VARCHAR(255),
        result VARCHAR(50) NOT NULL,
        views_count VARCHAR(100),
        retention_rate VARCHAR(100),
        user_notes TEXT,
        key_learnings TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `;

    tablesInitialized = true;
    console.log('Neon Database Schema successfully verified & initialized.');
  } catch (error) {
    console.warn('Neon DB init warning (will retry on next request):', error);
  }
}
