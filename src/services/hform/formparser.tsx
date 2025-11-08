import { Context } from "hono";
import type { FormValues } from "./formbuilder";

export async function parseFormBody(c: Context): Promise<
  | {
      body: {
        [x: string]: string | File;
      };
      values: FormValues;
    }
  | { errorResponse: Response }
> {
  try {
    const body = await c.req.parseBody();

    return { body: body, values: body as FormValues };
  } catch (e) {
    console.error("Failed to parse request body:", e);
    c.status(400);

    return {
      errorResponse: c.text(
        "Invalid request format." + (e as Error).message,
        400,
      ),
    };
  }
}
