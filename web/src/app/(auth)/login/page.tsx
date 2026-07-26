import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Access your Dugble dashboard to manage your A2P messaging infrastructure, API keys, and developer logs.",
  openGraph: {
    title: "Log In",
    description:
      "Access your Dugble dashboard to manage your A2P messaging infrastructure, API keys, and developer logs.",
    url: "/login",
  },
};

export default function Page() {
  return <LoginForm />;
}
