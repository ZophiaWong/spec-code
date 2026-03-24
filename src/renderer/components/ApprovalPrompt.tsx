interface ApprovalPromptProps {
  command: string
  reason?: string
  onConfirm: () => void
  onReject: () => void
}

export function ApprovalPrompt({ command, reason, onConfirm, onReject }: ApprovalPromptProps) {
  return (
    <div className="mx-3 my-2 p-3 rounded border border-accent-red/60 bg-[#321f1f]">
      <div className="text-[12px] font-semibold text-red-300 mb-2">High-Risk Command Approval</div>
      <div className="text-[12px] text-text-primary font-mono break-all bg-[#1e1e1e] rounded p-2">
        {command}
      </div>
      {reason && <div className="mt-2 text-[12px] text-text-secondary">{reason}</div>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="px-3 py-1.5 text-[12px] text-white bg-accent-btn border-none rounded-[3px] cursor-pointer"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={onReject}
          className="px-3 py-1.5 text-[12px] text-white bg-[#5a1d1d] border border-[#be1100] rounded-[3px] cursor-pointer"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
