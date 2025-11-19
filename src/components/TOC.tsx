import React from 'react'

export interface TocItem { id: string; level: number; text: string }

interface Props {
  items: TocItem[]
  onJump: (id: string) => void
}

export default function TOC({ items, onJump }: Props) {
  if (!items.length) return null
  return (
    <div className="toc">
      <div className="toc-title">目录</div>
      <ul>
        {items.map(it => (
          <li key={it.id} data-level={it.level} onClick={() => onJump(it.id)}>{it.text}</li>
        ))}
      </ul>
    </div>
  )
}
