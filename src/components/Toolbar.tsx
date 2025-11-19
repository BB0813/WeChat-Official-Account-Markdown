import React from 'react'

export type ToolAction = 'bold' | 'italic' | 'h1' | 'h2' | 'ul' | 'ol' | 'quote' | 'code' | 'link'

interface Props {
  onAction: (action: ToolAction) => void
}

export default function Toolbar({ onAction }: Props) {
  return (
    <div className="toolbar">
      <button className="tool" onClick={() => onAction('bold')}>B</button>
      <button className="tool" onClick={() => onAction('italic')}>I</button>
      <button className="tool" onClick={() => onAction('h1')}>H1</button>
      <button className="tool" onClick={() => onAction('h2')}>H2</button>
      <button className="tool" onClick={() => onAction('ul')}>• 列表</button>
      <button className="tool" onClick={() => onAction('ol')}>1. 列表</button>
      <button className="tool" onClick={() => onAction('quote')}>引用</button>
      <button className="tool" onClick={() => onAction('code')}>代码块</button>
      <button className="tool" onClick={() => onAction('link')}>链接</button>
    </div>
  )
}
