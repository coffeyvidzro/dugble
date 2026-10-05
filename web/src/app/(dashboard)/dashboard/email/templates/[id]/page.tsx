// src/app/(dashboard)/dashboard/email/templates/[id]/page.tsx

import { notFound } from "next/navigation";
import { TemplateEditorLoader } from "@/components/dashboard/email/templates/editor/template-editor-loader";
import { isTemplateIdentifier } from "@/lib/security/route-params";
import { constructMetadata } from "@/utils/metadata";

export const metadata = constructMetadata({
  title: "Edit Template",
  description: "Edit a transactional email template.",
  path: "/dashboard/email/templates",
  preset: "dashboard",
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // The ID becomes part of an API path — reject anything malformed up front.
  if (!isTemplateIdentifier(id)) notFound();

  return (
    <div className="flex-1 w-full bg-background min-h-screen pt-8 pb-16 px-4 md:px-2">
      <TemplateEditorLoader id={id} />
    </div>
  );
}
