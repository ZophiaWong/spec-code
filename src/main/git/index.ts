import { dialog, BrowserWindow } from 'electron'
import simpleGit from 'simple-git'
import { basename } from 'path'
import type { RepoInfo } from '../../shared/types'

export async function openRepoDialog(
  win: BrowserWindow
): Promise<RepoInfo | { error: string }> {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'],
    title: 'Open Git Repository'
  })

  if (result.canceled || result.filePaths.length === 0) {
    return { error: 'cancelled' }
  }

  return getRepoInfo(result.filePaths[0])
}

export async function getRepoInfo(
  repoPath: string
): Promise<RepoInfo | { error: string }> {
  try {
    const git = simpleGit(repoPath)
    const isRepo = await git.checkIsRepo()

    if (!isRepo) {
      return { error: 'Selected folder is not a git repository' }
    }

    const [branchSummary, log] = await Promise.all([
      git.branch(),
      git.log({ maxCount: 1 })
    ])

    const latestCommit = log.latest

    return {
      path: repoPath,
      name: basename(repoPath),
      currentBranch: branchSummary.current,
      lastCommit: {
        hash: latestCommit?.hash ?? '',
        message: latestCommit?.message ?? ''
      }
    }
  } catch {
    return { error: 'Failed to read git repository' }
  }
}
