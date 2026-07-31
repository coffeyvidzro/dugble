import type { Metadata } from "next";

import { CreateWorkspaceHeader } from "@/components/dashboard/workspace/create-workspace-header";
import { CreateWorkspaceForm } from "@/components/dashboard/workspace/create-workspace-form";

export const metadata: Metadata = {
    title: "Create workspace",
};

export default function Page() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
            <CreateWorkspaceHeader />
            <CreateWorkspaceForm />
        </div>
    );
}
