import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { TemplateListRow } from "./template-list-row";
import type { EmailTemplate } from "./types";

export function TemplateList({ templates }: { templates: EmailTemplate[] }) {
    return (
        <Card className="overflow-hidden border-border/40 shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-border/40 hover:bg-transparent">
                            <TableHead className="w-72">Template</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-28 text-right">
                                Sent (30d)
                            </TableHead>
                            <TableHead className="w-32">Updated</TableHead>
                            <TableHead className="w-10 text-right" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {templates.map((template) => (
                            <TemplateListRow
                                key={template.id}
                                template={template}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}
