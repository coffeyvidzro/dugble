import type { ReactNode } from "react";

import { BroadcastsProvider } from "@/components/dashboard/email/broadcasts/broadcasts-provider";
import { requireSession } from "@/lib/session";

export default async function BroadcastsLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await requireSession();

    return (
        <BroadcastsProvider currentUserEmail={session.user.email}>
            <>{children}</>
        </BroadcastsProvider>
    );
}
