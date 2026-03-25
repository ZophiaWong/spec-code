import { useState } from 'react'
import { useRunStore } from '../stores/run-store'

export function VerifyResults() {
  const results = useRunStore((s) => s.verifyResults)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  if (results.length === 0) {
    return <div className="text-[12px] text-text-muted italic mt-2">No verify results yet</div>
  }

  const passed = results.filter((result) => result.passed).length

  return (
    <div className="mt-2">
      <div className="text-[11px] text-text-secondary mb-2">{passed}/{results.length} passed</div>
      <div className="flex flex-col gap-1">
        {results.map((result, index) => {
          const isOpen = !!expanded[index]
          return (
            <div key={`${result.command}-${index}`} className="bg-titlebar border border-border rounded">
              <button
                type="button"
                onClick={() => setExpanded((prev) => ({ ...prev, [index]: !isOpen }))}
                className="w-full flex items-center justify-between px-2 py-1 text-left bg-transparent border-none cursor-pointer"
              >
                <span className="text-[11px] text-text-primary truncate">{result.command}</span>
                <span className={result.passed ? 'text-accent-green text-[11px]' : 'text-accent-red text-[11px]'}>
                  {result.passed ? 'PASS' : 'FAIL'}
                </span>
              </button>
              <div className="px-2 pb-1 text-[10px] text-text-muted">
                {(result.durationMs / 1000).toFixed(2)}s
              </div>
              {isOpen && (
                <pre className="mx-2 mb-2 p-2 bg-editor border border-border rounded text-[11px] text-text-secondary overflow-auto max-h-40 whitespace-pre-wrap">
                  {result.output || '(no output)'}
                </pre>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
