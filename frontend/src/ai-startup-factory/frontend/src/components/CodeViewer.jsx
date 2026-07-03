import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

function getLanguageFromFilename(filename) {
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.jsx')) return 'jsx';
  if (filename.endsWith('.ts')) return 'typescript';
  if (filename.endsWith('.tsx')) return 'tsx';
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml';
  if (filename.endsWith('Dockerfile')) return 'dockerfile';
  if (filename.endsWith('.json')) return 'json';
  if (filename.endsWith('.html')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  return 'text';
}

export function CodeViewer({ code, filename = 'code.txt', language }) {
  const [copied, setCopied] = useState(false);

  const lang = language || getLanguageFromFilename(filename);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-700">
        <span className="text-sm font-mono text-slate-300">{filename}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded transition-colors"
        >
          {copied ? (
            <>
              <FiCheck size={14} /> Copied!
            </>
          ) : (
            <>
              <FiCopy size={14} /> Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={lang}
          style={atomOneDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          showLineNumbers
          wrapLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
