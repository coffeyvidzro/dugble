import { CreateTeamForm } from "@/components/dashboard/create-team/create-team-form";
import { CreateTeamHeader } from "@/components/dashboard/create-team/create-team-header";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
    title: "Create team",
    description:
        "Create a new Dugble team to organize your API keys, senders, and teammates.",
    path: "/dashboard/create-team",
    preset: "dashboard",
});

export default function Page() {
    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-10">
            <CreateTeamHeader />
            <CreateTeamForm />
        </div>
    );
}
