import { promises as fs } from 'fs'
import { join } from 'path'
import type { SpecSummary } from '../../shared/types'

export async function listSpecs(repoPath: string): Promise<SpecSummary[]> {
  const specsDir = join(repoPath, 'openspec', 'specs')

  let entries: import('fs').Dirent[]
  try {
    entries = await fs.readdir(specsDir, { withFileTypes: true })
  } catch (error) {
    if (isMissingPathError(error)) return []
    throw error
  }

  const specs = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const specFilePath = join(specsDir, entry.name, 'spec.md')
        let markdown = ''
        try {
          markdown = await fs.readFile(specFilePath, 'utf8')
        } catch (error) {
          if (!isMissingPathError(error)) throw error
        }

        return {
          name: entry.name,
          purpose: extractPurpose(markdown)
        }
      })
  )

  return specs.sort((a, b) => a.name.localeCompare(b.name))
}

export async function readSpec(repoPath: string, name: string): Promise<string> {
  const specFilePath = join(repoPath, 'openspec', 'specs', name, 'spec.md')
  try {
    return await fs.readFile(specFilePath, 'utf8')
  } catch (error) {
    if (isMissingPathError(error)) {
      throw new Error('Spec file not found')
    }
    throw error
  }
}

function extractPurpose(markdown: string): string {
  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    return line
  }
  return 'No purpose provided'
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}
