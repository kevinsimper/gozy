import { html, raw } from "hono/html";
import type { HtmlEscapedString } from "hono/utils/html";
import { ZodObject, z } from "zod";
import type {
  CombinedFieldDefinition,
  FormOptions,
  FormOptionsHtmx,
  FormOptionsNoHtmx,
  FormErrors,
  ShapeFromDefinition,
} from "./formbuilder";
import { generateFieldHtml } from "./fieldhtml";

// Type for the field HTML generator function, inferred from the original implementation
export type GenerateFieldHtmlFn = typeof generateFieldHtml;

// Type for the custom render function, inferred from the original implementation
export type RenderFormFn = typeof render;

/**
 * Creates an HTML form with strong type safety based on Zod schema inference
 * @param definitions - Array of field definitions
 * @param options - Form configuration options
 * @param values - Initial values for the form fields with proper type inference
 * @param errors - Error messages for form fields
 * @param dynamicSelectOptions - Options for select fields that can be dynamically loaded
 * @param customGenerateFieldHtml - Optional custom function to generate HTML for individual form fields
 * @param customRender - Optional custom function to render the entire form with complete control over layout
 * @returns Promise resolving to HTML form markup
 */
export async function createFormHtml<
  TDefinitions extends readonly CombinedFieldDefinition[],
  TSchema extends ZodObject<ShapeFromDefinition<TDefinitions>> = ZodObject<
    ShapeFromDefinition<TDefinitions>
  >,
  TFieldNames extends Extract<
    TDefinitions[number],
    { htmlType: "select" }
  >["name"] = Extract<TDefinitions[number], { htmlType: "select" }>["name"],
