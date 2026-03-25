import { useSessionStore } from '../stores/session-store'
import { useRepoStore } from '../stores/repo-store'
import { useSpecStore } from '../stores/spec-store'

export function SessionList() {
  const repo = useRepoStore((s) => s.repo)
  const { sessions, activeSessionId, setActiveSession, createSession, deleteSession } = useSessionStore()
  const setSessionView = useSpecStore((s) => s.setSessionView)

  const handleNewSession = async () => {
    if (!repo) return
    const session = await createSession(repo.path)
    setSessionView(session.id)
  }

  const handleFork = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    const session = await useSessionStore.getState().forkSession(sessionId)
    setSessionView(session.id)
  }

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    const confirmed = window.confirm('Delete this session? This also removes associated checkpoints.')
    if (!confirmed) return
    await deleteSession(sessionId)
    if (activeSessionId === sessionId) {
      setSessionView(null)
    }
  }

  return (
    <div>
      <button
        onClick={handleNewSession}
        className="w-full px-3 py-1.5 mb-2 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer hover:opacity-90"
      >
        + New Session
      </button>
      <div className="flex flex-col gap-0.5">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => {
              setActiveSession(session.id)
              setSessionView(session.id)
            }}
            className={`flex items-center justify-between px-3 py-1.5 rounded-[3px] cursor-pointer text-[13px] ${
              activeSessionId === session.id
                ? 'bg-[#37373d] text-white'
                : 'text-text-secondary hover:bg-[#2a2d2e]'
            }`}
          >
            <span className="truncate">{session.title}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleFork(e, session.id)}
                className="text-[10px] text-text-muted hover:text-white bg-transparent border-none cursor-pointer px-1"
                title="Fork session"
              >
                &#9095;
              </button>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="text-[10px] text-text-muted hover:text-accent-red bg-transparent border-none cursor-pointer px-1"
                title="Delete session"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
