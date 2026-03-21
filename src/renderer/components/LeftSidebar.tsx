export function LeftSidebar() {
  return (
    <div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none">
          <span className="text-[9px]">&#9654;</span> Specs
        </div>
        <div className="text-[13px] text-text-secondary py-[3px] pl-4">No specs loaded</div>
      </div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none">
          <span className="text-[9px]">&#9654;</span> Changes
        </div>
        <div className="text-[13px] text-text-secondary py-[3px] pl-4">No active changes</div>
      </div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none">
          <span className="text-[9px]">&#9654;</span> Sessions
        </div>
        <div className="text-[13px] text-text-secondary py-[3px] pl-4">No sessions</div>
      </div>
    </div>
  )
}
