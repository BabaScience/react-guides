import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import type { Components } from 'react-markdown';
import { MermaidDiagram } from './MermaidDiagram';

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const codeStr = String(children).replace(/\n$/, '');

    // Check if it's an inline code (no language class and short content)
    const isInline = !className && !codeStr.includes('\n');
    if (isInline) {
      return (
        <code className="bg-gray-800 text-primary-400 px-1.5 py-0.5 rounded text-sm" {...props}>
          {children}
        </code>
      );
    }

    // Mermaid diagrams
    if (match?.[1] === 'mermaid') {
      return <MermaidDiagram chart={codeStr} />;
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre({ children }) {
    return (
      <pre className="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto p-4 my-4 text-sm">
        {children}
      </pre>
    );
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-700 border border-gray-800 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase bg-gray-800/50">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-2 text-sm text-gray-300 border-t border-gray-800">
        {children}
      </td>
    );
  },
  h1({ children }) {
    return <h1 className="text-3xl font-bold text-white mt-8 mb-4">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-2xl font-bold text-white mt-8 mb-3 pb-2 border-b border-gray-800">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-xl font-semibold text-gray-200 mt-6 mb-2">{children}</h3>;
  },
  h4({ children }) {
    return <h4 className="text-lg font-semibold text-gray-300 mt-4 mb-2">{children}</h4>;
  },
  p({ children }) {
    return <p className="text-gray-300 leading-relaxed mb-4">{children}</p>;
  },
  ul({ children }) {
    return <ul className="list-disc list-inside space-y-1 mb-4 text-gray-300">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-300">{children}</ol>;
  },
  li({ children }) {
    return <li className="text-gray-300">{children}</li>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-primary-500 pl-4 my-4 text-gray-400 italic">
        {children}
      </blockquote>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} className="text-primary-400 hover:text-primary-300 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  hr() {
    return <hr className="border-gray-800 my-8" />;
  },
  strong({ children }) {
    return <strong className="font-semibold text-white">{children}</strong>;
  },
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
