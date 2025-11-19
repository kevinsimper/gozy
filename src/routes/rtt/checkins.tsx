import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { desc, gte, eq, and, inArray } from "drizzle-orm";
import {
  checkinsTable,
  usersTable,
  rttLocationsTable,
  driverTaxiIdsTable,
} from "../../db/schema";
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

    // Fetch taxi IDs for all users in the check-ins
    const userIds = checkins.map((c) => c.userId);
    const taxiIds =
      userIds.length > 0
        ? await db
            .select({
              userId: driverTaxiIdsTable.userId,
              taxiId: driverTaxiIdsTable.taxiId,
            })
            .from(driverTaxiIdsTable)
            .where(inArray(driverTaxiIdsTable.userId, userIds))
            .all()
        : [];

    // Group taxi IDs by user ID
    const taxiIdsByUser = new Map<number, string[]>();
    for (const item of taxiIds) {
      if (!taxiIdsByUser.has(item.userId)) {
        taxiIdsByUser.set(item.userId, []);
      }
      taxiIdsByUser.get(item.userId)!.push(item.taxiId);
    }

    // Add taxi IDs to check-ins
    const checkinsWithTaxiIds = checkins.map((checkin) => ({
      ...checkin,
      taxiIds: taxiIdsByUser.get(checkin.userId) || [],
    }));

    return c.render(
      <RttCheckinsView
        checkins={checkinsWithTaxiIds}
        selectedLocationId={selectedLocationId}
        locations={locations}
      />,
      {
        title: "RTT Check-ins - Gozy",
      },
    );
  },
);
