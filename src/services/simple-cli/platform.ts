import { getPlatformProxy } from "wrangler";

/**
 * Get platform proxy for CLI tools with remote database support
 * @param environment - Environment to connect to: "local", "staging", or "production"
 * @returns Platform proxy instance
 *
 * @example
 * const platform = await getPlatform("staging");
 * const db = drizzle(platform.env.DB);
 * // ... do work
 * platform.dispose();
 */
export async function getPlatform(
  environment: "local" | "staging" | "production" = "local",
) {
  return await getPlatformProxy({
    configPath: "wrangler.jsonc",
    ...(environment !== "local" && {
      environment,
      experimental: {
        remoteBindings: true,
      },
    }),
  });
}
