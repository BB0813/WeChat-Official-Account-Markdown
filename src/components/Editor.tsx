import React, { ChangeEvent } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
}

export default function Editor({ value, onChange, textareaRef }: Props) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)
  return (
    <div className="pane editor">
      <textarea ref={textareaRef} value={value} onChange={handleChange} placeholder="在此编写Markdown..." spellCheck={false} />
    </div>
  )
}
