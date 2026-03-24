const RISKY_PATTERNS = [
  /rm\s+-rf/i,
  /git\s+push(?:\s+\S+)*\s+--force(?:-with-lease)?/i,
  /git\s+reset\s+--hard/i,
  /drop\s+table/i
]

export function isRiskyCommand(command: string): boolean {
  return RISKY_PATTERNS.some((pattern) => pattern.test(command))
}
