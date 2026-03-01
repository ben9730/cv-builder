'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface TextPasteProps {
  onText: (text: string) => void
  disabled?: boolean
}

export function TextPaste({ onText, disabled = false }: TextPasteProps) {
  const [text, setText] = useState('')

  const handleImport = () => {
    if (text.trim()) {
      onText(text)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        placeholder="Paste your resume text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] resize-y"
      />
      <Button
        onClick={handleImport}
        disabled={disabled || !text.trim()}
        className="self-end"
        size="sm"
      >
        <FileText className="size-4 mr-1" />
        Import Text
      </Button>
    </div>
  )
}
