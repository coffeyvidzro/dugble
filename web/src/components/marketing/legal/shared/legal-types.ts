export type LegalParagraphBlock = {
    type: "paragraph";
    text: string;
};

export type LegalSubheadingBlock = {
    type: "subheading";
    text: string;
};

export type LegalListBlock = {
    type: "list";
    items: string[];
};

export type LegalDefinitionListBlock = {
    type: "definitionList";
    items: { term: string; definition: string }[];
};

export type LegalBlock =
    | LegalParagraphBlock
    | LegalSubheadingBlock
    | LegalListBlock
    | LegalDefinitionListBlock;

export type LegalSectionData = {
    id: string;
    title: string;
    blocks: LegalBlock[];
};

export type LegalDocumentMeta = {
    eyebrow: string;
    title: string;
    effectiveDate: string;
    lastUpdated: string;
    intro: string;
    summaryPoints: string[];
};
