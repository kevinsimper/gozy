import { GLOBAL_RATE_LIMIT } from "../../lib/ratelimit/config";

export function DeveloperPage() {
  return (
    <div class="p-6 max-w-4xl">
      <h1 class="text-2xl font-bold mb-6">Developer Configuration</h1>

      <div class="space-y-6">
        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 class="text-lg font-semibold mb-4 text-blue-400">
            Rate Limiting Configuration
          </h2>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-800 rounded p-4">
                <div class="text-gray-400 text-xs uppercase mb-1">
                  Request Limit
                </div>
                <div class="text-2xl font-bold text-white">
                  {GLOBAL_RATE_LIMIT.limit}
                </div>
                <div class="text-gray-500 text-xs mt-1">
                  requests per window
                </div>
              </div>

              <div class="bg-gray-800 rounded p-4">
                <div class="text-gray-400 text-xs uppercase mb-1">
                  Time Window
                </div>
                <div class="text-2xl font-bold text-white">
                  {GLOBAL_RATE_LIMIT.windowMs / 1000 / 60} min
                </div>
                <div class="text-gray-500 text-xs mt-1">rolling window</div>
              </div>

              <div class="bg-gray-800 rounded p-4">
                <div class="text-gray-400 text-xs uppercase mb-1">
                  Alert Threshold
                </div>
                <div class="text-2xl font-bold text-yellow-400">
                  {GLOBAL_RATE_LIMIT.alertThreshold}
                </div>
                <div class="text-gray-500 text-xs mt-1">
                  {(
                    (GLOBAL_RATE_LIMIT.alertThreshold /
                      GLOBAL_RATE_LIMIT.limit) *
                    100
                  ).toFixed(0)}
                  % of limit
                </div>
              </div>

              <div class="bg-gray-800 rounded p-4">
                <div class="text-gray-400 text-xs uppercase mb-1">
                  Alert Cooldown
                </div>
                <div class="text-2xl font-bold text-white">
                  {GLOBAL_RATE_LIMIT.alertCooldownMs / 1000 / 60} min
                </div>
                <div class="text-gray-500 text-xs mt-1">between alerts</div>
              </div>
            </div>

            <div class="bg-gray-800 rounded p-4 mt-4">
              <div class="text-gray-400 text-xs uppercase mb-2">
                Configuration Details
              </div>
              <ul class="space-y-2 text-sm text-gray-300">
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 mr-2 mt-0.5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Global rate limit applies to all incoming requests across
                    all endpoints
                  </span>
                </li>
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 mr-2 mt-0.5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Alerts sent to <strong>ks@gozy.dk</strong> and{" "}
                    <strong>lab@rtt.dk</strong> when threshold reached
                  </span>
                </li>
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 mr-2 mt-0.5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Cooldown prevents alert spam by limiting notifications to
                    once per hour
                  </span>
                </li>
                <li class="flex items-start">
                  <svg
                    class="h-4 w-4 mr-2 mt-0.5 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    View rate limit data in the{" "}
                    <a
                      href="/admin/tables/rate_limits"
                      class="text-blue-400 underline"
                    >
                      rate_limits
                    </a>{" "}
                    and{" "}
                    <a
                      href="/admin/tables/rate_limit_logs"
                      class="text-blue-400 underline"
                    >
                      rate_limit_logs
                    </a>{" "}
                    tables
                  </span>
                </li>
              </ul>
            </div>

            <div class="text-xs text-gray-500 mt-4">
              Edit{" "}
              <code class="bg-gray-800 px-1.5 py-0.5 rounded text-blue-400">
                src/lib/ratelimit/config.ts
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
