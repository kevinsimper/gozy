import { Type, FunctionDeclaration, Schema } from "@google/genai";
import { z } from "zod";

const mapJsonTypeToGemini = (type: string): Type => {
  switch (type) {
    case "string":
      return Type.STRING;
    case "number":
    case "integer":
      return Type.NUMBER;
    case "boolean":
      return Type.BOOLEAN;
    case "array":
      return Type.ARRAY;
    default:
      return Type.OBJECT;
  }
};

const convertToGeminiSchema = (jsonSchema: Record<string, unknown>): Schema => {
  const schema: Schema = {
    type: mapJsonTypeToGemini(jsonSchema.type as string),
    description: jsonSchema.description as string | undefined,
  };

  if (jsonSchema.type === "object" && jsonSchema.properties) {
    schema.properties = {};
    for (const [key, prop] of Object.entries(
      jsonSchema.properties as Record<string, unknown>,
    )) {
      schema.properties[key] = convertToGeminiSchema(
        prop as Record<string, unknown>,
      );
    }
    if (jsonSchema.required && Array.isArray(jsonSchema.required)) {
      schema.required = jsonSchema.required;
    }
  }

  if (jsonSchema.type === "array" && jsonSchema.items) {
    schema.items = convertToGeminiSchema(
      jsonSchema.items as Record<string, unknown>,
    );
  }

  return schema;
};

export const zodToGeminiParams = (
  schema: z.ZodTypeAny,
): FunctionDeclaration["parameters"] => {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;

  if (jsonSchema.type === "array" && jsonSchema.items) {
    const items = jsonSchema.items as Record<string, unknown>;
    if (items.type === "object") {
      const properties: Record<string, Schema> = {};

      for (const [key, prop] of Object.entries(
        (items.properties || {}) as Record<string, unknown>,
      )) {
        properties[key] = convertToGeminiSchema(
          prop as Record<string, unknown>,
        );
      }

      return {
        type: Type.OBJECT,
        properties,
        required: items.required ? [...(items.required as string[])] : [],
      };
    }
  }

  const properties: Record<string, Schema> = {};

  for (const [key, prop] of Object.entries(
    (jsonSchema.properties || {}) as Record<string, unknown>,
  )) {
    properties[key] = convertToGeminiSchema(prop as Record<string, unknown>);
  }

  return {
    type: Type.OBJECT,
    properties,
    required: jsonSchema.required ? [...(jsonSchema.required as string[])] : [],
  };
};

export const createGeminiFunctionDeclaration = ({
  name,
  description,
  schema,
}: {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
}): FunctionDeclaration => {
  return {
    name,
    description,
    parameters: zodToGeminiParams(schema),
  };
};
