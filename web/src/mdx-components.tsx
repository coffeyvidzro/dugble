import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {
  a: ({ children, ...props }) => (
    <a
      className="font-medium text-primary underline-offset-4 hover:underline"
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-primary/40 border-l-4 pl-5 font-medium text-foreground italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }) => (
    <code
      className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-foreground text-sm"
      {...props}
    >
      {children}
    </code>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="mt-10 font-heading text-2xl font-semibold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-8 font-heading text-xl font-semibold tracking-tight text-foreground"
      {...props}
    >
      {children}
    </h3>
  ),
  li: ({ children, ...props }) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  ol: ({ children, ...props }) => (
    <ol className="ml-6 list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  p: ({ children, ...props }) => (
    <p className="leading-8" {...props}>
      {children}
    </p>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="overflow-x-auto rounded-3xl border bg-muted p-5 text-sm leading-7"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto rounded-3xl border">
      <table className="w-full text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  td: ({ children, ...props }) => (
    <td className="border-t px-4 py-3" {...props}>
      {children}
    </td>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 font-medium text-foreground" {...props}>
      {children}
    </th>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/60" {...props}>
      {children}
    </thead>
  ),
  ul: ({ children, ...props }) => (
    <ul className="ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
