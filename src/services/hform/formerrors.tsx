import { Context } from "hono";
import { ZodObject, ZodSafeParseError, z } from "zod";
import {
  type CombinedFieldDefinition,
  FormErrors,
  type FormOptions,
  type ShapeFromDefinition,
  buildZodSchema,
} from "./formbuilder";
import {
  createFormHtml,
  GenerateFieldHtmlFn,
  RenderFormFn,
} from "./createform";
import { HtmlEscapedString } from "hono/utils/html";

/**
 * Handles Zod validation errors by generating the appropriate HTML form response.
 * @param parseResult The failed SafeParseResult from Zod
 * @param definition The form definition array (`as const` recommended)
 * @param options The form options (HTMX attributes etc.)
 * @param inputValues The raw input values received (for pre-filling)
 * @returns A Hono Response object containing the re-rendered form with errors.
 */
export async function handleValidationErrors<
  TDef extends readonly CombinedFieldDefinition[],
  TSchema extends ZodObject<ShapeFromDefinition<TDef>> = ZodObject<
    ShapeFromDefinition<TDef>
  >,
  TFieldNames extends Extract<
    TDef[number],
    { htmlType: "select" }
  >["name"] = Extract<TDef[number], { htmlType: "select" }>["name"],
>(
  parseResult: ZodSafeParseError<z.infer<TSchema>>,
  definition: TDef,
  options: FormOptions,
  inputValues?: Partial<z.output<TSchema>>,
  dynamicSelectOptions: Partial<
    Record<
      TFieldNames,
      readonly { readonly value: string; readonly text: string }[]
    >
  > = {},
  customGenerateFieldHtml?: GenerateFieldHtmlFn,
  customRender?: RenderFormFn,
): Promise<HtmlEscapedString> {
  const errors = handleValidation(parseResult, definition);

  const errorFormHtml = await createFormHtml(
    definition,
    options,
    inputValues,
    errors,
    dynamicSelectOptions,
    customGenerateFieldHtml,
    customRender,
  );
  return errorFormHtml;
}

/**
 * Handles Zod validation errors by generating the appropriate HTML form response.
 * @param parseResult The failed SafeParseResult from Zod
 * @param definition The form definition array (`as const` recommended)
 * @returns A Hono Response object containing the re-rendered form with errors.
 */
export function handleValidation<
  TDef extends readonly CombinedFieldDefinition[],
  TSchema extends ZodObject<ShapeFromDefinition<TDef>> = ZodObject<
    ShapeFromDefinition<TDef>
  >,
>(
  parseResult: ZodSafeParseError<z.infer<TSchema>>,
  definition: TDef,
): FormErrors {
  const zodFieldErrors = parseResult.error.flatten().fieldErrors;

  // Infer the expected keys from the definition for type safety
  type FormKeys = TDef[number]["name"];
  const errors: {
    [K in FormKeys]?: string;
  } & { _general?: string } = {
    _general: "Please correct the errors highlighted below.",
  };

  // Map Zod errors to our FormErrors structure
  Object.entries(zodFieldErrors).forEach(([key, fieldErrorMessages]) => {
    // Check if the key is one of the names defined in our form definition
    const isKnownKey = definition.some((field) => field.name === key);

    if (
      isKnownKey &&
      Array.isArray(fieldErrorMessages) &&
      fieldErrorMessages.length > 0
    ) {
      // Extract the first error message and ensure it's a string
      const errorMessage = String(fieldErrorMessages[0]);

      // Safely cast key to FormKeys since we've verified it exists in our form definition
      const formKey = key as FormKeys;

      // Now assign the string error message
      // @ts-ignore
      errors[formKey] = errorMessage;
    }
  });

  return errors;
}
