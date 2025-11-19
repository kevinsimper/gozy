import { AppLink, lk } from "../../lib/links";

type CheckinData = {
  checkinId: number;
  checkedInAt: Date;
  userId: number;
  userName: string;
  phoneNumber: string;
  driverType: string | null;
  taxiIds: string[];
  locationName: string;
  locationId: number;
};

type CheckinsViewProps = {
  checkins: CheckinData[];
  selectedLocationId?: number;
  locations: { id: number; name: string }[];
};

export function RttCheckinsView({
  checkins,
  selectedLocationId,
  locations,
}: CheckinsViewProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold mb-2 text-gray-900">Check-ins Today</h1>
        <p class="text-gray-600">
          Drivers who have checked in at RTT locations today
        </p>
      </div>

      <div id="message-container"></div>

      {/* Location Filter */}
      <div class="mb-6">
        <form method="get" action={lk(AppLink.RttCheckins)}>
          <label for="location" class="block text-sm text-gray-700 mb-2">
            Filter by location
          </label>
          <select
            name="location"
            id="location"
            class="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option
                value={location.id}
                selected={selectedLocationId === location.id}
              >
                {location.name}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Check-ins Table */}
      <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            {checkins.length} Check-in{checkins.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-200 bg-gray-50">
              <tr>
                <th class="text-left p-3 text-gray-700 font-medium">Time</th>
                <th class="text-left p-3 text-gray-700 font-medium">Name</th>
                <th class="text-left p-3 text-gray-700 font-medium">
                  Phone Number
                </th>
                <th class="text-left p-3 text-gray-700 font-medium">
                  Driver Type
                </th>
                <th class="text-left p-3 text-gray-700 font-medium">
                  Taxi IDs
                </th>
                <th class="text-left p-3 text-gray-700 font-medium">
                  Location
                </th>
                <th class="text-left p-3 text-gray-700 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {checkins.length === 0 ? (
                <tr>
                  <td colSpan={7} class="text-center p-8 text-gray-500">
                    No check-ins today
                  </td>
                </tr>
              ) : (
                checkins.map((checkin) => (
                  <tr
                    key={checkin.checkinId}
                    class="border-b border-gray-200 last:border-0 hover:bg-gray-50"
                  >
                    <td class="p-3 text-gray-700">
                      {new Date(checkin.checkedInAt).toLocaleTimeString(
                        "da-DK",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                    <td class="p-3 text-gray-900 font-medium">
                      {checkin.userName}
                    </td>
                    <td class="p-3 text-gray-600">{checkin.phoneNumber}</td>
                    <td class="p-3 text-gray-600">
                      {checkin.driverType === "vehicle_owner"
                        ? "Vehicle Owner"
                        : checkin.driverType === "driver"
                          ? "Driver"
                          : "-"}
                    </td>
                    <td class="p-3 text-gray-600">
                      {checkin.taxiIds.length > 0 ? (
                        <div class="flex flex-wrap gap-1">
                          {checkin.taxiIds.map((taxiId, idx) => (
                            <span
                              key={idx}
                              class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {taxiId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td class="p-3 text-gray-600">{checkin.locationName}</td>
                    <td class="p-3">
                      <div class="flex gap-2">
                        <a
                          href={lk(AppLink.RttUserDetail, {
                            id: checkin.userId.toString(),
                          })}
                          class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition no-underline"
                        >
                          View Details
                        </a>
                        <button
                          class="send-message-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition"
                          data-user-id={checkin.userId}
                          data-user-name={checkin.userName}
                        >
                          Send Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      <div
        id="messageModal"
        class="hidden fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white border border-gray-200 rounded-lg shadow-xl p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-900">Send Message</h2>
            <button
              id="modal-close-btn"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form
            id="messageForm"
            method="post"
            action={lk(AppLink.RttCheckinsSendMessage)}
          >
            <input type="hidden" name="userId" id="modalUserId" />

            <div class="mb-4">
              <label class="block text-sm text-gray-700 mb-2">
                Sending to:{" "}
                <span
                  id="modalDriverName"
                  class="text-gray-900 font-medium"
                ></span>
              </label>
            </div>

            <div class="mb-4">
              <label for="template" class="block text-sm text-gray-700 mb-2">
                Quick Template
              </label>
              <select
                id="template"
                class="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a template --</option>
                <option value="ready">Your vehicle is ready</option>
                <option value="wait">Please wait in reception</option>
                <option value="10min">Your service will take 10 minutes</option>
                <option value="30min">Your service will take 30 minutes</option>
                <option value="1hour">Your service will take 1 hour</option>
                <option value="custom">Custom message</option>
              </select>
            </div>

            <div class="mb-4">
              <label for="message" class="block text-sm text-gray-700 mb-2">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                rows={4}
                class="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
              >
                Send
              </button>
              <button
                type="button"
                id="modal-cancel-btn"
                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* JavaScript for Modal and Templates */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
        document.addEventListener('DOMContentLoaded', function() {
          const templates = {
            ready: 'Din bil er klar til afhentning.',
            wait: 'Vent venligst i receptionen.',
            '10min': 'Din service tager ca. 10 minutter.',
            '30min': 'Din service tager ca. 30 minutter.',
            '1hour': 'Din service tager ca. 1 time.',
          };

          // Handle success/error messages
          const params = new URLSearchParams(window.location.search);
          const success = params.get('success');
          const error = params.get('error');
          const messageContainer = document.getElementById('message-container');

          if (success) {
            const alert = document.createElement('div');
            alert.className = 'mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between';
            alert.innerHTML = '<div class="flex items-center"><svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>' + success + '</span></div><button class="close-alert text-green-600 hover:text-green-800"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>';
            messageContainer.appendChild(alert);
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (error) {
            const alert = document.createElement('div');
            alert.className = 'mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between';
            alert.innerHTML = '<div class="flex items-center"><svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>' + error + '</span></div><button class="close-alert text-red-600 hover:text-red-800"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>';
            messageContainer.appendChild(alert);
            window.history.replaceState({}, document.title, window.location.pathname);
          }

          // Close alert buttons
          messageContainer.addEventListener('click', function(e) {
            if (e.target.closest('.close-alert')) {
              e.target.closest('.close-alert').parentElement.remove();
            }
          });

          // Location select auto-submit
          const locationSelect = document.getElementById('location');
          if (locationSelect) {
            locationSelect.addEventListener('change', function() {
              this.form.submit();
            });
          }

          // Modal elements
          const modal = document.getElementById('messageModal');
          const modalForm = document.getElementById('messageForm');
          const modalUserId = document.getElementById('modalUserId');
          const modalDriverName = document.getElementById('modalDriverName');
          const templateSelect = document.getElementById('template');
          const messageField = document.getElementById('message');
          const modalCloseBtn = document.getElementById('modal-close-btn');
          const modalCancelBtn = document.getElementById('modal-cancel-btn');

          // Open modal handler
          document.querySelectorAll('.send-message-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
              const userId = this.getAttribute('data-user-id');
              const userName = this.getAttribute('data-user-name');
              modalUserId.value = userId;
              modalDriverName.textContent = userName;
              modal.classList.remove('hidden');
              templateSelect.value = '';
              messageField.value = '';
            });
          });

          // Close modal function
          function closeModal() {
            modal.classList.add('hidden');
            modalForm.reset();
          }

          // Close modal handlers
          modalCloseBtn.addEventListener('click', closeModal);
          modalCancelBtn.addEventListener('click', closeModal);

          // Close on escape key
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
              closeModal();
            }
          });

          // Close on outside click
          modal.addEventListener('click', function(e) {
            if (e.target === modal) {
              closeModal();
            }
          });

          // Template change handler
          templateSelect.addEventListener('change', function() {
            const template = this.value;
            if (template && templates[template]) {
              messageField.value = templates[template];
            } else if (template === 'custom') {
              messageField.value = '';
              messageField.focus();
            }
          });
        });
      `,
        }}
      ></script>
    </div>
  );
}
