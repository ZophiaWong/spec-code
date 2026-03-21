export function RightSidebar() {
  return (
    <div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none">
          <span className="text-[9px]">&#9654;</span> Task Log
        </div>
        <div className="text-[12px] text-text-muted italic py-2 pl-4">No tasks running</div>
      </div>
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.5px] text-[#bbbbbb] mb-2 flex items-center gap-1 cursor-pointer select-none">
          <span className="text-[9px]">&#9654;</span> Output
        </div>
        <div className="font-mono text-[12px] text-text-muted bg-editor p-2.5 rounded-[3px] min-h-[60px]">
          Ready.
        </div>
      </div>
    </div>
  )
}
