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
  h2: ({ children, ...props }) => (
    <h2
      className="mt-10 font-heading text-2xl font-semibold tracking-tight"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="mt-8 font-heading text-xl font-semibold tracking-tight"
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
  ul: ({ children, ...props }) => (
    <ul className="ml-6 list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
