import { formatTableName } from "../../lib/tableRegistry";
import { AppLink, lk } from "../../lib/links";
import type { FieldDefinition } from "../../lib/genericFormBuilder";

type GenericTableEditProps = {
  tableName: string;
  recordId: string;
  fields: FieldDefinition[];
  values?: Record<string, unknown>;
  errors?: Record<string, string>;
  success?: boolean;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 16);
  }

  if (typeof value === "boolean") {
    return value ? "on" : "";
  }

  return String(value);
}

function renderField(field: FieldDefinition, value: unknown, error?: string) {
  const fieldValue = formatValue(value);
  const hasError = !!error;

  const inputClasses = `w-full bg-gray-950 border ${
    hasError ? "border-red-500" : "border-gray-700"
  } rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 ${
    hasError ? "focus:ring-red-500" : "focus:ring-blue-500"
  } focus:border-transparent`;

  const labelClasses =
    "block text-xs font-semibold text-gray-400 uppercase mb-2";

  if (field.htmlType === "checkbox") {
    return (
      <div class="mb-4">
        <label class="flex items-center">
          <input
            type="checkbox"
            name={field.name}
            checked={value === true}
            class="mr-2 h-4 w-4 bg-gray-950 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span class={labelClasses}>{field.label}</span>
        </label>
        {hasError && <p class="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (field.htmlType === "select" && field.options) {
    return (
      <div class="mb-4">
        <label for={field.name} class={labelClasses}>
          {field.label}
          {field.required && <span class="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          class={inputClasses}
        >
          {!field.required && <option value="">-- Select --</option>}
          {field.options.map((option) => (
            <option value={option.value} selected={fieldValue === option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && <p class="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (field.htmlType === "textarea") {
    return (
      <div class="mb-4">
        <label for={field.name} class={labelClasses}>
          {field.label}
          {field.required && <span class="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={field.name}
          name={field.name}
          required={field.required}
          rows={4}
          class={inputClasses}
          placeholder={field.placeholder}
        >
          {fieldValue}
        </textarea>
        {hasError && <p class="text-red-400 text-xs mt-1">{error}</p>}
        {field.description && (
          <p class="text-gray-500 text-xs mt-1">{field.description}</p>
        )}
      </div>
    );
  }

  return (
    <div class="mb-4">
      <label for={field.name} class={labelClasses}>
        {field.label}
        {field.required && <span class="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={field.htmlType}
        id={field.name}
        name={field.name}
        value={fieldValue}
        required={field.required}
        class={inputClasses}
        placeholder={field.placeholder}
      />
      {hasError && <p class="text-red-400 text-xs mt-1">{error}</p>}
      {field.description && (
        <p class="text-gray-500 text-xs mt-1">{field.description}</p>
      )}
    </div>
  );
}

export function GenericTableEdit({
  tableName,
  recordId,
  fields,
  values = {},
  errors = {},
  success = false,
}: GenericTableEditProps) {
  return (
    <div class="p-6">
      <div class="mb-6">
        <a
          href={lk(AppLink.AdminTableDetail, { tableName, id: recordId })}
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
          Back to Detail
        </a>
        <h1 class="text-2xl font-bold">Edit {formatTableName(tableName)}</h1>
        <p class="text-gray-400 text-sm mt-1">Record ID: {recordId}</p>
      </div>

      {success && (
        <div class="mb-6 p-4 bg-green-900/30 border border-green-700 rounded text-sm text-green-400">
          Record updated successfully!
        </div>
      )}

      {errors.general && (
        <div class="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-sm text-red-400">
          {errors.general}
        </div>
      )}

      <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div class="p-4 border-b border-gray-800">
          <h2 class="text-sm font-semibold text-gray-300">Edit Information</h2>
        </div>
        <div class="p-4">
          <form
            method="post"
            action={lk(AppLink.AdminTableUpdate, { tableName, id: recordId })}
          >
            {fields.map((field) =>
              renderField(field, values[field.name], errors[field.name]),
            )}

            <div class="flex gap-3 mt-6">
              <button
                type="submit"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
              >
                Save Changes
              </button>
              <a
                href={lk(AppLink.AdminTableDetail, {
                  tableName,
                  id: recordId,
                })}
                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
