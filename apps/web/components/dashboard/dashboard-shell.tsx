'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { OnboardingWizard } from '@/components/dashboard/onboarding-wizard';

type Props = {
  pocMode?: boolean;
  userId: string;
  initiallyOnboarded: boolean;
  children: React.ReactNode;
};

export function DashboardShell({
  pocMode = false,
  userId,
  initiallyOnboarded,
  children,
}: Props) {
  const router = useRouter();
  const [onboarded, setOnboarded] = useState(initiallyOnboarded);

  return (
    <>
      {!onboarded ? (
        <OnboardingWizard
          open
          pocMode={pocMode}
          userId={userId}
          onCompleted={() => {
            setOnboarded(true);
            router.refresh();
          }}
        />
      ) : null}
      {children}
    </>
  );
}
