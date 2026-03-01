'use client'

import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagInput({ value = [], onChange, placeholder = 'Type and press Enter...' }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      const trimmed = input.trim()
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div
      className="flex flex-wrap gap-1 rounded-md border border-input p-2 cursor-text min-h-[2.5rem]"
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag, i) => (
        <Badge key={`${tag}-${i}`} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(i)
            }}
            className="rounded-full hover:bg-muted-foreground/20"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-20 bg-transparent outline-none text-sm"
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  )
}
