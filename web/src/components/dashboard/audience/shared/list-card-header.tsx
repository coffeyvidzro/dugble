import type { ReactNode } from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ListCardHeaderProps {
  title: string;
  description: ReactNode;
  action?: ReactNode;
}

export function ListCardHeader({
  title,
  description,
  action,
}: ListCardHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      {action}
    </CardHeader>
  );
}
