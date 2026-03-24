import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SpecDetailProps {
  repoPath: string
  specName: string
}

export function SpecDetail({ repoPath, specName }: SpecDetailProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      const result = await window.api.readSpec(repoPath, specName)
      if (cancelled) return
      if ('error' in result) {
        setError(result.error)
        setContent('')
      } else {
        setContent(result.content)
      }
      setLoading(false)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [repoPath, specName])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[22px] font-normal text-white mb-1">Spec: {specName}</h1>
        <div className="text-[12px] text-text-muted font-mono">openspec/specs/{specName}/spec.md</div>
      </div>

      {loading && <div className="text-[13px] text-text-secondary">Loading spec...</div>}
      {error && !loading && (
        <div className="px-3 py-2 bg-error-bg border border-error-border rounded text-[13px] text-error-text">
          {error}
        </div>
      )}
      {!loading && !error && !content.trim() && (
        <div className="text-[13px] text-text-secondary">Spec is empty.</div>
      )}
      {!loading && !error && content.trim() && (
        <div className="markdown-body bg-sidebar border border-border rounded p-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
