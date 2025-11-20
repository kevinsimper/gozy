import { Context } from "hono";
import { Bindings } from "../../index";
import { insertEventLog } from "../../models/eventLog";
import { Resend } from "../../services/resend";

export type RateLimitAlertParams = {
  currentCount: number;
  limit: number;
  threshold: number;
  identifier: string;
  endpoint: string;
};

export async function sendRateLimitAlert(
  c: Context<{ Bindings: Bindings }>,
  params: RateLimitAlertParams,
): Promise<void> {
  const { currentCount, limit, threshold, identifier, endpoint } = params;
  const percentage = ((currentCount / limit) * 100).toFixed(1);

  const message = `Rate limit at ${percentage}% (${currentCount}/${limit}) for ${identifier} on ${endpoint}. Alert threshold: ${threshold}. Consider increasing the limit.`;

  await insertEventLog(c, {
    event: "rate_limit_threshold_exceeded",
    log: {
      identifier,
      endpoint,
      currentCount,
      limit,
      threshold,
      percentage: `${percentage}%`,
      message,
    },
  });

  // Email alerts disabled for now
  // const resend = new Resend(c.env.RESEND_API_KEY);
  // const emailResult = await resend.send({
  //   from: "Gozy Alerts <alerts@gozy.dk>",
  //   to: ["ks@gozy.dk", "lab@rtt.dk"],
  //   subject: `Rate Limit Alert: ${percentage}% usage on ${endpoint}`,
  //   html: `
  //     <h1>Rate Limit Alert</h1>
  //     <p><strong>Endpoint:</strong> ${endpoint}</p>
  //     <p><strong>Identifier:</strong> ${identifier}</p>
  //     <p><strong>Current Count:</strong> ${currentCount}</p>
  //     <p><strong>Limit:</strong> ${limit}</p>
  //     <p><strong>Usage:</strong> ${percentage}%</p>
  //     <p><strong>Alert Threshold:</strong> ${threshold}</p>
  //     <hr>
  //     <p>${message}</p>
  //   `,
  //   text: message,
  // });
  //
  // if (emailResult.error) {
  //   console.error(
  //     "[RATE LIMIT ALERT] Failed to send email:",
  //     emailResult.error,
  //   );
  // }

  console.warn(
    `[RATE LIMIT ALERT] ${percentage}% usage (${currentCount}/${limit}) - ${identifier} - ${endpoint}`,
  );
}
