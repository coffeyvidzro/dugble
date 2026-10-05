import { LoginForm } from "@/components/auth/login-form";
import { safeRedirectPath } from "@/lib/security/safe-redirect";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Log In",
  description:
    "Access your Dugble dashboard to manage your A2P messaging infrastructure, API keys, and developer logs.",
  path: "/login",
  preset: "auth",
});

type LoginPageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export default async function Page({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  const redirectTo = safeRedirectPath(Array.isArray(next) ? next[0] : next);
  return <LoginForm redirectTo={redirectTo} />;
}
