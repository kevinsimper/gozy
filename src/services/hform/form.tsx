import { HtmlEscapedString } from "hono/utils/html";
import z, { ZodObject, ZodSafeParseError } from "zod";
import {
  createFormHtml,
  GenerateFieldHtmlFn,
  RenderFormFn,
} from "./createform";
import {
  CombinedFieldDefinition,
  FormErrors,
  FormOptions,
  ShapeFromDefinition,
} from "./formbuilder";
import { handleValidation, handleValidationErrors } from "./formerrors";

// Hono Form Builder
// Helper function to wrap formbuilder and createform
export function HForm<TDefinitions extends readonly CombinedFieldDefinition[]>(
  definitions: TDefinitions,
  options: FormOptions,
) {
  return {
    /**
     * Renders the HTML form as a string.
     * @param values - The values to pre-fill in the form fields.
     * @param errors - Validation error messages to display for each field.
     * @param dynamicSelectOptions - Dynamic options for select fields, if any.
     * @param customGenerateFieldHtml - Optional custom function to generate field HTML.
     * @param customRender - Optional custom function to render the whole form.
     * @returns Promise resolving to HTML-escaped string markup of the form.
     */
    render<
      TSchema extends ZodObject<ShapeFromDefinition<TDefinitions>> = ZodObject<
        ShapeFromDefinition<TDefinitions>
      >,
      TFieldNames extends Extract<
        TDefinitions[number],
        { htmlType: "select" }
      >["name"] = Extract<TDefinitions[number], { htmlType: "select" }>["name"],
    >(
      values?: Partial<z.output<TSchema>>,
      errors: FormErrors = {},
      dynamicSelectOptions: Partial<
        Record<
          TFieldNames,
          readonly { readonly value: string; readonly text: string }[]
        >
      > = {},
      customGenerateFieldHtml?: GenerateFieldHtmlFn,
      customRender?: RenderFormFn,
    ): Promise<HtmlEscapedString> {
      return createFormHtml(
        definitions,
        options,
        values,
        errors,
        dynamicSelectOptions,
        customGenerateFieldHtml,
        customRender,
      );
    },
    handleValidation<
      TDef extends readonly CombinedFieldDefinition[],
      TSchema extends ZodObject<ShapeFromDefinition<TDef>> = ZodObject<
        ShapeFromDefinition<TDef>
      >,
    >(parseResult: ZodSafeParseError<z.infer<TSchema>>) {
      return handleValidation(parseResult, definitions);
    },
  };
}
