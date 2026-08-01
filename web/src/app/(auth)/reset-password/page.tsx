import { connection } from "next/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { constructMetadata } from "@/utils/metadata";
export const metadata = constructMetadata({
  title: "Reset Password",
  description: "Set a new password for your Dugble account.",
  path: "/reset-password",
  preset: "auth",
});

export default async function Page() {
  await connection();
  return <ResetPasswordForm />;
}
