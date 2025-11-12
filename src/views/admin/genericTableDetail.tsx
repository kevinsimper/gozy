import { formatTableName } from "../../lib/tableRegistry";
import { AppLink, lk } from "../../lib/links";

type GenericTableDetailProps = {
  tableName: string;
  record: Record<string, unknown>;
};

function formatColumnName(column: string): string {
  return column
    .split(/(?=[A-Z])|_/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDetailValue(value: unknown): {
  display: string;
  isLong: boolean;
} {
  if (value === null || value === undefined) {
    return { display: "-", isLong: false };
  }

  if (value instanceof Date) {
    return {
      display: value.toLocaleDateString("da-DK", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      isLong: false,
    };
  }

  if (typeof value === "boolean") {
    return { display: value ? "Yes" : "No", isLong: false };
  }

  if (typeof value === "object") {
    const json = JSON.stringify(value, null, 2);
    return { display: json, isLong: json.length > 100 };
  }

  const str = String(value);
  return { display: str, isLong: str.length > 100 };
}

export function GenericTableDetail({
  tableName,
  record,
}: GenericTableDetailProps) {
  const columns = Object.keys(record);

  return (
    <div class="p-6">
      <div class="mb-6">
        <a
          href={lk(AppLink.AdminTable, { tableName })}
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
          Back to {formatTableName(tableName)}
        </a>
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">
              {formatTableName(tableName)} Detail
            </h1>
            <p class="text-gray-400 text-sm mt-1">
              Record ID: {record.id as string}
            </p>
          </div>
          <a
            href={lk(AppLink.AdminTableEdit, {
              tableName,
              id: String(record.id),
            })}
            class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="h-4 w-4 mr-2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </a>
        </div>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div class="divide-y divide-gray-800">
          {columns.map((column) => {
            const { display, isLong } = formatDetailValue(record[column]);
            return (
              <div key={column} class="p-4 hover:bg-gray-800/30">
                <div class="flex flex-col gap-2">
                  <div class="text-xs font-semibold text-gray-400 uppercase">
                    {formatColumnName(column)}
                  </div>
                  <div
                    class={`text-sm ${
                      isLong
                        ? "font-mono bg-gray-950 p-3 rounded border border-gray-700 overflow-x-auto"
                        : "text-white"
                    }`}
                  >
                    {isLong ? <pre class="text-xs">{display}</pre> : display}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div class="mt-6 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-sm font-semibold text-gray-300">Raw JSON</h2>
        </div>
        <div class="p-4">
          <pre class="text-xs font-mono text-gray-400 overflow-x-auto">
            {JSON.stringify(record, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
