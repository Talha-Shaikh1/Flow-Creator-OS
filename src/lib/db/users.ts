import { getDb } from './index';

export type UserRole = 'super_admin' | 'creator';

export interface SystemUser {
  id: string;
  email: string | null;
  name: string | null;
  image_url: string | null;
  role: UserRole;
  created_at: string;
  last_active_at: string;
}

export interface SystemUserWithStats extends SystemUser {
  total_batches: number;
  total_calendar_events: number;
  total_adopted: number;
}

export interface SystemMetrics {
  total_users: number;
  total_super_admins: number;
  total_batches: number;
  total_calendar_events: number;
  total_adopted_events: number;
  adoption_rate: number;
  db_status: 'healthy' | 'degraded';
}

/**
 * Synchronizes user login with Neon DB.
 * If no super_admin exists in the system, the FIRST user who logs in
 * is automatically promoted to super_admin.
 */
export async function syncUserAndGetRole(params: {
  userId: string;
  email?: string | null;
  name?: string | null;
  imageUrl?: string | null;
}): Promise<SystemUser> {
  const sql = getDb();
  const { userId, email = null, name = null, imageUrl = null } = params;

  // 1. Check if user already exists
  const existing = await sql`
    SELECT * FROM system_users WHERE id = ${userId} LIMIT 1;
  `;

  if (existing.length > 0) {
    const user = existing[0] as unknown as SystemUser;
    // Update last_active_at and refresh name/email if provided
    await sql`
      UPDATE system_users
      SET 
        email = COALESCE(${email}, email),
        name = COALESCE(${name}, name),
        image_url = COALESCE(${imageUrl}, image_url),
        last_active_at = NOW()
      WHERE id = ${userId};
    `;
    return {
      ...user,
      email: email || user.email,
      name: name || user.name,
      image_url: imageUrl || user.image_url,
    };
  }

  // 2. User is new: Check if any super_admin already exists in the system
  const adminCountResult = await sql`
    SELECT COUNT(*)::int as count FROM system_users WHERE role = 'super_admin';
  `;
  const adminCount = adminCountResult[0]?.count || 0;

  // If 0 super_admins exist, FIRST USER AUTOMATICALLY BECOMES SUPER ADMIN!
  const assignedRole: UserRole = adminCount === 0 ? 'super_admin' : 'creator';

  const inserted = await sql`
    INSERT INTO system_users (
      id, email, name, image_url, role, created_at, last_active_at
    ) VALUES (
      ${userId}, ${email}, ${name}, ${imageUrl}, ${assignedRole}, NOW(), NOW()
    )
    RETURNING *;
  `;

  return inserted[0] as unknown as SystemUser;
}

/**
 * Checks if a specific userId has the super_admin role.
 */
export async function isUserSuperAdmin(userId: string): Promise<boolean> {
  if (!userId || userId.startsWith('guest_') || userId === 'guest_anonymous') {
    return false;
  }
  const sql = getDb();
  const res = await sql`
    SELECT role FROM system_users WHERE id = ${userId} LIMIT 1;
  `;
  return res.length > 0 && res[0].role === 'super_admin';
}

/**
 * Retrieves all registered users along with their production stats.
 */
export async function getAllSystemUsers(): Promise<SystemUserWithStats[]> {
  const sql = getDb();
  const rows = await sql`
    SELECT 
      u.id,
      u.email,
      u.name,
      u.image_url,
      u.role,
      u.created_at,
      u.last_active_at,
      COUNT(DISTINCT b.id)::int as total_batches,
      COUNT(DISTINCT c.id)::int as total_calendar_events,
      COUNT(DISTINCT CASE WHEN c.is_adopted = TRUE THEN c.id END)::int as total_adopted
    FROM system_users u
    LEFT JOIN saved_batches b ON b.user_id = u.id
    LEFT JOIN content_calendar_events c ON c.user_id = u.id
    GROUP BY u.id
    ORDER BY 
      CASE WHEN u.role = 'super_admin' THEN 1 ELSE 2 END,
      u.created_at ASC;
  `;
  return rows as unknown as SystemUserWithStats[];
}

/**
 * Updates a user's role (promote/demote).
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
  const sql = getDb();
  const res = await sql`
    UPDATE system_users
    SET role = ${newRole}
    WHERE id = ${userId}
    RETURNING id;
  `;
  return res.length > 0;
}

/**
 * Computes high-level system metrics for the Admin Command Center.
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const sql = getDb();

  const userStats = await sql`
    SELECT 
      COUNT(*)::int as total_users,
      COUNT(CASE WHEN role = 'super_admin' THEN 1 END)::int as total_super_admins
    FROM system_users;
  `;

  const batchStats = await sql`
    SELECT COUNT(*)::int as total_batches FROM saved_batches;
  `;

  const calendarStats = await sql`
    SELECT 
      COUNT(*)::int as total_events,
      COUNT(CASE WHEN is_adopted = TRUE THEN 1 END)::int as total_adopted
    FROM content_calendar_events;
  `;

  const totalUsers = userStats[0]?.total_users || 0;
  const totalSuperAdmins = userStats[0]?.total_super_admins || 0;
  const totalBatches = batchStats[0]?.total_batches || 0;
  const totalEvents = calendarStats[0]?.total_events || 0;
  const totalAdopted = calendarStats[0]?.total_adopted || 0;
  const adoptionRate = totalEvents > 0 ? Math.round((totalAdopted / totalEvents) * 100) : 0;

  return {
    total_users: totalUsers,
    total_super_admins: totalSuperAdmins,
    total_batches: totalBatches,
    total_calendar_events: totalEvents,
    total_adopted_events: totalAdopted,
    adoption_rate: adoptionRate,
    db_status: 'healthy',
  };
}

/**
 * Fetches recent batches across all users for the Global Batch Inspector.
 */
export async function getGlobalSystemBatches(limit: number = 30) {
  const sql = getDb();
  const rows = await sql`
    SELECT 
      b.id,
      b.user_id,
      b.spec,
      b.created_at,
      b.updated_at,
      u.email as user_email,
      u.name as user_name,
      u.role as user_role
    FROM saved_batches b
    LEFT JOIN system_users u ON u.id = b.user_id
    ORDER BY b.updated_at DESC
    LIMIT ${limit};
  `;
  return rows;
}
