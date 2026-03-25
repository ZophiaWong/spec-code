import simpleGit from 'simple-git'
import type { ChangedFile, ChangedFileStatus } from '../../shared/types'

export async function getChangedFiles(repoPath: string, checkpointTag: string): Promise<ChangedFile[]> {
  const git = simpleGit(repoPath)
  const summary = await git.diffSummary([checkpointTag, '--'])

  return summary.files.map((file) => ({
    path: file.file,
    status: toStatus(file)
  }))
}

export async function getFileDiff(
  repoPath: string,
  checkpointTag: string,
  filePath: string
): Promise<string> {
  const git = simpleGit(repoPath)
  return git.diff(['--no-color', checkpointTag, '--', filePath])
}

function toStatus(file: { insertions: number; deletions: number; changed: number }): ChangedFileStatus {
  if (file.insertions > 0 && file.deletions === 0 && file.changed === file.insertions) {
    return 'added'
  }
  if (file.deletions > 0 && file.insertions === 0 && file.changed === file.deletions) {
    return 'deleted'
  }
  return 'modified'
}
