import React, { useEffect, useMemo, useRef, useState } from 'react'
import Toolbar, { ToolAction } from './components/Toolbar'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { renderMarkdown, extractHeadings } from './utils/markdown'
import StatusBar from './components/StatusBar'
import TOC from './components/TOC'

function useLocalStorage(key: string, initial: string) {
  const [value, setValue] = useState<string>(() => {
    const saved = localStorage.getItem(key)
    return saved ?? initial
  })
  useEffect(() => { localStorage.setItem(key, value) }, [key, value])
  return [value, setValue] as const
}

function sample() {
  return '# 标题示例\n\n这是一段用于公众号的 Markdown 内容示例。\n\n## 小标题\n\n- 列表项目一\n- 列表项目二\n\n> 引用段落，适合强调信息。\n\n代码示例：\n\n```js\nfunction hello(name) {\n  return `你好, ${name}`\n}\n```\n\n表格示例：\n\n| 列 | 值 |\n|---|---|\n| A | 1 |\n| B | 2 |\n\n链接示例：[点击访问](https://mp.weixin.qq.com)\n'
}

export default function App() {
  const [text, setText] = useLocalStorage('wx-md-content', sample())
  const html = useMemo(() => renderMarkdown(text), [text])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [toast, setToast] = useState<string>('')
  const [layout, setLayout] = useState<'split' | 'editor' | 'preview'>('split')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const previewRef = useRef<HTMLDivElement | null>(null)
  const toc = useMemo(() => extractHeadings(text), [text])

  const showToast = (t: string) => {
    setToast(t)
    setTimeout(() => setToast(''), 2000)
  }

  const insertSyntax = (before: string, after?: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const sel = text.slice(start, end)
    const prefix = text.slice(0, start)
    const suffix = text.slice(end)
    const insert = before + (sel || '') + (after || '')
    const next = prefix + insert + suffix
    setText(next)
    requestAnimationFrame(() => {
      const pos = (prefix + insert).length
      ta.setSelectionRange(pos, pos)
      ta.focus()
    })
  }

  const handleAction = (action: ToolAction) => {
    if (action === 'bold') return insertSyntax('**', '**')
    if (action === 'italic') return insertSyntax('*', '*')
    if (action === 'h1') return insertSyntax('\n# ')
    if (action === 'h2') return insertSyntax('\n## ')
    if (action === 'ul') return insertSyntax('\n- ')
    if (action === 'ol') return insertSyntax('\n1. ')
    if (action === 'quote') return insertSyntax('\n> ')
    if (action === 'code') return insertSyntax('\n```\n', '\n```\n')
    if (action === 'link') {
      const ta = textareaRef.current
      if (!ta) return
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const sel = text.slice(start, end) || '链接文本'
      const prefix = text.slice(0, start)
      const suffix = text.slice(end)
      const url = 'https://'
      const insert = '[' + sel + '](' + url + ')'
      const next = prefix + insert + suffix
      setText(next)
      requestAnimationFrame(() => {
        const pos = (prefix + insert).length - 1
        ta.setSelectionRange(pos - url.length, pos)
        ta.focus()
      })
    }
  }

  const copyHTML = async () => {
    const exportHTML = getExportHTML()
    const plain = stripHtml(exportHTML)
    try {
      if ('clipboard' in navigator && 'ClipboardItem' in window) {
        const item = new ClipboardItem({
          'text/html': new Blob([exportHTML], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        })
        await navigator.clipboard.write([item])
        showToast('已复制富文本，可直接粘贴到公众号')
        return
      }
    } catch {}
    const div = document.createElement('div')
    div.setAttribute('contenteditable', 'true')
    div.style.position = 'fixed'
    div.style.opacity = '0'
    div.style.pointerEvents = 'none'
    div.innerHTML = exportHTML
    document.body.appendChild(div)
    const range = document.createRange()
    range.selectNodeContents(div)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
    try { document.execCommand('copy'); showToast('已复制富文本') } catch {}
    sel?.removeAllRanges()
    document.body.removeChild(div)
  }

  const downloadHTML = () => {
    const exportHTML = getExportHTML()
    const blob = new Blob([exportHTML], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wechat-article.html'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getExportHTML = () => {
    const wrap = document.createElement('div')
    wrap.innerHTML = html
    inlineHighlightStyles(wrap)
    return wrap.innerHTML
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return (tmp.textContent || '').trim()
  }

  const inlineHighlightStyles = (root: HTMLElement) => {
    const nodes = root.querySelectorAll('pre code, code')
    nodes.forEach(code => {
      const spans = code.querySelectorAll('*')
      spans.forEach(el => {
        const s = window.getComputedStyle(el as Element)
        const style = [
          s.color ? `color:${s.color}` : '',
          s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)' ? `background-color:${s.backgroundColor}` : '',
          s.fontWeight ? `font-weight:${s.fontWeight}` : '',
          s.fontStyle ? `font-style:${s.fontStyle}` : '',
          s.textDecorationLine && s.textDecorationLine !== 'none' ? `text-decoration:${s.textDecorationLine}` : ''
        ].filter(Boolean).join(';')
        const existing = (el as HTMLElement).getAttribute('style') || ''
        const next = existing ? existing + ';' + style : style
        if (next) (el as HTMLElement).setAttribute('style', next)
      })
    })
  }

  return (
    <div className={theme === 'dark' ? 'theme-dark' : undefined}>
      <div className="header">
        <div className="title">微信公众号 Markdown 编辑器</div>
        <div className="actions">
          <button className="btn" onClick={downloadHTML}>下载HTML</button>
          <button className="btn primary" onClick={copyHTML}>复制HTML到剪贴板</button>
          <button className="btn" onClick={() => setText('')}>清空</button>
        </div>
      </div>
      <div className="legend">实时预览右侧为微信兼容的HTML，复制后可直接粘贴到公众号后台。</div>
      <TOC items={toc} onJump={(id) => {
        const el = document.getElementById(id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }} />
      <Toolbar onAction={handleAction} />
      <div className="split">下滑可查看预览</div>
      <div className="container" style={layout === 'split' ? undefined : { gridTemplateColumns: '1fr' }}>
        {(layout === 'split' || layout === 'editor') && (
          <Editor value={text} onChange={setText} textareaRef={textareaRef} />
        )}
        {(layout === 'split' || layout === 'preview') && (
          <Preview html={html} onReady={(el) => (previewRef.current = el)} />
        )}
      </div>
      <StatusBar
        text={text}
        layout={layout}
        onLayoutChange={setLayout}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <div className={toast ? 'toast show' : 'toast'}>{toast}</div>
    </div>
  )
}
