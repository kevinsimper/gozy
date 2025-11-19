import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, gte, eq, and } from "drizzle-orm";
import { checkinsTable, usersTable, rttLocationsTable } from "../../db/schema";
import { requireRttStaff } from "../../lib/rttAuth";
import { RttCheckinsView } from "../../views/rtt/checkins";
import { Bindings } from "../..";

export const rttCheckinsRoutes = new Hono<{ Bindings: Bindings }>().get(
  "/",
  async (c) => {
    const user = await requireRttStaff(c);
    if (!user || typeof user !== "object" || !("id" in user)) {
      return user;
    }

    const db = drizzle(c.env.DB);

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get location filter from query params
    const selectedLocationId = c.req.query("location")
      ? parseInt(c.req.query("location") as string)
      : undefined;

    // Get all RTT locations for the filter dropdown
    const locations = await db.select().from(rttLocationsTable).all();

    // Build where conditions
    const whereConditions = [gte(checkinsTable.checkedInAt, today)];
    if (selectedLocationId) {
      whereConditions.push(eq(checkinsTable.locationId, selectedLocationId));
    }

    // Build query for today's check-ins
    const checkins = await db
      .select({
        checkinId: checkinsTable.id,
        checkedInAt: checkinsTable.checkedInAt,
        userId: usersTable.id,
        userName: usersTable.name,
        phoneNumber: usersTable.phoneNumber,
        driverType: usersTable.driverType,
        taxiId: usersTable.taxiId,
        locationName: rttLocationsTable.name,
        locationId: rttLocationsTable.id,
      })
      .from(checkinsTable)
      .innerJoin(usersTable, eq(checkinsTable.userId, usersTable.id))
      .innerJoin(
        rttLocationsTable,
        eq(checkinsTable.locationId, rttLocationsTable.id),
      )
      .where(and(...whereConditions))
      .orderBy(desc(checkinsTable.checkedInAt))
      .all();

    return c.render(
      <RttCheckinsView
        checkins={checkins}
        selectedLocationId={selectedLocationId}
        locations={locations}
      />,
      {
        title: "RTT Check-ins - Gozy",
      },
    );
  },
);
