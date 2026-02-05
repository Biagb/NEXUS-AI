import { SignupForm } from '@/components/auth';

// Prevent static generation - requires runtime for Supabase
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return <SignupForm />;
}