import type { RunMode } from '../../shared/types'

export const PLAN_TOOLS = new Set([
  'read_file',
  'search',
  'list_files'
])

export const APPLY_TOOLS = 'all'

export function isToolAllowed(mode: RunMode, toolName: string): boolean {
  if (mode === 'apply') {
    return true
  }
  return PLAN_TOOLS.has(toolName)
}
