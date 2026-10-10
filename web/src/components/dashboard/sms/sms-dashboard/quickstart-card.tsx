import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeTabs } from "./code-tabs";

export function QuickstartCard() {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle>Send your first SMS</CardTitle>
        <CardDescription>
          Pick your language and drop this into your backend you&apos;re sending
          in minutes.
        </CardDescription>
      </CardHeader>
      <div className="p-4">
        <CodeTabs />
      </div>
    </Card>
  );
}
