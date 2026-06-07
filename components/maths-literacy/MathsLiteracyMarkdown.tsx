"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a Maths Literacy question / stimulus as markdown so that tables
 * (e.g. a bank statement), **bold**, and lists display properly instead of
 * showing raw `|` pipes and `*` asterisks.
 *
 * Scoped to Maths Literacy on purpose — its banks author financial documents
 * (statements, tills slips, budgets) as GFM tables. `remark-gfm` turns those
 * into real tables; the table is wrapped so it scrolls sideways on a phone
 * rather than squashing the columns.
 */
export default function MathsLiteracyMarkdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-gray-100 px-3 py-2 text-gray-800 whitespace-nowrap">
              {children}
            </td>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 space-y-1">{children}</ol>,
          strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
