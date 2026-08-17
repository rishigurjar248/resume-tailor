export const PLAN_CONFIG = {
  free: {
    name: "Free Forever",
    price: "$0",
    description: "Unlimited resume building, tailoring, ATS analysis, and AI assistance.",
    limits: {
      base: Number.POSITIVE_INFINITY,
      tailored: Number.POSITIVE_INFINITY,
    },
    features: [
      "Unlimited base resumes",
      "Unlimited tailored resumes",
      "Unlimited AI assistance",
      "ATS-aware analysis",
      "PDF export",
      "Free-provider fallback routing",
    ],
  },
} as const;

export type PlanName = keyof typeof PLAN_CONFIG;
