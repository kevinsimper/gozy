export function calculateReplyDelay(messageLength: number): number {
  const baseDelay = 500 + Math.random() * 1000;
  const lengthDelay = messageLength * (20 + Math.random() * 20);
  return Math.min(baseDelay + lengthDelay, 5000);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
