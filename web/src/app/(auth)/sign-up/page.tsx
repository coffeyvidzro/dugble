import { SignupForm } from "@/components/auth/signup-form";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Sign Up",
  description:
    "Create your Dugble account to start sending reliable OTPs, alerts, and customer notifications.",
  path: "/sign-up",
  preset: "auth",
});

export default function Page() {
  return <SignupForm />;
}
