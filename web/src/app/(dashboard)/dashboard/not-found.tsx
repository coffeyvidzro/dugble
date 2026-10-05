import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 py-24 text-center">
      <h2 className="font-heading text-lg font-semibold">Not found</h2>
      <p className="text-sm text-muted-foreground">
        This resource doesn&apos;t exist or belongs to another team.
      </p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to overview
      </Link>
    </div>
  );
}
