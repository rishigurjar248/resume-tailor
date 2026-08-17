export const FREE_PLAN_RESUME_LIMITS = {
  base: Number.POSITIVE_INFINITY,
  tailored: Number.POSITIVE_INFINITY,
} as const;

export type ResumeLimitType = keyof typeof FREE_PLAN_RESUME_LIMITS;

export function getResumeLimitExceededMessage(_type: ResumeLimitType): string {
  return "Resume creation is unlimited in Free Forever mode.";
}
