import type { MobilePane, PreviewViewport } from "./editor-types";
import type { TemplateCategory } from "../types";

import { VariableInsertMenu } from "./variable-insert-menu";
import type { TemplateVariable } from "../template-content";
import { MobilePaneTabs } from "./mobile-pane-tabs";
import { CategorySelect } from "./category-select";
import { DeviceToggle } from "./device-toggle";

interface EditorToolbarProps {
    category: TemplateCategory;
    onCategoryChange: (value: TemplateCategory) => void;
    onInsertVariable: (variable: TemplateVariable) => void;
    viewport: PreviewViewport;
    onViewportChange: (value: PreviewViewport) => void;
    mobilePane: MobilePane;
    onMobilePaneChange: (value: MobilePane) => void;
}

export function EditorToolbar({
    category,
    onCategoryChange,
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
                <VariableInsertMenu
                    category={category}
                    onInsert={onInsertVariable}
                />
            </div>
            <div className="flex items-center gap-2">
                <MobilePaneTabs
                    value={mobilePane}
                    onChange={onMobilePaneChange}
                />
                <DeviceToggle value={viewport} onChange={onViewportChange} />
            </div>
        </div>
    );
}
