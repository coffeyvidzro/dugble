import type { ReactNode } from "react";

export function AudiencePageShell({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      {header}
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}
