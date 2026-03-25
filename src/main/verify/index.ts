import { spawn } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import type { BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc'
import type { VerifyConfig, VerifyResult } from '../../shared/types'

interface RawConfig {
  verify?: {
    commands?: unknown
    timeoutSeconds?: unknown
  }
}

export function getVerifyConfig(repoPath: string): VerifyConfig {
  const configPath = join(repoPath, '.spec-code', 'config.json')
  if (!existsSync(configPath)) {
    return { commands: [], timeoutSeconds: 120 }
  }

  let parsed: RawConfig = {}
  try {
    const content = readFileSync(configPath, 'utf8')
    parsed = JSON.parse(content) as RawConfig
  } catch {
    return { commands: [], timeoutSeconds: 120 }
  }

  const rawCommands = parsed.verify?.commands
  const commands = Array.isArray(rawCommands)
    ? rawCommands.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []

  const rawTimeout = parsed.verify?.timeoutSeconds
  const timeoutSeconds = typeof rawTimeout === 'number' && Number.isFinite(rawTimeout) && rawTimeout > 0
    ? rawTimeout
    : 120

  return { commands, timeoutSeconds }
}

export async function runVerify(
  repoPath: string,
  win: BrowserWindow,
  onResult?: (result: VerifyResult) => void
): Promise<{ started: boolean } | { error: string }> {
  const config = getVerifyConfig(repoPath)
  if (config.commands.length === 0) {
    return { error: 'No verify commands configured in .spec-code/config.json (verify.commands).' }
  }

  for (const command of config.commands) {
    const result = await runSingleCommand(repoPath, command, config.timeoutSeconds)
    if (!win.isDestroyed()) {
      win.webContents.send(IPC_CHANNELS.VERIFY_RESULT, result)
    }
    onResult?.(result)
  }

  return { started: true }
}

function runSingleCommand(repoPath: string, command: string, timeoutSeconds: number): Promise<VerifyResult> {
  return new Promise((resolve) => {
    const start = Date.now()
    const child = spawn(command, {
      cwd: repoPath,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let output = ''
    let timedOut = false

    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      output += chunk.toString()
    })

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutSeconds * 1000)

    child.on('close', (code) => {
      clearTimeout(timer)
      const durationMs = Date.now() - start
      resolve({
        command,
        passed: !timedOut && code === 0,
        durationMs,
        output: timedOut ? `${output}\nTimed out after ${timeoutSeconds}s` : output,
        timedOut
      })
    })
  })
}
