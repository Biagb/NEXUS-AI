'use client';

import { OnboardingWizard } from '@/components/onboarding';
import { ToastProvider } from '@/components/ui';

export default function OnboardingPage() {
  return (
    <ToastProvider>
      <OnboardingWizard />
    </ToastProvider>
  );
}
