import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Dugble account to start sending reliable OTPs, alerts, and customer notifications.",
  openGraph: {
    title: "Sign Up",
    description:
      "Create your Dugble account to start sending reliable OTPs, alerts, and customer notifications.",
    url: "/signup",
  },
};

export default function Page() {
  return <SignupForm />;
}
