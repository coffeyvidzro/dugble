import type { ReactNode } from "react";

export type CodeLanguage = "curl" | "node" | "python" | "php" | "ruby" | "go";

export const LANGUAGE_META: Record<
    CodeLanguage,
    { label: string; accent: string }
> = {
    curl: { label: "cURL", accent: "bg-zinc-400" },
    node: { label: "Node.js", accent: "bg-emerald-500" },
    python: { label: "Python", accent: "bg-sky-400" },
    php: { label: "PHP", accent: "bg-violet-400" },
    ruby: { label: "Ruby", accent: "bg-rose-500" },
    go: { label: "Go", accent: "bg-cyan-400" },
};

export const SNIPPETS: Record<CodeLanguage, string> = {
    curl: `curl -X POST https://api.dugble.com/v1/sms \\
  -H "Authorization: Bearer dgb_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+233201234567",
    "from": "Dugble",
    "body": "Your verification code is 482913"
  }'`,
    node: `import { Dugble } from "dugble";

const dugble = new Dugble(process.env.DUGBLE_API_KEY);

await dugble.sms.send({
  to: "+233201234567",
  from: "Dugble",
  body: "Your verification code is 482913",
});`,
    python: `from dugble import Dugble

dugble = Dugble(api_key=os.environ["DUGBLE_API_KEY"])

dugble.sms.send(
    to="+233201234567",
    from_="Dugble",
    body="Your verification code is 482913",
)`,
    php: `<?php

use Dugble\\Client;

$dugble = new Client($_ENV['DUGBLE_API_KEY']);

$dugble->sms->send([
    'to' => '+233201234567',
    'from' => 'Dugble',
    'body' => 'Your verification code is 482913',
]);`,
    ruby: `require "dugble"

dugble = Dugble::Client.new(ENV["DUGBLE_API_KEY"])

dugble.sms.send(
  to: "+233201234567",
  from: "Dugble",
  body: "Your verification code is 482913"
)`,
    go: `package main

import "github.com/dugble/dugble-go"

func main() {
    client := dugble.NewClient(os.Getenv("DUGBLE_API_KEY"))

    client.SMS.Send(&dugble.SMSParams{
        To:   "+233201234567",
        From: "Dugble",
        Body: "Your verification code is 482913",
    })
}`,
};

type TokenType =
    | "comment"
    | "string"
    | "keyword"
    | "fn"
    | "number"
    | "flag"
    | "variable"
    | "symbol";

const TOKEN_CLASS: Record<TokenType, string> = {
    comment: "text-zinc-500 italic",
    string: "text-emerald-400",
    keyword: "text-sky-400",
    fn: "text-amber-300",
    number: "text-purple-400",
    flag: "text-sky-400",
    variable: "text-orange-300",
    symbol: "text-fuchsia-400",
};

type Rule = { type: TokenType; source: string };

const STRING_DQSQ = `"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'`;
const STRING_TEMPLATE_DQSQ = `\`(?:[^\`\\\\]|\\\\.)*\`|${STRING_DQSQ}`;
const IDENTIFIER_FN = `[A-Za-z_$][\\w$]*(?=\\()`;
const NUMBER = `\\b\\d+(?:\\.\\d+)?\\b`;

const RULES: Record<CodeLanguage, Rule[]> = {
    curl: [
        { type: "string", source: STRING_DQSQ },
        { type: "flag", source: `(?<!\\S)-{1,2}[A-Za-z][\\w-]*` },
        { type: "keyword", source: `\\bcurl\\b|\\bPOST\\b|\\bGET\\b` },
    ],
    node: [
        { type: "comment", source: `\\/\\/.*` },
        { type: "string", source: STRING_TEMPLATE_DQSQ },
        {
            type: "keyword",
            source: `\\b(?:import|from|const|let|var|await|async|new|export|default|return|function)\\b`,
        },
        { type: "fn", source: IDENTIFIER_FN },
        { type: "number", source: NUMBER },
    ],
    python: [
        { type: "comment", source: `#.*` },
        { type: "string", source: `f?"(?:[^"\\\\]|\\\\.)*"|f?'(?:[^'\\\\]|\\\\.)*'` },
        {
            type: "keyword",
            source: `\\b(?:import|from|def|return|await|class|as|in|is|None|True|False)\\b`,
        },
        { type: "fn", source: `[A-Za-z_]\\w*(?=\\()` },
        { type: "number", source: NUMBER },
    ],
    php: [
        { type: "comment", source: `\\/\\/.*|#.*` },
        { type: "string", source: STRING_DQSQ },
        {
            type: "keyword",
            source: `\\b(?:use|new|return|function|public|require|echo|namespace)\\b`,
        },
        { type: "variable", source: `\\$[A-Za-z_]\\w*` },
        { type: "fn", source: `[A-Za-z_]\\w*(?=\\()` },
        { type: "number", source: NUMBER },
    ],
    ruby: [
        { type: "comment", source: `#.*` },
        { type: "string", source: STRING_DQSQ },
        {
            type: "keyword",
            source: `\\b(?:require|do|end|def|return|class|module|new)\\b`,
        },
        { type: "symbol", source: `:[A-Za-z_]\\w*` },
        { type: "fn", source: `[A-Za-z_]\\w*(?=\\()` },
        { type: "number", source: NUMBER },
    ],
    go: [
        { type: "comment", source: `\\/\\/.*` },
        { type: "string", source: STRING_TEMPLATE_DQSQ },
        {
            type: "keyword",
            source: `\\b(?:package|import|func|return|var|struct|type)\\b`,
        },
        { type: "fn", source: `[A-Za-z_]\\w*(?=\\()` },
        { type: "number", source: NUMBER },
    ],
};

function buildMatcher(rules: Rule[]): RegExp {
    const pattern = rules.map((rule) => `(?<${rule.type}>${rule.source})`).join("|");
    return new RegExp(pattern, "g");
}

const MATCHERS: Record<CodeLanguage, RegExp> = Object.fromEntries(
    (Object.keys(RULES) as CodeLanguage[]).map((lang) => [
        lang,
        buildMatcher(RULES[lang]),
    ]),
) as Record<CodeLanguage, RegExp>;

function highlightLine(
    line: string,
    lang: CodeLanguage,
    keyPrefix: string,
): ReactNode[] {
    const matcher = MATCHERS[lang];
    matcher.lastIndex = 0;

    const nodes: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let tokenIndex = 0;

    while ((match = matcher.exec(line))) {
        if (match.index > lastIndex) {
            nodes.push(line.slice(lastIndex, match.index));
        }

        const type = (Object.keys(match.groups ?? {}) as TokenType[]).find(
            (key) => match?.groups?.[key] !== undefined,
        );

        nodes.push(
            type ? (
                <span key={`${keyPrefix}-${tokenIndex++}`} className={TOKEN_CLASS[type]}>
                    {match[0]}
                </span>
            ) : (
                match[0]
            ),
        );

        lastIndex = match.index + match[0].length;
        if (match[0].length === 0) matcher.lastIndex += 1;
    }

    if (lastIndex < line.length) {
        nodes.push(line.slice(lastIndex));
    }

    return nodes;
}

/** Splits `code` into lines and tokenizes each one for syntax-highlighted rendering. */
export function highlightCode(code: string, lang: CodeLanguage): ReactNode[][] {
    return code
        .split("\n")
        .map((line, lineIndex) => highlightLine(line, lang, `l${lineIndex}`));
}
