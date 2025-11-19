import React from 'react'

interface Props {
  text: string
  layout: 'split' | 'editor' | 'preview'
  onLayoutChange: (l: 'split' | 'editor' | 'preview') => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

function countStats(text: string) {
  const chars = text.length
  const words = (text.match(/\S+/g) || []).length
  const minutes = Math.max(1, Math.ceil(chars / 400))
  return { chars, words, minutes }
}

export default function StatusBar({ text, layout, onLayoutChange, theme, onThemeToggle }: Props) {
  const { chars, words, minutes } = countStats(text)
  return (
    <div className="statusbar">
      <div className="status">
        <span>字数 {chars}</span>
        <span>词数 {words}</span>
        <span>预计阅读 {minutes} 分钟</span>
      </div>
      <div className="toggles">
        <button className={theme === 'dark' ? 'toggle active' : 'toggle'} onClick={onThemeToggle}>{theme === 'dark' ? '暗色主题' : '浅色主题'}</button>
        <button className={layout === 'split' ? 'toggle active' : 'toggle'} onClick={() => onLayoutChange('split')}>双栏</button>
        <button className={layout === 'editor' ? 'toggle active' : 'toggle'} onClick={() => onLayoutChange('editor')}>仅编辑</button>
        <button className={layout === 'preview' ? 'toggle active' : 'toggle'} onClick={() => onLayoutChange('preview')}>仅预览</button>
      </div>
    </div>
  )
}
