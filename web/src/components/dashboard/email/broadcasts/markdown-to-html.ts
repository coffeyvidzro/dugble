// src/components/dashboard/email/broadcasts/markdown-to-html.ts

import { isSafeLinkUrl } from "@/lib/security/safe-url";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const INLINE_PATTERN = /(\*\*(.+?)\*\*|_(.+?)_|\[(.+?)\]\((.+?)\))/g;

function renderInlineHtml(text: string): string {
  let result = "";
  let lastIndex = 0;

  // matchAll iterates a copy of the regex: no shared lastIndex state between calls.

  for (const match of text.matchAll(INLINE_PATTERN)) {
    if (match.index > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, match.index));
    }
    if (match[2] !== undefined) {
      result += `<strong>${escapeHtml(match[2])}</strong>`;
    } else if (match[3] !== undefined) {
      result += `<em>${escapeHtml(match[3])}</em>`;
    } else if (match[4] !== undefined) {
      result += isSafeLinkUrl(match[5] ?? "")
        ? `<a href="${escapeHtml(match[5] ?? "")}">${escapeHtml(match[4])}</a>`
        : escapeHtml(match[4]);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex));
  }
  return result;
}

/**
 * Converts the composer's lightweight Markdown syntax into the HTML string
 * the real Broadcast API expects for its `html` field. Mirrors
 * content-preview.tsx's block/inline parsing but emits an HTML string
 * instead of React nodes, since POST /broadcasts has no Markdown support
 * of its own — it stores exactly the HTML/text it's given.
 */
export function markdownToHtml(content: string): string {
  const lines = content.split("\n");
  const blocks: string[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length === 0) return;
    const items = listBuffer
      .map((item) => `<li>${renderInlineHtml(item)}</li>`)
      .join("");
    blocks.push(`<ul>${items}</ul>`);
    listBuffer = [];
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith("- ")) {
      listBuffer.push(trimmed.slice(2));
      return;
    }
    flushList();
    if (trimmed.startsWith("## ")) {
      blocks.push(`<h3>${renderInlineHtml(trimmed.slice(3))}</h3>`);
    } else if (trimmed.startsWith("# ")) {
      blocks.push(`<h2>${renderInlineHtml(trimmed.slice(2))}</h2>`);
    } else {
      blocks.push(`<p>${renderInlineHtml(trimmed)}</p>`);
    }
  });
  flushList();

  return blocks.join("\n");
}

/** Naive Markdown-to-plaintext fallback, used for the optional `text` field. */
export function markdownToPlainText(content: string): string {
  return content
    .split("\n")
    .map((line) =>
      line
        .replace(/^#+\s*/, "")
        .replace(/^- /, "• ")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1"),
    )
    .join("\n")
    .trim();
}
