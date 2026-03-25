import simpleGit from 'simple-git'
import {
  createCheckpointRecord,
  getCheckpointById,
  listCheckpoints as listCheckpointRows,
  listCheckpointTagsBySession
} from '../db/checkpoints'
import { getSessionById } from '../db/sessions'
import type { Checkpoint } from '../../shared/types'

const CHECKPOINT_TAG_PREFIX = 'spec-code/checkpoint'

export function getCheckpointTagName(runId: string): string {
  return `${CHECKPOINT_TAG_PREFIX}/${runId}`
}

export async function createCheckpoint(repoPath: string, runId: string, sessionId: string): Promise<Checkpoint> {
  const git = simpleGit(repoPath)
  const tagName = getCheckpointTagName(runId)
  const stashCommit = (await git.raw(['stash', 'create', `spec-code checkpoint ${runId}`])).trim()
  const targetRef = stashCommit || 'HEAD'

  await git.tag(['-f', tagName, targetRef])

  return createCheckpointRecord({ runId, sessionId, tagName })
}

export async function rewindToCheckpoint(repoPath: string, tagName: string): Promise<void> {
  const git = simpleGit(repoPath)
  await git.raw(['read-tree', '--reset', '-u', tagName])
  await git.raw(['checkout-index', '-a', '-f'])
}

export async function rewindCheckpointById(
  checkpointId: string
): Promise<{ sessionId: string } | { error: string }> {
  const checkpoint = getCheckpointById(checkpointId)
  if (!checkpoint) {
    return { error: 'Checkpoint not found' }
  }

  const session = getSessionById(checkpoint.sessionId)
  if (!session) {
    return { error: 'Session not found for checkpoint' }
  }

  await rewindToCheckpoint(session.repoPath, checkpoint.tagName)
  return { sessionId: checkpoint.sessionId }
}

export async function cleanupCheckpoints(repoPath: string, sessionId: string): Promise<void> {
  const git = simpleGit(repoPath)
  const tags = listCheckpointTagsBySession(sessionId)

  for (const tag of tags) {
    try {
      await git.tag(['-d', tag])
    } catch {
      // Tags may have been manually removed.
    }
  }
}

export function listCheckpoints(sessionId: string): Checkpoint[] {
  return listCheckpointRows(sessionId)
}
