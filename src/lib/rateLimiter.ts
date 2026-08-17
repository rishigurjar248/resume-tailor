/**
 * Application-level rate limiting is intentionally disabled in Free Forever mode.
 * Provider-imposed free-tier limits remain in force and are handled by the AI
 * provider fallback/circuit-breaker layer.
 */
export async function checkRateLimit(_userId: string): Promise<void> {
  return;
}
