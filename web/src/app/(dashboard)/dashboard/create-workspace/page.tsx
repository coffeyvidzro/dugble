import { CreateWorkspaceForm } from "@/components/dashboard/workspace/create-workspace-form";
import { CreateWorkspaceHeader } from "@/components/dashboard/workspace/create-workspace-header";
import { NextStepsCard } from "@/components/dashboard/workspace/next-steps-card";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Create workspace",
    description:
        "Create a Dugble workspace for sending and monitoring A2P email and SMS messages.",
    path: "/dashboard/create-workspace",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
            <CreateWorkspaceHeader />
            <CreateWorkspaceForm nextSteps={<NextStepsCard />} />
        </div>
    );
}
