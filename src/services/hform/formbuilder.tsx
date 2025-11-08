import { z, ZodTypeAny, ZodObject, ZodRawShape } from "zod";

// Base properties common to all field types
type BaseField = {
  readonly name: string;
  readonly label: string;
  readonly zodSchema: ZodTypeAny;
  readonly required?: boolean;
  readonly placeholder?: string;
};

// Definition for fields that are NOT 'select' and thus do not have 'options'
type NonSelectFieldDefinition = BaseField & {
  readonly htmlType:
    | "text"
    | "email"
    | "password"
    | "number"
    | "checkbox"
    | "file"
    | "date";
  readonly options?: never; // Ensure options is not present
};

type TextareaFieldDefinition = BaseField & {
  readonly htmlType: "textarea";
  readonly rows?: number;
};

// Definition for 'select' fields which can have static or dynamic options
type SelectFieldDefinition =
  | (BaseField & {
      readonly htmlType: "select";
      readonly options: readonly {
        readonly value: string;
        readonly text: string;
      }[];
    })
  | (BaseField & {
      readonly htmlType: "select";
      readonly asyncOptions: true;
    });

// CombinedFieldDefinition is now a discriminated union
export type CombinedFieldDefinition =
  | NonSelectFieldDefinition
  | TextareaFieldDefinition
  | SelectFieldDefinition;

export interface FormValues {
  [key: string]: string | File;
}

export interface FormErrors {
  [key: string]: string | undefined;
  _general?: string;
}

export type HtmxSwap =
  | "innerHTML"
  | "outerHTML"
  | "beforeend"
  | "afterbegin"
  | "beforebegin"
  | "afterend"
  | "delete"
  | "none";

export type FormOptions = FormOptionsHtmx | FormOptionsNoHtmx;

export interface FormOptionsHtmx {
  id: string;
  action?: string;
  method?: "GET" | "POST";
  hxPost: string;
  hxTarget: string;
  hxSwap: HtmxSwap;
  hxIndicator: string;
  enctype?: string;
}

export interface FormOptionsNoHtmx {
  id: string;
  method: "GET" | "POST";
  action: string;
  enctype?: string;
}

export type ShapeFromDefinition<T extends readonly CombinedFieldDefinition[]> =
  {
    [K in T[number]["name"]]: Extract<T[number], { name: K }>["zodSchema"];
  };

export function buildZodSchema<
  TDefinitions extends readonly CombinedFieldDefinition[],
>(
  definitions: TDefinitions,
): {
  schema: ZodObject<ShapeFromDefinition<TDefinitions>>;
  formDefinition: TDefinitions;
} {
  const shape = {} as Record<string, ZodTypeAny>;
  definitions.forEach((field) => {
    shape[field.name] = field.zodSchema;
  });
  const schema = z.object(shape) as ZodObject<
    ShapeFromDefinition<TDefinitions>
  >;
  return { schema, formDefinition: definitions };
}
