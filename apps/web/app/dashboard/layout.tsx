import { redirect } from 'next/navigation';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { isPocMode, POC_USER_ID } from '@/lib/config/app-mode';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/** Dynamic rendering so POC mock state and Supabase sessions stay fresh. */
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const poc = isPocMode();

  let userId: string;
  let initiallyOnboarded: boolean;

  if (poc) {
    userId = POC_USER_ID;
    initiallyOnboarded = true;
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/signup');
    }

    userId = user.id;

    const { data: profile } = await supabase
      .from('profiles_lp')
      .select('onboarded')
      .eq('id', user.id)
      .maybeSingle();

    initiallyOnboarded = profile?.onboarded ?? false;
  }

  return (
    <div className="flex min-h-screen bg-phantom-void">
      <DashboardSidebar pocMode={poc} />
      <div className="flex flex-1 flex-col">
        <DashboardShell
          pocMode={poc}
          userId={userId}
          initiallyOnboarded={initiallyOnboarded}
        >
          <main className="flex-1 p-6 md:p-10">{children}</main>
        </DashboardShell>
      </div>
    </div>
  );
}
