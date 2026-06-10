import { useMemo, useState } from 'react'

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python'
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import useStartupStore from '../store/startupStore'

SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('yaml', yaml)

const tabs = [
  { key: 'fastapi_backend', label: 'FastAPI Backend', language: 'python' },
  { key: 'react_frontend', label: 'React Frontend', language: 'javascript' },
  { key: 'database_migrations', label: 'SQL Migrations', language: 'sql' },
  { key: 'requirements_txt', label: 'Requirements', language: 'yaml' },
]

export default function CodeViewer({ sourceKey }) {
  const generatedCode = useStartupStore((state) => state.allOutputs.generated_code || {})
  const [activeTab, setActiveTab] = useState(sourceKey || tabs[0].key)

  const activeSource = useMemo(() => tabs.find((tab) => tab.key === activeTab) || tabs[0], [activeTab])
  const code = generatedCode[activeSource.key] || generatedCode.summary || '// Awaiting generated code...'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-white">Code Viewer</h2>
        <button onClick={copyToClipboard} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-medium text-slate-950">
          Copy to clipboard
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-white text-slate-950' : 'bg-white/10 text-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <SyntaxHighlighter language={activeSource.language} style={atomOneDark} customStyle={{ margin: 0, background: '#020617', padding: '1rem' }}>
          {code}
        </SyntaxHighlighter>
      </div>
    </section>
  )
}
