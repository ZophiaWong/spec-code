import { useState, useRef, useEffect, useCallback } from 'react'
import { useRunStore } from '../stores/run-store'
import { useSessionStore } from '../stores/session-store'
import { RunEventItem } from './RunEventItem'
import { RunStatusIndicator } from './RunStatusIndicator'
import { ModeBadge } from './ModeBadge'
import type { RunEvent, RunMode } from '../../shared/types'

export function ChatRunView() {
  const [prompt, setPrompt] = useState('')
  const [pastEvents, setPastEvents] = useState<Record<string, RunEvent[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const { runs, liveEvents, startRun, approveRun, confirmRisky, fetchRuns, loadRunEvents } = useRunStore()

  const activeRun = runs.find((r) => r.status === 'running')
  const isRunning = !!activeRun
  const latestRun = runs[runs.length - 1]
  const currentMode: RunMode | null = activeRun?.mode ?? latestRun?.mode ?? null

  useEffect(() => {
    if (activeSessionId) {
      fetchRuns(activeSessionId)
      setPastEvents({})
    }
  }, [activeSessionId, fetchRuns])

  useEffect(() => {
    const completedRuns = runs.filter((r) => r.status !== 'running')
    for (const run of completedRuns) {
      if (!pastEvents[run.id]) {
        loadRunEvents(run.id).then((events) => {
          setPastEvents((prev) => ({ ...prev, [run.id]: events }))
        })
      }
    }
  }, [runs, loadRunEvents, pastEvents])

  useEffect(() => {
    const cleanup = window.api.onRunEvent((event) => {
      if ((event as RunEvent & { type: string }).type === 'status_change') {
        const payload = JSON.parse(event.payload)
        useRunStore.getState().handleStatusChange(event.runId, payload.status)
        return
      }
      useRunStore.getState().appendEvent(event)
    })
    return cleanup
  }, [])

  const scrollToBottom = useCallback(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [liveEvents, pastEvents, scrollToBottom])

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const threshold = 50
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }

  const handleSubmit = async () => {
    if (!prompt.trim() || !activeSessionId || isRunning) return
    const text = prompt.trim()
    setPrompt('')
    await startRun(activeSessionId, text)
  }

  const handleApprovePlan = async (runId: string) => {
    if (isRunning) return
    await approveRun(runId)
  }

  const handleConfirmRisky = async (runId: string, approved: boolean) => {
    await confirmRisky(runId, approved)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="text-[12px] text-text-secondary">Run Timeline</div>
        {currentMode && <ModeBadge mode={currentMode} />}
      </div>
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {runs.map((run) => (
          <div key={run.id} className="mb-4">
            <div className="py-2 px-3 text-[13px] text-accent-blue font-medium border-b border-border mb-1">
              {run.prompt}
            </div>
            {run.status !== 'running' && pastEvents[run.id]?.map((event) => (
              <RunEventItem
                key={event.id}
                event={event}
                canApprovePlan={!isRunning && run.mode === 'plan' && run.status === 'completed'}
                onApprovePlan={handleApprovePlan}
                onConfirmRisky={handleConfirmRisky}
              />
            ))}
            {run.status === 'running' && liveEvents.map((event) => (
              <RunEventItem
                key={event.id}
                event={event}
                canApprovePlan={false}
                onApprovePlan={handleApprovePlan}
                onConfirmRisky={handleConfirmRisky}
              />
            ))}
            <RunStatusIndicator status={run.status} mode={run.mode} />
          </div>
        ))}
        {runs.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-muted text-[13px]">
            Start a conversation by typing a prompt below
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRunning ? 'Waiting for run to complete...' : 'Type a prompt...'}
            disabled={isRunning}
            rows={1}
            className="flex-1 bg-[#3c3c3c] text-text-primary text-[13px] border border-border rounded-[3px] px-3 py-2 resize-none outline-none focus:border-accent-blue disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isRunning}
            className="px-4 py-2 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer disabled:opacity-50 disabled:cursor-default"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
