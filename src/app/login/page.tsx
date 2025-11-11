// Updated Login Page with Corporate Design
import { CorporateLoginForm } from '@/components/ui/corporate-login-form';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirect = searchParams?.redirect || '/genel';
  return <CorporateLoginForm showCorporateBranding={true} redirectTo={redirect} />;
}
