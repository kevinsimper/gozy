import { z } from "zod";
import { buildZodSchema, FormOptions } from "../formbuilder";

// Login Form Definition

const { schema, formDefinition } = buildZodSchema([
  {
    name: "username",
    label: "Username",
    htmlType: "text",
    required: true,
    placeholder: "Enter your username",
    zodSchema: z.string().min(3, "Username must be at least 3 characters"),
  },
  {
    name: "password",
    label: "Password",
    htmlType: "password",
    required: true,
    placeholder: "Enter your password",
    zodSchema: z.string().min(6, "Password must be at least 6 characters"),
  },
  {
    name: "remember",
    label: "Remember Me",
    htmlType: "checkbox",
    required: false,
    zodSchema: z.boolean().optional(),
  },
] as const);
export const loginFormSchema = schema;
export const loginFormDefinition = formDefinition;
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const loginFormOptions: FormOptions = {
  id: "login-form",
  hxPost: "/login-submit",
  hxTarget: "#login-form-container",
  hxSwap: "innerHTML",
  hxIndicator: "#login-spinner",
};
