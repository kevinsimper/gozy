import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { count, gte, desc } from "drizzle-orm";
import { usersTable } from "../../db/schema";
import { requireAdmin } from "../../lib/adminAuth";
import { AdminDashboard } from "../../views/admin/dashboard";
import { Bindings } from "../..";

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/",
  async (c) => {
    const user = await requireAdmin(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get total users count
    const totalUsersResult = await db
      .select({ count: count() })
      .from(usersTable)
      .get();
    const totalUsers = totalUsersResult?.count || 0;

    // Get users from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const usersLast7DaysResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, sevenDaysAgo))
      .get();
    const usersLast7Days = usersLast7DaysResult?.count || 0;

    // Get users from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const usersLast30DaysResult = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, thirtyDaysAgo))
      .get();
    const usersLast30Days = usersLast30DaysResult?.count || 0;

    // Get recent users (last 10)
    const recentUsers = await db
      .select()
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(10)
      .all();

    const stats = {
      totalUsers,
      usersLast7Days,
      usersLast30Days,
      recentUsers,
    };

    return c.render(<AdminDashboard stats={stats} />, {
      title: "Admin Dashboard - Gozy",
    });
  },
);
