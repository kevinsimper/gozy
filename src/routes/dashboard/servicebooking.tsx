import { Hono } from "hono";
import { z } from "zod";
import { getUserFromCookie } from "../../services/auth";
import { AppLink, lk } from "../../lib/links";
import {
  findAllRttLocations,
  findRttLocationBySlug,
} from "../../models/rttlocation";
import {
  createRttBooking,
  countRttBookingsByDateAndHour,
  findActiveRttBookingsByUserId,
} from "../../models/rttbooking";

type Bindings = {
  DB: D1Database;
  COOKIE_SECRET: string;
};

const bookingSchema = z.object({
  date: z.string().min(1, "Vælg venligst en dato"),
  hour: z.coerce.number().min(7).max(16, "Vælg venligst en tid"),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const serviceBookingRoutes = new Hono<{ Bindings: Bindings }>()
  .get("/", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const locations = await findAllRttLocations(c);
    const activeBookings = await findActiveRttBookingsByUserId(c, userId);

    return c.render(
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book tid hos RTT
        </h1>
        <p className="text-gray-600 mb-8">
          Vælg den lokation der passer dig bedst
        </p>

        {activeBookings.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Dine aktive bookinger
            </h2>
            <div className="space-y-4">
              {activeBookings.map((booking) => {
                const location = locations.find(
                  (loc) => loc.id === booking.locationId,
                );
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg p-4 border border-blue-300"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {location?.name || "Ukendt lokation"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(booking.appointmentDate).toLocaleDateString(
                            "da-DK",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}{" "}
                          kl. {booking.appointmentHour}:00
                        </p>
                        {location && (
                          <p className="text-sm text-gray-500 mt-1">
                            {location.address}, {location.postalCode}{" "}
                            {location.city}
                          </p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {booking.status === "pending" && "Afventer"}
                        {booking.status === "confirmed" && "Bekræftet"}
                        {booking.status === "completed" && "Gennemført"}
                        {booking.status === "cancelled" && "Annulleret"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <a
              key={location.id}
              href={`${lk(AppLink.DashboardServiceBookingBook)}?location=${location.slug}`}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-500 no-underline"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {location.name}
                  </h3>
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-start">
                    <svg
                      className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {location.address}, {location.postalCode} {location.city}
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {location.phone}
                  </p>
                  <p className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {location.email}
                  </p>
                </div>

                {location.openingHoursMonThu && (
                  <div className="border-t border-gray-200 pt-4 space-y-1 text-xs text-gray-500">
                    <p className="font-semibold text-gray-700">Åbningstider:</p>
                    <p>Man-Tor: {location.openingHoursMonThu}</p>
                    {location.openingHoursFri && (
                      <p>Fredag: {location.openingHoursFri}</p>
                    )}
                    {location.openingHoursSat && (
                      <p>Lørdag: {location.openingHoursSat}</p>
                    )}
                    {location.emergencyHours && (
                      <p className="text-orange-600">
                        Nødservice: {location.emergencyHours}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                  Vælg denne lokation
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>,
      {
        title: "Book tid hos RTT - GoZy",
      },
    );
  })
  .get("/book", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const locationSlug = c.req.query("location");

    if (!locationSlug) {
      return c.redirect(lk(AppLink.DashboardServiceBooking));
    }

    const location = await findRttLocationBySlug(c, locationSlug);

    if (!location) {
      return c.redirect(lk(AppLink.DashboardServiceBooking));
    }

    const now = new Date();
    const minDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const minDateString = minDate.toISOString().split("T")[0];

    const error = c.req.query("error");
    let errorMessage = "";
    if (error === "too_soon") {
      errorMessage = "Booking skal være mindst 2 timer frem i tiden";
    } else if (error === "full") {
      errorMessage =
        "Dette tidspunkt er desværre fuldt booket. Vælg venligst et andet tidspunkt.";
    } else if (error === "invalid") {
      errorMessage = "Ugyldig booking. Kontroller venligst dine indtastninger.";
    }

    return c.render(
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <a
            href={lk(AppLink.DashboardServiceBooking)}
            className="text-blue-600 hover:text-blue-700 inline-flex items-center mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Tilbage til lokationer
          </a>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book tid hos {location.name}
          </h1>
          <p className="text-gray-600">
            {location.address}, {location.postalCode} {location.city}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg
                className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form method="post" action="/dashboard/service-booking/book">
            <input type="hidden" name="locationSlug" value={location.slug} />

            <div className="mb-4">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vælg dato
              </label>
              <input
                type="date"
                id="date"
                name="date"
                min={minDateString}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Bookinger skal være mindst 2 timer frem i tiden
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="hour"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vælg tidspunkt
              </label>
              <select
                id="hour"
                name="hour"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Vælg time</option>
                <option value="7">07:00 - 08:00</option>
                <option value="8">08:00 - 09:00</option>
                <option value="9">09:00 - 10:00</option>
                <option value="10">10:00 - 11:00</option>
                <option value="11">11:00 - 12:00</option>
                <option value="12">12:00 - 13:00</option>
                <option value="13">13:00 - 14:00</option>
                <option value="14">14:00 - 15:00</option>
                <option value="15">15:00 - 16:00</option>
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Beskrivelse (valgfri)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Hvad skal vi hjælpe med?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <div className="mb-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Noter (valgfri)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="Andre bemærkninger"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Book tid
            </button>
          </form>
        </div>

        {location.openingHoursMonThu && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Åbningstider:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Man-Tor: {location.openingHoursMonThu}</p>
              {location.openingHoursFri && (
                <p>Fredag: {location.openingHoursFri}</p>
              )}
              {location.openingHoursSat && (
                <p>Lørdag: {location.openingHoursSat}</p>
              )}
              {location.emergencyHours && (
                <p className="text-orange-600">
                  Nødservice: {location.emergencyHours}
                </p>
              )}
            </div>
          </div>
        )}
      </div>,
      {
        title: `Book tid hos ${location.name} - GoZy`,
      },
    );
  })
  .post("/book", async (c) => {
    const userId = await getUserFromCookie(c);

    if (!userId) {
      return c.redirect(lk(AppLink.Login));
    }

    const body = await c.req.parseBody();
    const locationSlug =
      typeof body.locationSlug === "string" ? body.locationSlug : "";
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return c.redirect(
        `${lk(AppLink.DashboardServiceBookingBook)}?location=${locationSlug}&error=invalid`,
      );
    }

    const location = await findRttLocationBySlug(c, locationSlug);

    if (!location) {
      return c.redirect(lk(AppLink.DashboardServiceBooking));
    }

    const appointmentDate = new Date(parsed.data.date);
    appointmentDate.setHours(parsed.data.hour, 0, 0, 0);
    const appointmentHour = parsed.data.hour;

    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    if (appointmentDate < minBookingTime) {
      return c.redirect(
        `${lk(AppLink.DashboardServiceBookingBook)}?location=${locationSlug}&error=too_soon`,
      );
    }

    const existingBookings = await countRttBookingsByDateAndHour(
      c,
      location.id,
      appointmentDate,
      appointmentHour,
    );

    if (existingBookings >= 4) {
      return c.redirect(
        `${lk(AppLink.DashboardServiceBookingBook)}?location=${locationSlug}&error=full`,
      );
    }

    await createRttBooking(c, userId, {
      locationId: location.id,
      appointmentDate,
      appointmentHour,
      description: parsed.data.description,
      notes: parsed.data.notes,
    });

    return c.render(
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <svg
            className="w-16 h-16 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tid booket!</h1>
          <p className="text-gray-600 mb-2">
            Din tid hos {location.name} er nu bekræftet
          </p>
          <p className="text-lg font-semibold text-gray-900 mb-6">
            {new Date(appointmentDate).toLocaleDateString("da-DK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            kl. {appointmentHour}:00
          </p>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="font-semibold text-gray-900 mb-2">
              {location.name}
            </h3>
            <p className="text-sm text-gray-700">
              {location.address}
              <br />
              {location.postalCode} {location.city}
              <br />
              {location.phone}
            </p>
          </div>
          <a
            href={lk(AppLink.Dashboard)}
            className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition no-underline"
          >
            Tilbage til dashboard
          </a>
        </div>
      </div>,
      {
        title: "Booking bekræftet - GoZy",
      },
    );
  });
