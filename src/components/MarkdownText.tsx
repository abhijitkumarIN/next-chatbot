'use client';

import React, { FC, memo, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

interface PreBlockProps {
  children?: React.ReactNode;
  className?: string;
}

const PreBlock: FC<PreBlockProps> = ({ children, className }) => {
  // Type guard to check if children is a React element with props
  const isReactElementWithProps = (child: React.ReactNode): child is React.ReactElement<{ className?: string; children?: React.ReactNode }> => {
    return React.isValidElement(child) && typeof child.props === 'object' && child.props !== null;
  };

  // Check if this is a code block
  const childElement = isReactElementWithProps(children) ? children : null;
  const isCodeBlock = childElement && 
    childElement.props.className && 
    typeof childElement.props.className === 'string' && 
    childElement.props.className.includes('language-');
  
  if (!isCodeBlock) {
    return (
      <code
        className={cn(
          "bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-gray-900 dark:text-gray-100",
          className
        )}
      >
        {children}
      </code>
    );
  }

  let codeString = "";
  let language = "text";

  if (childElement && childElement.props) {
    const props = childElement.props;
    language = props.className?.replace('language-', '') || 'text';
    codeString = typeof props.children === 'string' ? props.children.trim() : '';
  }

  return (
    <div className="relative codeContent my-3 overflow-hidden rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
      <CodeHeader language={language} code={codeString} />
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag="div"
        customStyle={{
          background: "transparent",
          margin: 0,
          padding: "0.75rem",
          fontSize: "0.75rem",
          lineHeight: "1.4",
        }}
        className="code"
      >
        {codeString || "No code content"}
      </SyntaxHighlighter>
    </div>
  );
};

// Header with copy button
const CodeHeader: FC<{ language: string; code: string }> = ({
  language,
  code,
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
      <span className="capitalize text-xs">{language}</span>
      <TooltipIconButton
        tooltip="Copy"
        onClick={onCopy}
        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      >
        {!isCopied ? (
          <CopyIcon className="w-3 h-3" />
        ) : (
          <CheckIcon className="w-3 h-3 text-green-500" />
        )}
      </TooltipIconButton>
    </div>
  );
};

// Clipboard hook
const useCopyToClipboard = ({ copiedDuration = 3000 }: { copiedDuration?: number } = {}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

// Main MarkdownText component
const MarkdownTextImpl: FC<{ children: string }> = ({ children }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({ className, ...props }) => (
          <h1
            className={cn("mb-3 mt-4 text-lg font-bold text-gray-900 dark:text-gray-100", className)}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2 className={cn("mb-2 mt-3 text-base font-semibold text-gray-900 dark:text-gray-100", className)} {...props} />
        ),
        h3: ({ className, ...props }) => (
          <h3 className={cn("mb-2 mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100", className)} {...props} />
        ),
        h4: ({ className, ...props }) => (
          <h4 className={cn("mb-1 mt-2 text-sm font-medium text-gray-900 dark:text-gray-100", className)} {...props} />
        ),
        p: ({ className, ...props }) => (
          <p className={cn("mb-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200", className)} {...props} />
        ),
        a: ({ className, ...props }) => (
          <a
            className={cn("text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300 text-sm", className)}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul className={cn("list-disc ml-4 my-2 text-sm space-y-1", className)} {...props} />
        ),
        ol: ({ className, ...props }) => (
          <ol className={cn("list-decimal ml-4 my-2 text-sm space-y-1", className)} {...props} />
        ),
        li: ({ className, ...props }) => (
          <li className={cn("text-gray-800 dark:text-gray-200", className)} {...props} />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn("pl-3 border-l-3 border-gray-400 dark:border-gray-500 italic my-3 text-sm text-gray-700 dark:text-gray-300", className)}
            {...props}
          />
        ),
        table: ({ className, ...props }) => (
          <div className="overflow-x-auto my-3">
            <table
              className={cn("w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm", className)}
              {...props}
            />
          </div>
        ),
        tr: ({ className, ...props }) => (
          <tr className={cn("border-b border-gray-300 dark:border-gray-600", className)} {...props} />
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn("bg-gray-50 dark:bg-gray-800 px-3 py-2 text-left font-medium border border-gray-300 dark:border-gray-600 text-xs", className)}
            {...props}
          />
        ),
        td: ({ className, ...props }) => (
          <td className={cn("px-3 py-2 border border-gray-300 dark:border-gray-600 text-xs", className)} {...props} />
        ),
        code: ({ className, ...props }) => (
          <code
            className={cn("bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-gray-900 dark:text-gray-100", className)}
            {...props}
          />
        ),
        pre: PreBlock,
        strong: ({ className, ...props }) => (
          <strong className={cn("font-semibold text-gray-900 dark:text-gray-100", className)} {...props} />
        ),
        em: ({ className, ...props }) => (
          <em className={cn("italic text-gray-800 dark:text-gray-200", className)} {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

export const MarkdownText = memo(MarkdownTextImpl);