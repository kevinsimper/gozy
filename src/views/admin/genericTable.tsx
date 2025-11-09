import { formatTableName } from "../../lib/tableRegistry";
import { AppLink, lk } from "../../lib/links";

type GenericTableProps = {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalCount: number;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("da-DK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function GenericTableView({
  tableName,
  columns,
  rows,
  totalCount,
}: GenericTableProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold">{formatTableName(tableName)}</h1>
        <p class="text-gray-400 text-sm mt-1">Total records: {totalCount}</p>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="border-b border-gray-800 bg-gray-900/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    class="text-left p-3 text-gray-400 font-medium text-xs whitespace-nowrap"
                  >
                    {column
                      .split(/(?=[A-Z])|_/)
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    class="text-center p-8 text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => {
                  const recordId = String(row.id);
                  return (
                    <tr
                      key={idx}
                      class="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 cursor-pointer"
                      onclick={`window.location.href='${lk(AppLink.AdminTableDetail, { tableName, id: recordId })}'`}
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          class="p-3 text-gray-300 text-xs max-w-xs truncate"
                          title={formatValue(row[column])}
                        >
                          {formatValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
