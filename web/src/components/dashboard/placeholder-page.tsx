import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">Dashboard</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          {description}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            This page is scaffolded so the dashboard navigation and product
            surface are ready for the next feature pass.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-3xl border border-dashed p-8 text-center text-muted-foreground text-sm">
            Build the {title.toLowerCase()} workflow here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