>(
  definitions: TDefinitions,
  options: FormOptions,
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
  // Type guard to check if options is FormOptionsHtmx
  const isHtmxForm = (opts: FormOptions): opts is FormOptionsHtmx => {
    return (
      "hxPost" in opts &&
      "hxTarget" in opts &&
      "hxSwap" in opts &&
      "hxIndicator" in opts
    );
  };

  const formAttrs = [
    `id="${options.id}"`,
    isHtmxForm(options)
      ? `hx-post="${options.hxPost}" method="POST"`
      : `action="${(options as FormOptionsNoHtmx).action || ""}" method="${(options as FormOptionsNoHtmx).method || "POST"}"`,
    isHtmxForm(options) ? `hx-target="${options.hxTarget}"` : "",
    isHtmxForm(options) ? `hx-swap="${options.hxSwap}"` : "",
    isHtmxForm(options) ? `hx-indicator="${options.hxIndicator}"` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const indicatorId = isHtmxForm(options)
    ? options.hxIndicator.substring(1)
    : undefined;
  const indicatorCSS = indicatorId
    ? await html` <style>
        #${indicatorId} {
          opacity: 0;
          transition: opacity 200ms ease-in;
          margin-left: 10px;
          vertical-align: middle;
        }
        form.htmx-request #${indicatorId} {
          opacity: 1;
        }
        form.htmx-request button[type="submit"] {
          cursor: wait;
          opacity: 0.7;
        }
      </style>`
    : "";

  // Use the custom render function if provided, otherwise use the default
  const renderFn = customRender || render;

  const result = await renderFn(
    indicatorCSS,
    formAttrs,
    indicatorId,
    definitions,
    options,
    values,
    errors,
    dynamicSelectOptions,
    customGenerateFieldHtml,
  );

  return result;
}

/**
 * Renders a form using JSX and converts it to HTML string
 */
async function render<
  TDefinitions extends readonly CombinedFieldDefinition[],
  TSchema extends ZodObject<ShapeFromDefinition<TDefinitions>> = ZodObject<
    ShapeFromDefinition<TDefinitions>
  >,
  TFieldNames extends Extract<
    TDefinitions[number],
    { htmlType: "select" }
  >["name"] = Extract<TDefinitions[number], { htmlType: "select" }>["name"],
>(
  indicatorCSS: HtmlEscapedString | string,
  formAttrs: string,
  indicatorId: string | undefined,
  definitions: TDefinitions,
  options: FormOptions,
  values?: Partial<z.output<TSchema>>,
  errors: FormErrors = {},
  dynamicSelectOptions: Partial<
    Record<
      TFieldNames,
      readonly { readonly value: string; readonly text: string }[]
    >
  > = {},
  customGenerateFieldHtml?: GenerateFieldHtmlFn,
): Promise<HtmlEscapedString> {
  // Parse form attributes
  const parsedFormAttrs = Object.fromEntries(
    formAttrs
      .split(" ")
      .filter(Boolean)
      .map((attr) => {
        const [key, ...valueParts] = attr.split("=");
        const value = valueParts.join("=").replace(/"/g, "");
        return [key, value];
      }),
  );

  // Create the JSX element
  const jsxElement = (
    <>
      {indicatorCSS}
      <form
        {...parsedFormAttrs}
        className={"space-y-4 " + (options.id || "")}
        encType={options.enctype || "application/x-www-form-urlencoded"}
      >
        {errors._general && (
          <div className="mb-4 rounded bg-red-100 border border-red-300 px-4 py-3 text-red-700 text-sm">
            {errors._general}
          </div>
        )}

        {definitions.map((field) => {
          const fieldError = errors[field.name];
          const fieldValue = values?.[field.name];
          const isRequired = field.required ?? !field.zodSchema.isOptional();

          return (
            <div className="form-field" key={field.name}>
              {field.htmlType !== "checkbox" && (
                <label htmlFor={field.name}>
                  {field.label}
                  {isRequired ? " *" : ""}
                </label>
              )}

              {customGenerateFieldHtml
                ? customGenerateFieldHtml(
                    field,
                    fieldValue,
                    fieldError,
                    isRequired,
                    dynamicSelectOptions,
                  )
                : generateFieldHtml(
                    field,
                    fieldValue,
                    fieldError,
                    isRequired,
                    dynamicSelectOptions,
                  )}

              {fieldError && (
                <p className="mt-1 text-sm text-red-600">{fieldError}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Submit
        </button>

        {indicatorId && (
          <span id={indicatorId} className="htmx-indicator">
            Processing...
          </span>
        )}
      </form>
    </>
  );

  // Convert JSX to HTML string
  return html`${raw(jsxElement.toString())}` as HtmlEscapedString;
}

/**
 * Type for the parameters of the function returned by createFormRenderer.
 */
export type CreateFormRendererParams<
  TSchema extends ZodObject<any>,
  TFieldNames extends string, // Assuming TFieldNames is the type for names of select fields
> = {
  values?: Partial<z.output<TSchema>>;
  errors?: FormErrors;
  dynamicSelectOptions?: Partial<
    Record<
      TFieldNames,
      readonly { readonly value: string; readonly text: string }[]
    >
  >;
  customGenerateFieldHtml?: GenerateFieldHtmlFn;
  customRender?: RenderFormFn;
};

/**
 * Creates a form rendering function with pre-configured definitions and options.
 * This allows for a cleaner way to render forms without repeatedly passing
 * the same definitions and options.
 *
 * @param definitions The form field definitions.
 * @param options The form options.
 * @returns An async function that takes rendering parameters and returns HTML form markup.
 */
export function createFormRenderer<
  TDefinitions extends readonly CombinedFieldDefinition[],
  TSchema extends ZodObject<ShapeFromDefinition<TDefinitions>> = ZodObject<
    ShapeFromDefinition<TDefinitions>
  >,
  TFieldNames extends Extract<
    TDefinitions[number],
    { htmlType: "select" }
  >["name"] = Extract<TDefinitions[number], { htmlType: "select" }>["name"],
>(definitions: TDefinitions, options: FormOptions) {
  /**
   * Renders the HTML form using the pre-configured definitions and options.
   * @param params - Optional parameters for rendering, like values, errors, etc.
   * @returns Promise resolving to HTML form markup.
   */
  return async (
    params: CreateFormRendererParams<TSchema, TFieldNames> = {},
  ): Promise<HtmlEscapedString> => {
    return createFormHtml(
      definitions,
      options,
      params.values,
      params.errors,
      params.dynamicSelectOptions,
      params.customGenerateFieldHtml,
      params.customRender,
    );
  };
}
