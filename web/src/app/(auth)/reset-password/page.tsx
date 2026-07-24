import { connection } from "next/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function Page() {
    await connection();
    return <ResetPasswordForm />;
}
