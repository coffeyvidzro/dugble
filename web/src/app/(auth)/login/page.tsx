import { LoginForm } from "@/components/auth/login-form";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Log In",
  description:
    "Access your Dugble dashboard to manage your A2P messaging infrastructure, API keys, and developer logs.",
  path: "/login",
  preset: "auth",
});

export default function Page() {
  return <LoginForm />;
}
