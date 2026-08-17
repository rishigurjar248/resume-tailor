import { Analytics } from "@vercel/analytics/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { PostHogPageView } from "@/components/analytics/posthog-pageview";
import { PagePerformance } from "@/components/analytics/page-performance";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import {
  IMPERSONATION_STATE_COOKIE_NAME,
  parseImpersonationStateCookieValue,
} from "@/lib/impersonation";
import {
  getAuthenticatedUser,
} from "@/utils/actions";

const isVercel = process.env.VERCEL === "1";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/");
  }

  const cookieStore = await cookies();
  const impersonationState = parseImpersonationStateCookieValue(
    cookieStore.get(IMPERSONATION_STATE_COOKIE_NAME)?.value,
  );

  const isProPlan = true;
  const subscriptionPlan = "free";
  const subscriptionStatus: string | null = null;

  return (
    <PostHogProvider
      user={{
        id: user.id,
        subscriptionPlan,
        subscriptionStatus,
        isPro: isProPlan,
      }}
    >
      <Suspense fallback={null}>
        <PostHogPageView userId={user.id} />
        <PagePerformance />
      </Suspense>
      {impersonationState && (
        <div className="bg-amber-500 py-2 text-center text-sm text-white">
          Impersonating <span className="font-semibold">{user.email ?? user.id}</span>.{" "}
          <Link href="/stop-impersonation" className="font-medium underline">
            Stop impersonating
          </Link>
        </div>
      )}
      <div className="relative flex h-screen min-h-screen flex-col">
        <AppHeader
          isProPlan={isProPlan}
        />
        <main className="h-full py-14">{children}</main>
        <Footer />
        {isVercel && <Analytics />}
      </div>
    </PostHogProvider>
  );
}
