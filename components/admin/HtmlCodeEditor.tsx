'use client'

import React, { useState, useRef, useId } from 'react'
import {
  Code,
  Eye,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertCircle,
  FileCode,
} from 'lucide-react'

interface HtmlCodeEditorProps {
  value: string
  onChange: (val: string) => void
  label?: string
  placeholder?: string
  height?: string
  readOnly?: boolean
  mode?: 'html' | 'xml'
}

export function HtmlCodeEditor({
  value,
  onChange,
  label = 'HTML / XML Code Editor',
  placeholder = 'Type or paste HTML / XML code here...',
  height = '400px',
  readOnly = false,
  mode = 'html',
}: HtmlCodeEditorProps) {
  const editorId = useId()
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const lines = value ? value.split('\n') : ['']
  const lineCount = lines.length

  // Quick insertion helpers
  const insertTag = (startTag: string, endTag: string = '') => {
    if (readOnly || !textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const replacement = `${startTag}${selectedText}${endTag}`
    const newValue = value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + selectedText.length)
    }, 0)
  }

  const insertXmlUrlTemplate = () => {
    const template = `  <url>
    <loc>https://indiayogatourism.com/your-custom-path</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    insertTag(template, '')
  }

  const handleFormatCode = () => {
    if (readOnly) return
    try {
      // Basic automatic indentation formatter for XML/HTML tags
      let formatted = ''
      let indent = 0
      const nodes = value.replace(/>\s*</g, '><').split(/(?=<)/)

      for (const node of nodes) {
        if (node.match(/^<\/\w/)) {
          indent = Math.max(0, indent - 1)
        }
        formatted += '  '.repeat(indent) + node + '\n'
        if (node.match(/^<\w[^>]*[^\/]>$/) && !node.startsWith('<?')) {
          indent++
        }
      }
      onChange(formatted.trim())
    } catch (e) {
      // If auto-format fails, leave text as is
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Basic XML/HTML tag validation
  const checkTagValidity = () => {
    if (!value.trim()) return true
    const openTags = (value.match(/<[a-zA-Z1-6]+(?=[ >])/g) || []).map((t) => t.replace('<', ''))
    const closeTags = (value.match(/<\/[a-zA-Z1-6]+>/g) || []).map((t) => t.replace('</', '').replace('>', ''))

    // Ignore self-closing tags like img, br, hr, input, meta, link
    const selfClosing = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'xml', '?xml'])
    const filteredOpen = openTags.filter((t) => !selfClosing.has(t.toLowerCase()))
    const filteredClose = closeTags.filter((t) => !selfClosing.has(t.toLowerCase()))

    return filteredOpen.length === filteredClose.length
  }

  const isValid = checkTagValidity()

  return (
    <div
      className={`rounded-2xl border border-gray-800 bg-[#1e1e1e] shadow-xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col m-0 max-w-none' : 'w-full'
      }`}
    >
      {/* Top Toolbar Header */}
      <div className="bg-[#181818] border-b border-gray-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#E2C799]" />
          <span className="text-xs font-bold text-gray-200 tracking-wide">{label}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-emerald-400 font-bold uppercase">
            {mode.toUpperCase()}
          </span>
          {isValid ? (
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" /> Syntax Valid
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-amber-400 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-400" /> Unclosed Tags
            </span>
          )}
        </div>

        {/* View Mode Tabs & Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-900 p-0.5 rounded-lg border border-gray-800 flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-[#2d2d2d] text-emerald-400 shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-[#2d2d2d] text-emerald-400 shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visual Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors text-xs font-bold flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Snippets Bar (Code Mode Only) */}
      {activeTab === 'code' && !readOnly && (
        <div className="bg-[#252526] border-b border-gray-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-thin">
          <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider mr-1">Insert Tag:</span>
          
          {mode === 'xml' ? (
            <>
              <button
                type="button"
                onClick={insertXmlUrlTemplate}
                className="px-2.5 py-1 rounded bg-[#333] hover:bg-[#444] text-emerald-300 font-mono font-bold transition-colors border border-emerald-900/50 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>+ &lt;url&gt; Node</span>
              </button>
              <button
                type="button"
                onClick={() => insertTag('<loc>', '</loc>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;loc&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<lastmod>', '</lastmod>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;lastmod&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<priority>', '</priority>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;priority&gt;
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => insertTag('<h2>', '</h2>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;h2&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<p>', '</p>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;p&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<b>', '</b>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700 font-bold"
              >
                &lt;b&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<a href="#">', '</a>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-emerald-300 font-mono transition-colors border border-emerald-900/50"
              >
                &lt;a&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<div className="p-4 bg-gray-50 rounded-xl">', '</div>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;div&gt;
              </button>
              <button
                type="button"
                onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
                className="px-2 py-0.5 rounded bg-[#333] hover:bg-[#444] text-gray-300 font-mono transition-colors border border-gray-700"
              >
                &lt;ul&gt;&lt;li&gt;
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleFormatCode}
            className="ml-auto px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold transition-colors border border-emerald-700/50 hover:bg-emerald-900"
            title="Format Code Indentation"
          >
            Auto-Format
          </button>
        </div>
      )}

      {/* Editor Container Body */}
      <div className={`relative flex font-mono text-xs ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        {activeTab === 'code' ? (
          <div className="flex w-full overflow-x-auto relative" style={{ height: isFullscreen ? '100%' : height }}>
            {/* Line Numbers Gutter */}
            <div className="bg-[#1e1e1e] text-gray-600 select-none py-3 px-3 text-right border-r border-gray-800 min-w-[40px] font-mono text-xs">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="leading-6">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input Textarea */}
            <textarea
              id={editorId}
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              spellCheck={false}
              className="flex-1 bg-[#1e1e1e] text-[#d4d4d4] p-3 outline-none resize-none font-mono text-xs leading-6 selection:bg-[#264f78] w-full"
            />
          </div>
        ) : (
          /* Visual Rendered Preview */
          <div
            className="w-full bg-white text-gray-900 p-6 overflow-y-auto leading-relaxed text-sm font-sans"
            style={{ height: isFullscreen ? '100%' : height }}
          >
            {value.trim() ? (
              mode === 'xml' ? (
                <div className="font-mono text-xs space-y-2 text-emerald-950 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-900 border-b border-emerald-200 pb-2 mb-2 flex items-center justify-between">
                    <span>Parsed XML Sitemap Structure</span>
                    <span className="text-[10px] text-emerald-700 font-normal">Standard XML 0.9 Payload</span>
                  </div>
                  <pre className="whitespace-pre-wrap text-emerald-900 leading-relaxed">{value}</pre>
                </div>
              ) : (
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              )
            ) : (
              <div className="p-12 text-center text-gray-400">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No code entered yet to preview.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Status Footer */}
      <div className="bg-[#181818] border-t border-gray-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-400">
        <div className="flex items-center gap-4">
          <span>
            Lines: <strong className="text-white">{lineCount}</strong>
          </span>
          <span>
            Characters: <strong className="text-white">{value.length}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span>UTF-8</span>
          <span>•</span>
          <span>{mode.toUpperCase()} Syntax</span>
        </div>
      </div>
    </div>
  )
}
