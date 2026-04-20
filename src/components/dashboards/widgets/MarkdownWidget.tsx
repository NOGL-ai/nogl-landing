"use client";

import ReactMarkdown from "react-markdown";

interface Props {
  content: string;
}

export function MarkdownWidget({ content }: Props) {
  if (!content?.trim()) {
    return (
      <p className="text-xs text-muted-foreground italic">
        No content. Click edit to add markdown text.
      </p>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
