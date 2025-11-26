import { getTableColumns } from "drizzle-orm";
import { z } from "zod";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

type HtmlInputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "checkbox"
  | "file"
  | "textarea"
  | "select"
  | "datetime-local";

export type FieldDefinition = {
  name: string;
  label: string;
  htmlType: HtmlInputType;
  required: boolean;
  zodSchema: z.ZodTypeAny;
  placeholder?: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
};

const NON_EDITABLE_FIELDS = [
  "id",
  "publicId",
  "createdAt",
  "updatedAt",
  "loginPin",
  "loginPinExpiry",
  "lastLoginAt",
  "storageKey",
];

function formatFieldLabel(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

export function buildGenericFormFields(table: SQLiteTable): FieldDefinition[] {
  const columns = getTableColumns(table);
  const fields: FieldDefinition[] = [];

  for (const [columnName, column] of Object.entries(columns)) {
    if (NON_EDITABLE_FIELDS.includes(columnName)) {
      continue;
    }

    const config = column as {
      name: string;
      notNull: boolean;
      dataType: string;
      enumValues?: string[];
      columnType: string;
      mode?: string;
    };

    const isRequired = config.notNull;
    const label = formatFieldLabel(columnName);

    let htmlType: HtmlInputType = "text";
    let zodSchema: z.ZodTypeAny = z.string();
    let options: Array<{ value: string; label: string }> | undefined;

    if (config.enumValues && config.enumValues.length > 0) {
      htmlType = "select";
      options = config.enumValues.map((val) => ({
        value: val,
        label: formatFieldLabel(val),
      }));
      zodSchema = z.enum(config.enumValues as [string, ...string[]]);
    } else if (config.dataType === "date") {
      htmlType = "datetime-local";
      if (isRequired) {
        zodSchema = z.coerce.date();
      } else {
        zodSchema = z.preprocess((val) => {
          if (!val || val === "") return undefined;
          return val;
        }, z.coerce.date().optional());
      }
    } else if (config.dataType === "boolean") {
      htmlType = "checkbox";
      zodSchema = z.preprocess(
        (val) => val === "on" || val === true,
        z.boolean(),
      );
    } else if (config.dataType === "number") {
      if (config.columnType.includes("boolean") || config.mode === "boolean") {
        htmlType = "checkbox";
        zodSchema = z.preprocess(
          (val) => val === "on" || val === true,
          z.boolean(),
        );
      } else {
        htmlType = "number";
        if (isRequired) {
          zodSchema = z.coerce.number();
        } else {
          zodSchema = z.preprocess((val) => {
            if (!val || val === "") return undefined;
            return val;
          }, z.coerce.number().optional());
        }
      }
    } else if (config.dataType === "text") {
      htmlType = "text";
      zodSchema = z.string();

      if (columnName.toLowerCase().includes("email")) {
        htmlType = "email";
        zodSchema = z.string().email("Invalid email address");
      } else if (
        columnName.toLowerCase().includes("description") ||
        columnName.toLowerCase().includes("notes") ||
        columnName.toLowerCase().includes("message")
      ) {
        htmlType = "textarea";
      }
    }

    if (!isRequired && config.dataType === "text") {
      zodSchema = zodSchema.optional();
    }

    fields.push({
      name: columnName,
      label,
      htmlType,
      required: isRequired,
      zodSchema,
      options,
    });
  }

  return fields;
}

export function buildGenericZodSchema(
  fields: FieldDefinition[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    schemaShape[field.name] = field.zodSchema;
  }

  return z.object(schemaShape);
}
