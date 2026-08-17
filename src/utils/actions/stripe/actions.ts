'use server';
import { createClient } from '@/utils/supabase/server';

/** Compatibility shim: ResumeLM is Free Forever and has no billing integration. */
export async function getSubscriptionPlan(_includeDetails = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return { plan: 'free' as const, id: user.id };
}

export async function deleteCustomerAndData(..._args: unknown[]) {
  return;
}
