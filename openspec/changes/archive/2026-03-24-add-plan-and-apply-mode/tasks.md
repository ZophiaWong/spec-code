## 1. Types & Data Layer

- [x] 1.1 Add `mode` (`'plan' | 'apply'`) and `sourcePlanRunId` (nullable string) fields to the `Run` type in `src/shared/types.ts`
- [x] 1.2 Add `PlanStep` type (`{ title, description, affectedFiles }`) and `PlanOutput` type to `src/shared/types.ts`
- [x] 1.3 Add `'plan_output' | 'approval_request'` to `RunEventType` union in `src/shared/types.ts`
- [x] 1.4 Add `mode` and `source_plan_run_id` columns to the `runs` table in `src/main/db/runs.ts`; update `createRun` to accept `mode` and `sourcePlanRunId` params
- [x] 1.5 Update `createRun`, `hasActiveRun`, and query functions in `src/main/db/runs.ts` to read/write the new columns

## 2. IPC Contracts

- [x] 2.1 Add `RUN_APPROVE` and `RUN_CONFIRM_RISKY` channel constants to `IPC_CHANNELS` in `src/shared/ipc.ts`
- [x] 2.2 Add `approveRun(planRunId: string): Promise<Run | { error: string }>` and `confirmRisky(runId: string, approved: boolean): Promise<void>` to `IpcApi`
- [x] 2.3 Expose `RUN_APPROVE` and `RUN_CONFIRM_RISKY` handlers in preload (`src/preload/index.ts`)
- [x] 2.4 Register `run:approve` and `run:confirm-risky` IPC handlers in `src/main/ipc/index.ts`

## 3. Permission Matrix & High-Risk Detection

- [x] 3.1 Create `src/main/agent/permissions.ts` with tool permission matrix: define `PLAN_TOOLS` (read_file, search, list_files) and `APPLY_TOOLS` (all); export `isToolAllowed(mode, toolName)` function
- [x] 3.2 Create `src/main/agent/risky-patterns.ts` with high-risk command patterns list and `isRiskyCommand(command: string): boolean` function
- [x] 3.3 Integrate permission check into run engine: before each tool call, validate against mode permissions; emit error event if denied

## 4. Stub Agent Updates

- [x] 4.1 Update `src/main/agent/stub.ts` to accept a `mode` parameter and produce different event sequences: plan mode emits read-only tool calls + `plan_output`; apply mode emits write tool calls + one risky command
- [x] 4.2 Add plan-mode stub sequence: `read_file` call → result → `search` call → result → `plan_output` event with 3 sample steps
- [x] 4.3 Add apply-mode stub sequence: `write_file` call → result → `bash` risky command → `approval_request` → remaining events → completion

## 5. Run Engine Updates

- [x] 5.1 Update `startRun` in `src/main/agent/run-engine.ts` to pass `mode` to the stub agent and handle permission matrix enforcement
- [x] 5.2 Implement `approveRun` function: validate plan run is completed, create new apply run with `sourcePlanRunId`, start apply execution
- [x] 5.3 Implement approval request flow: when stub emits risky command, pause execution, emit `approval_request` event, wait for `confirmRisky` response via a pending promise
- [x] 5.4 Wire up `confirmRisky` handler: resolve or reject the pending approval promise based on user response

## 6. Renderer Store Updates

- [x] 6.1 Add `approveRun` and `confirmRisky` actions to `src/renderer/stores/run-store.ts`
- [x] 6.2 Handle new event types (`plan_output`, `approval_request`) in the run store's event handler
- [x] 6.3 Track pending approval requests in store state for UI rendering

## 7. UI Components

- [x] 7.1 Create `src/renderer/components/ModeBadge.tsx` — displays "Plan" or "Apply" badge with distinct colors
- [x] 7.2 Create `src/renderer/components/PlanCard.tsx` — renders structured plan steps with numbered list, titles, descriptions, affected files, and "Approve & Apply" button
- [x] 7.3 Create `src/renderer/components/ApprovalPrompt.tsx` — renders high-risk command confirmation with command details, "Confirm" and "Reject" buttons
- [x] 7.4 Update `RunEventItem.tsx` to handle `plan_output` events (render PlanCard) and `approval_request` events (render ApprovalPrompt)
- [x] 7.5 Update `ChatRunView.tsx` to show ModeBadge in header area based on current/latest run mode
- [x] 7.6 Update `RunStatusIndicator.tsx` to include mode information alongside status

## 8. Integration & Verification

- [ ] 8.1 End-to-end test: submit prompt → plan-mode run → plan output rendered → approve → apply run → events rendered with risky command prompt
- [ ] 8.2 Verify mode badge switches between Plan/Apply correctly
- [ ] 8.3 Verify approval prompt blocks apply run until user responds
- [ ] 8.4 Verify app restart preserves run mode and plan output in session history
