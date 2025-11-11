import { drizzle } from "drizzle-orm/d1";
import { rttLocationsTable } from "../db/schema";
import { command, flag } from "../services/simple-cli/cli";
import { getPlatform } from "../services/simple-cli/platform";

const isRemote = flag("remote", "Use remote production database");

if (command("seed-rtt-locations", "Seed RTT locations into database")) {
  (async () => {
    const platform = await getPlatform(isRemote);
    const db = drizzle(platform.env.DB as D1Database);

    const locations = [
      {
        slug: "soborg",
        name: "RTT Søborg",
        address: "Transformervej 4",
        postalCode: "2860",
        city: "Søborg",
        phone: "+45 44 53 55 15",
        email: "salg@rtt.dk",
        openingHoursMonThu: "07.30 - 15.30",
        openingHoursFri: "07.30 - 15.30",
        openingHoursSat: "LUKKET",
        emergencyHours: "15.30 - 16.30",
      },
      {
        slug: "aarhus",
        name: "RTT Århus",
        address: "Mosevej 25",
        postalCode: "8240",
        city: "Risskov",
        phone: "+45 86 24 14 55",
        email: "aarhus@rtt.dk",
        openingHoursMonThu: "08.00 - 16.00",
        openingHoursFri: "08.00 - 15.30",
        openingHoursSat: "LUKKET",
        emergencyHours: null,
      },
      {
        slug: "aalborg",
        name: "RTT Aalborg",
        address: "Håndværkervej 24A",
        postalCode: "9000",
        city: "Aalborg",
        phone: "+45 28 93 91 99",
        email: "aalborg@rtt.dk",
        openingHoursMonThu: "07.30 - 15.30",
        openingHoursFri: "07.30 - 15.00",
        openingHoursSat: "LUKKET",
        emergencyHours: null,
      },
    ];

    for (const location of locations) {
      await db.insert(rttLocationsTable).values(location).run();
    }

    console.log(
      `Seeded ${locations.length} RTT locations in ${isRemote ? "production (remote)" : "staging (local)"} database`,
    );

    platform.dispose();
  })();
}
