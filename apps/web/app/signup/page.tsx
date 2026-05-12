import { Suspense } from 'react';

import { SignupForm } from './signup-form';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-phantom-void" />}>
      <SignupForm />
    </Suspense>
  );
}
