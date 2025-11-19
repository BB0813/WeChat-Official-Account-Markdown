import React, { useMemo, useRef } from 'react'
import DOMPurify from 'dompurify'

interface Props {
  html: string
  onReady?: (el: HTMLDivElement | null) => void
}

export default function Preview({ html, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const safe = useMemo(() => DOMPurify.sanitize(html, { ADD_ATTR: ['style', 'id'] }), [html])
  return (
    <div className="pane preview" ref={ref}>
      <div dangerouslySetInnerHTML={{ __html: safe }} />
    </div>
  )
}
