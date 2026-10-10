import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TemplateListItem } from "@/types/template-api";
import { TemplateListRow } from "./template-list-row";

export function TemplateList({ templates }: { templates: TemplateListItem[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="w-72">Template</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Updated</TableHead>
              <TableHead className="w-10 text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TemplateListRow key={template.id} template={template} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
