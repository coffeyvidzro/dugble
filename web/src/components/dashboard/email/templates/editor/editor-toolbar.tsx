import type { TemplateApiCategory } from "@/types/template-api";
import { CategorySelect } from "./category-select";
import { DeviceToggle } from "./device-toggle";
import type {
  EditorVariable,
  MobilePane,
  PreviewViewport,
} from "./editor-types";
import { MobilePaneTabs } from "./mobile-pane-tabs";
import { VariableInsertMenu } from "./variable-insert-menu";

interface EditorToolbarProps {
  category: TemplateApiCategory;
  onCategoryChange: (value: TemplateApiCategory) => void;
  variables: EditorVariable[];
  onInsertVariable: (key: string) => void;
  viewport: PreviewViewport;
  onViewportChange: (value: PreviewViewport) => void;
  mobilePane: MobilePane;
  onMobilePaneChange: (value: MobilePane) => void;
}

export function EditorToolbar({
  category,
  onCategoryChange,
  variables,
  onInsertVariable,
  viewport,
  onViewportChange,
  mobilePane,
  onMobilePaneChange,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <CategorySelect value={category} onChange={onCategoryChange} />
        <VariableInsertMenu variables={variables} onInsert={onInsertVariable} />
      </div>
      <div className="flex items-center gap-2">
        <MobilePaneTabs value={mobilePane} onChange={onMobilePaneChange} />
        <DeviceToggle value={viewport} onChange={onViewportChange} />
      </div>
    </div>
  );
}
