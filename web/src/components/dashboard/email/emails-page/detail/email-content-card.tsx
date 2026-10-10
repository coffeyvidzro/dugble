import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { EmailApiResource } from "@/types/email-api";

export function EmailContentCard({ email }: { email: EmailApiResource }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b pb-4">
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          {email.html ? "Rendered HTML body." : "Plain text body."}
        </CardDescription>
      </CardHeader>
      <div className="flex justify-center overflow-auto bg-muted/20 p-4">
        {email.html ? (
          <iframe
            title={`Preview for ${email.id}`}
            srcDoc={email.html}
            sandbox=""
            className="min-h-96 w-full rounded-lg border border-border/40 bg-white shadow-sm"
          />
        ) : (
          <pre className="w-full whitespace-pre-wrap rounded-lg border border-border/40 bg-white p-4 text-sm text-zinc-800 shadow-sm">
            {email.text || "No content."}
          </pre>
        )}
      </div>
    </Card>
  );
}
