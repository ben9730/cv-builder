'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportModal } from '@/components/import/import-modal'

export function ImportButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Import resume"
      >
        <Upload className="size-4 mr-2" />
        Import
      </Button>
      <ImportModal open={open} onOpenChange={setOpen} />
    </>
  )
}
