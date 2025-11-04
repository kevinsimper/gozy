import { getPlatformProxy } from "wrangler";

/**
 * Get platform proxy for CLI tools with remote database support
 * @param isRemote - Whether to connect to remote production database
 * @returns Platform proxy instance
 *
 * @example
 * const isRemote = flag("remote", "Use remote production database");
 * const platform = await getPlatform(isRemote);
 * const db = drizzle(platform.env.DB);
 * // ... do work
 * platform.dispose();
 */
export async function getPlatform(isRemote: boolean = false) {
  return await getPlatformProxy({
    configPath: "wrangler.jsonc",
    ...(isRemote && {
      environment: "production",
      experimental: {
        remoteBindings: true,
      },
    }),
  });
}
