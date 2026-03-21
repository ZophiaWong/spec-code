export interface RepoInfo {
  path: string
  name: string
  currentBranch: string
  lastCommit: {
    hash: string
    message: string
  }
}

export interface RecentProject {
  id: number
  path: string
  name: string
  openedAt: string
}
