import type { ResumeData } from '@/types/resume'
import { ClassicTemplate } from './classic-template'
import { ModernTemplate } from './modern-template'
import { MinimalTemplate } from './minimal-template'

export type TemplateId = 'classic' | 'modern' | 'minimal'

export interface TemplateDefinition {
  id: TemplateId
  name: string
  description: string
  component: React.FC<{ resume: ResumeData }>
  accentColor: string
}

export const TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Clean professional style',
    component: ClassicTemplate,
    accentColor: '#000000',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Bold two-column layout',
    component: ModernTemplate,
    accentColor: '#1A365D',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Elegant typography',
    component: MinimalTemplate,
    accentColor: '#1A202C',
  },
}

export const DEFAULT_TEMPLATE: TemplateId = 'classic'
