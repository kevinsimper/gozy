import { AppLink, lk } from "../../lib/links";
import type { User } from "../../db/schema";
import type { FunctionDeclaration, Schema, Type } from "@google/genai";

type UserSystemPromptProps = {
  user: User;
  systemPrompt: string;
  functions: FunctionDeclaration[];
};

function getTypeLabel(type: Type | undefined): string {
  if (!type) {
    return "unknown";
  }
  switch (type) {
    case "STRING":
      return "string";
    case "NUMBER":
      return "number";
    case "BOOLEAN":
      return "boolean";
    case "ARRAY":
      return "array";
    case "OBJECT":
      return "object";
    default:
      return String(type);
  }
}

function renderParameter(
  name: string,
  schema: Schema,
  required: string[] = [],
) {
  const isRequired = required.includes(name);
  const typeLabel = getTypeLabel(schema.type);

  return (
    <div class="p-3 border-b border-gray-800 last:border-b-0">
      <div class="flex items-start justify-between mb-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-mono text-blue-400">{name}</span>
          <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
            {typeLabel}
          </span>
          {isRequired ? (
            <span class="text-xs px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-800">
              required
            </span>
          ) : (
            <span class="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">
              optional
            </span>
          )}
        </div>
      </div>
      {schema.description && (
        <p class="text-xs text-gray-400 mt-1">{schema.description}</p>
      )}
      {schema.enum && (
        <div class="mt-2">
          <span class="text-xs text-gray-500">Allowed values: </span>
          <span class="text-xs font-mono text-purple-400">
            {schema.enum.join(", ")}
          </span>
        </div>
      )}
      {schema.properties && (
        <div class="mt-2 ml-4 border-l-2 border-gray-700 pl-3">
          <div class="text-xs text-gray-500 mb-2">Nested properties:</div>
          {Object.entries(schema.properties).map(([propName, propSchema]) =>
            renderParameter(propName, propSchema as Schema, schema.required),
          )}
        </div>
      )}
    </div>
  );
}

export function UserSystemPrompt({
  user,
  systemPrompt,
  functions,
}: UserSystemPromptProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <a
          href={lk(AppLink.AdminUserDetail, { id: String(user.id) })}
          class="inline-flex items-center text-blue-500 hover:text-blue-400 text-sm mb-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-4 w-4 mr-1"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          Back to User Detail
        </a>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">System Prompt</h1>
            <p class="text-gray-400 text-sm mt-1">
              User: {user.name} (ID: {user.id})
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: User Context and System Prompt */}
        <div class="space-y-6">
          {/* User Context */}
          <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div class="p-4 border-b border-gray-800">
              <h2 class="text-sm font-semibold text-gray-300">User Context</h2>
            </div>
            <div class="divide-y divide-gray-800">
              <div class="p-4">
                <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Name
                </div>
                <div class="text-sm text-white">{user.name}</div>
              </div>
              <div class="p-4">
                <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Phone Number
                </div>
                <div class="text-sm text-white font-mono">
                  {user.phoneNumber}
                </div>
              </div>
              <div class="p-4">
                <div class="text-xs font-semibold text-gray-400 uppercase mb-1">
                  Driver Type
                </div>
                <div class="text-sm text-white">
                  {user.driverType === "vehicle_owner"
                    ? "Vognmand (Vehicle Owner)"
                    : user.driverType === "driver"
                      ? "Chauffør (Driver)"
                      : "Not set (New user)"}
                </div>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div class="p-4 border-b border-gray-800">
              <h2 class="text-sm font-semibold text-gray-300">
                Generated System Prompt
              </h2>
              <p class="text-xs text-gray-500 mt-1">
                This is the exact prompt sent to the AI for this user's
                conversations
              </p>
            </div>
            <div class="p-4">
              <pre class="text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                {systemPrompt}
              </pre>
            </div>
          </div>
        </div>

        {/* Right Column: Available Functions */}
        <div>
          <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div class="p-4 border-b border-gray-800">
              <h2 class="text-sm font-semibold text-gray-300">
                Available Functions
              </h2>
              <p class="text-xs text-gray-500 mt-1">
                {functions.length} functions available to the AI during
                conversations
              </p>
            </div>
            <div class="divide-y divide-gray-800">
              {functions.map((func) => (
                <details class="group">
                  <summary class="p-4 cursor-pointer hover:bg-gray-800/50 transition-colors list-none">
                    <div class="flex items-center justify-between">
                      <div class="flex-1">
                        <h3 class="text-sm font-mono font-semibold text-green-400 mb-1">
                          {func.name}
                        </h3>
                        <p class="text-xs text-gray-400 line-clamp-2">
                          {func.description}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="h-4 w-4 text-gray-500 transform transition-transform group-open:rotate-180 ml-2 flex-shrink-0"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </summary>
                  <div class="px-4 pb-4 pt-2 bg-gray-950/50">
                    <p class="text-sm text-gray-300 mb-3">{func.description}</p>
                    {func.parameters && func.parameters.properties && (
                      <div>
                        <div class="text-xs font-semibold text-gray-400 uppercase mb-2">
                          Parameters
                        </div>
                        <div class="bg-gray-950 border border-gray-700 rounded overflow-hidden">
                          {Object.entries(func.parameters.properties).map(
                            ([paramName, paramSchema]) =>
                              renderParameter(
                                paramName,
                                paramSchema as Schema,
                                func.parameters?.required || [],
                              ),
                          )}
                        </div>
                      </div>
                    )}
                    {!func.parameters?.properties ||
                      (Object.keys(func.parameters.properties).length === 0 && (
                        <div class="text-xs text-gray-500 italic">
                          No parameters required
                        </div>
                      ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
