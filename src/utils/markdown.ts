import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const STYLES: Record<string, string> = {
  h1: 'font-size:24px;font-weight:700;margin:18px 0;color:#1f2328;',
  h2: 'font-size:22px;font-weight:700;margin:16px 0;color:#1f2328;',
  h3: 'font-size:20px;font-weight:700;margin:14px 0;color:#1f2328;',
  p: 'font-size:16px;line-height:1.8;margin:12px 0;color:#1f2328;',
  blockquote: 'border-left:3px solid #d9d9d9;padding:8px 12px;margin:12px 0;color:#666;background:#fafafa;',
  ul: 'margin:12px 0;padding-left:1.25em;',
  ol: 'margin:12px 0;padding-left:1.25em;',
  hr: 'border:none;border-top:1px solid #e5e5e5;margin:24px 0;',
  img: 'max-width:100%;display:block;margin:12px auto;',
  a: 'color:#1677ff;text-decoration:none;border-bottom:1px dotted #1677ff;',
  code_inline: 'background:#f6f8fa;padding:2px 4px;border-radius:4px;font-family:Consolas,Menlo,monospace;font-size:14px;',
  pre: 'background:#f6f8fa;padding:12px;border-radius:8px;overflow:auto;margin:12px 0;',
  table: 'border-collapse:collapse;width:100%;margin:12px 0;',
  th: 'border:1px solid #e5e5e5;padding:8px;background:#fafafa;text-align:left;',
  td: 'border:1px solid #e5e5e5;padding:8px;text-align:left;'
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight: (str: string, lang: string) => {
    try {
      if (lang && hljs.getLanguage(lang)) return hljs.highlight(str, { language: lang }).value
      return hljs.highlightAuto(str).value
    } catch { return md.utils.escapeHtml(str) }
  }
} as MarkdownIt.Options)

function slug(text: string) {
  return (text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

const renderToken = (tokens: any, idx: number, options: any, env: any, slf: any, style?: string) => {
  const token = tokens[idx]
  const tag = token.tag
  const s = style || STYLES[tag] || ''
  token.attrPush(['style', s])
  return slf.renderToken(tokens, idx, options)
}

md.renderer.rules.heading_open = (tokens: any, idx: number, options: any, env: any, slf: any) => {
  let text = ''
  const inline = tokens[idx + 1]
  if (inline && inline.type === 'inline' && Array.isArray(inline.children)) {
    text = inline.children.map((t: any) => t.content || '').join('')
  }
  const id = 'h-' + slug(text)
  const token = tokens[idx]
  token.attrPush(['id', id])
  return renderToken(tokens, idx, options, env, slf)
}
md.renderer.rules.paragraph_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.blockquote_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.ul_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.ol_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.hr = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf, STYLES.hr)
md.renderer.rules.link_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf, STYLES.a)
md.renderer.rules.table_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.thead_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.tr_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.th_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)
md.renderer.rules.td_open = (tokens: any, idx: number, options: any, env: any, slf: any) => renderToken(tokens, idx, options, env, slf)

md.renderer.rules.image = function (tokens: any, idx: number) {
  const token = tokens[idx]
  const srcIdx = token.attrIndex('src')
  const src = srcIdx >= 0 ? token.attrs[srcIdx][1] : ''
  const alt = token.content || ''
  return '<img src="' + src + '" alt="' + alt + '" style="' + STYLES.img + '">' 
}

md.renderer.rules.code_inline = function (tokens: any, idx: number) {
  const content = tokens[idx].content
  return '<code style="' + STYLES.code_inline + '">' + md.utils.escapeHtml(content) + '</code>'
}

md.renderer.rules.fence = function (tokens: any, idx: number) {
  const token = tokens[idx]
  const info = token.info ? token.info.trim() : ''
  const lang = info ? info.split(/\s+/g)[0] : ''
  let code = token.content
  try {
    if (lang && hljs.getLanguage(lang)) code = hljs.highlight(code, { language: lang }).value
    else code = hljs.highlightAuto(code).value
  } catch {}
  return '<pre style="' + STYLES.pre + '"><code>' + code + '</code></pre>'
}

md.renderer.rules.table_open = function () { return '<table style="' + STYLES.table + '">' }
md.renderer.rules.th_open = function () { return '<th style="' + STYLES.th + '">' }
md.renderer.rules.td_open = function () { return '<td style="' + STYLES.td + '">' }

export function renderMarkdown(text: string): string {
  return md.render(text || '')
}

export function extractHeadings(text: string): { id: string; level: number; text: string }[] {
  const tokens = md.parse(text || '', {})
  const res: { id: string; level: number; text: string }[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.type === 'heading_open') {
      const level = Number(t.tag.replace('h', ''))
      const inline = tokens[i + 1]
      let txt = ''
      if (inline && inline.type === 'inline' && Array.isArray(inline.children)) {
        txt = inline.children.map((c: any) => c.content || '').join('')
      }
      const id = 'h-' + slug(txt)
      res.push({ id, level, text: txt })
    }
  }
  return res
}
