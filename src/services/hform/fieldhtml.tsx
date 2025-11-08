import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import { CombinedFieldDefinition } from "./formbuilder";
import { FC, JSXNode } from "hono/jsx";

export const generateFieldHtmlFC: FC<{
  field: CombinedFieldDefinition;
  value: string | undefined;
  error: string | undefined;
  isRequired: boolean;
  dynamicSelectOptions?: Partial<
    Record<string, readonly { readonly value: string; readonly text: string }[]>
  >;
}> = ({ field, value, error, isRequired, dynamicSelectOptions = {} }) => {
  const fieldId = field.name;
  const baseAttrs = `id="${fieldId}" name="${field.name}" ${error ? 'aria-invalid="true"' : ""}`;
  const placeholderAttr = field.placeholder
    ? `placeholder="${field.placeholder}"`
    : "";
  const requiredAttr = isRequired ? "required" : "";
  const commonAttrs = `${baseAttrs} ${placeholderAttr} ${requiredAttr}`;
  const currentValue = value ?? "";

  // Parse common attributes for JSX (handle quoted values properly)
  const parsedCommonAttrs: Record<string, string | boolean> = {};

  // Handle key="value" and standalone boolean attributes
  const attrRegex = /(\w+)(?:=("([^"]*)"|(\S+)))?/g;
  let match;
  while ((match = attrRegex.exec(commonAttrs)) !== null) {
    const [, key, , quotedValue, unquotedValue] = match;
    if (quotedValue !== undefined) {
      parsedCommonAttrs[key] = quotedValue;
    } else if (unquotedValue !== undefined) {
      parsedCommonAttrs[key] = unquotedValue;
    } else {
      // Boolean attribute like "required"
      parsedCommonAttrs[key] = true;
    }
  }

  let jsxElement;

  switch (field.htmlType) {
    case "textarea": {
      jsxElement = (
        <textarea
          {...parsedCommonAttrs}
          rows={field.rows}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          style={{
            "field-sizing": "content",
          }}
        >
          {currentValue}
        </textarea>
      );
      break;
    }
    case "select": {
      // Determine which options to use based on field type
      const selectOptions =
        "asyncOptions" in field && field.asyncOptions
          ? dynamicSelectOptions[field.name] || []
          : "options" in field
            ? field.options
            : [];

      jsxElement = (
        <select
          id={fieldId}
          name={field.name}
          aria-invalid={error ? "true" : undefined}
          required={isRequired ? true : undefined}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {selectOptions?.map((opt) => (
            <option
              value={opt.value}
              selected={opt.value === currentValue ? true : undefined}
              disabled={opt.value === "" && isRequired ? true : undefined}
            >
              {opt.text}
            </option>
          ))}
        </select>
      );
      break;
    }
    case "checkbox": {
      const isChecked = value !== undefined && value !== "false";
      jsxElement = (
        <label className="flex items-center space-x-2">
          <input
            id={fieldId}
            name={field.name}
            aria-invalid={error ? "true" : undefined}
            type="checkbox"
            value="true"
            {...(isChecked ? { checked: true } : {})}
            required={isRequired ? true : undefined}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span>{field.label}</span>
        </label>
      );
      break;
    }
    case "file": {
      jsxElement = (
        <input
          {...parsedCommonAttrs}
          type="file"
          hx-preserve
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
      break;
    }
    default: {
      jsxElement = (
        <input
          {...parsedCommonAttrs}
          type={field.htmlType}
          value={currentValue}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      );
      break;
    }
  }

  return jsxElement;
};

export function generateFieldHtml(
  field: CombinedFieldDefinition,
  value: string | undefined,
  error: string | undefined,
  isRequired: boolean,
  dynamicSelectOptions: Partial<
    Record<string, readonly { readonly value: string; readonly text: string }[]>
  >,
) {
  const jsxElement = generateFieldHtmlFC({
    field,
    value,
    error,
    isRequired,
    dynamicSelectOptions,
  });
  if (!jsxElement) {
    return "";
  }
  return html`${raw(jsxElement.toString())}` as HtmlEscapedString;
}
