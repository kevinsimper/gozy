import { z } from "zod";
import { buildZodSchema, FormOptions } from "../formbuilder";

// File Upload Form Definition

const { schema, formDefinition } = buildZodSchema([
  {
    name: "myimage",
    label: "Upload Image",
    htmlType: "file",
    required: true,
    placeholder: "Upload an image",
    zodSchema: z.instanceof(File),
  },
  // image description
  {
    name: "description",
    label: "Description",
    htmlType: "textarea",
    required: true,
    placeholder: "Enter a description",
    zodSchema: z.string().min(10).max(100),
  },
] as const);

export const fileUploadFormSchema = schema;
export const fileUploadFormDefinition = formDefinition;
export type FileUploadFormValues = z.infer<typeof fileUploadFormSchema>;

export const fileUploadFormOptions: FormOptions = {
  id: "form-upload-form-container",
  hxPost: "/file-upload-submit",
  hxTarget: "#form-upload-form-container",
  hxSwap: "innerHTML",
  hxIndicator: "#spinner",
  enctype: "multipart/form-data",
};
