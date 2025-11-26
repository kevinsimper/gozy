import { formatTableName } from "../../lib/tableRegistry";
import { AppLink, lk } from "../../lib/links";

type GenericTableProps = {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  totalCount: number;
  search?: string;
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
  search,
}: GenericTableProps) {
  return (
    <div class="p-6">
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-2xl font-bold">{formatTableName(tableName)}</h1>
          <p class="text-gray-400 text-sm mt-1">Total records: {totalCount}</p>
        </div>
        <a
          href={lk(AppLink.AdminTableCreate, { tableName })}
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
        >
          Create
        </a>
      </div>

      <form method="get" class="mb-4 flex gap-2">
        <input
          type="text"
          name="search"
          placeholder="Search all columns..."
          value={search || ""}
          class="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-1 max-w-md"
        />
        <button
          type="submit"
          class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
        >
          Search
        </button>
        {search && (
          <a
            href={lk(AppLink.AdminTable, { tableName })}
            class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
          >
            Clear
          </a>
        )}
      </form>

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
                  const detailLink =
                    tableName === "users"
                      ? lk(AppLink.AdminUserDetail, { id: recordId })
                      : lk(AppLink.AdminTableDetail, {
                          tableName,
                          id: recordId,
                        });
                  return (
                    <tr
                      key={idx}
                      class="border-b border-gray-800 last:border-0"
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          class="p-3 text-gray-300 text-xs max-w-xs truncate"
                        >
                          <a
                            href={detailLink}
                            class="block hover:text-white"
                            title={formatValue(row[column])}
                          >
                            {formatValue(row[column])}
                          </a>
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
