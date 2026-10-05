import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Forgot Password",
  description: "Reset access to your Dugble account.",
  path: "/forgot-password",
  preset: "auth",
});

export default function Page() {
  return <ForgotPasswordForm />;
}
