import ReactMarkdown from "react-markdown";

/**
 * Shared renderer for every Page-backed storefront route (About, Contact,
 * /pages/[slug] policies/FAQ, /solutions/[slug]) — one markdown → styled-HTML
 * mapping using this project's existing theme tokens, rather than pulling in
 * a Tailwind typography plugin for a "prose" class the rest of the app
 * doesn't otherwise use.
 */
export function PageContent({ title, body }: Readonly<{ title: string; body: string }>) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">{title}</h1>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h2 className="text-xl font-bold text-foreground">{children}</h2>,
            h2: ({ children }) => <h2 className="text-lg font-bold text-foreground">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-bold text-foreground">{children}</h3>,
            p: ({ children }) => <p>{children}</p>,
            a: ({ href, children }) => (
              <a href={href} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                {children}
              </a>
            ),
            ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
            li: ({ children }) => <li className="pl-1">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-border pl-4 italic text-neutral-500">{children}</blockquote>
            ),
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </article>
  );
}
