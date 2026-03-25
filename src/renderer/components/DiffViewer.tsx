import { useEffect, useMemo, useState } from 'react'
import { Diff, Hunk, parseDiff } from 'react-diff-view'
import 'react-diff-view/style/index.css'
import { useDiffStore } from '../stores/diff-store'

const MAX_LINES = 10000

export function DiffViewer() {
  const { selectedFile, diffContent, loadDiffContent, selectFile, loading } = useDiffStore()
  const [showFullDiff, setShowFullDiff] = useState(false)

  useEffect(() => {
    if (!selectedFile) return
    void loadDiffContent()
    setShowFullDiff(false)
  }, [selectedFile, loadDiffContent])

  const { renderedDiff, isTruncated } = useMemo(() => {
    const lines = diffContent.split('\n')
    if (lines.length <= MAX_LINES || showFullDiff) {
      return { renderedDiff: diffContent, isTruncated: false }
    }
    return {
      renderedDiff: lines.slice(0, MAX_LINES).join('\n'),
      isTruncated: true
    }
  }, [diffContent, showFullDiff])

  const files = useMemo(() => parseDiff(renderedDiff || ''), [renderedDiff])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => selectFile(null)}
          className="px-2 py-1 text-[12px] text-text-secondary bg-transparent border border-border rounded-[3px] cursor-pointer hover:text-white"
        >
          Back
        </button>
        <div className="text-[12px] text-text-secondary truncate pl-3">{selectedFile}</div>
      </div>

      {loading && <div className="text-[12px] text-text-secondary">Loading diff...</div>}
      {!loading && isTruncated && (
        <div className="mb-2 px-2 py-1 bg-titlebar border border-border rounded text-[12px] text-text-secondary">
          Showing first {MAX_LINES.toLocaleString()} lines.
          <button
            type="button"
            onClick={() => setShowFullDiff(true)}
            className="ml-2 text-accent-link bg-transparent border-none cursor-pointer"
          >
            Show full diff
          </button>
        </div>
      )}
      {!loading && files.length === 0 && (
        <pre className="text-[12px] text-text-muted whitespace-pre-wrap">{diffContent || 'No diff available'}</pre>
      )}
      <div className="flex-1 overflow-auto">
        {files.map((file) => (
          <Diff key={file.oldPath + file.newPath} viewType="split" diffType={file.type} hunks={file.hunks}>
            {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
          </Diff>
        ))}
      </div>
    </div>
  )
}
