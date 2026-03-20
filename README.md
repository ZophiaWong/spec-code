# Spec Code

Spec-driven desktop coding agent.

Spec Code 是一个 Electron 桌面应用，用于把 spec 驱动的开发流程接到本地代码仓库中，支持 session、plan/apply、diff、verify 和 rewind。

## MVP 核心流程

1. 打开本地 repo
2. 创建 spec/change
3. 让 agent 在 plan mode 生成执行计划
4. 用户批准
5. agent 进入 apply mode 改代码
6. 用户看到 diff
7. 运行 verify
8. 失败就 rewind，成功就结束 session

## 技术架构

### 桌面层

Electron + React + TypeScript

- Electron 负责 shell、文件系统权限、原生菜单、窗口管理
- React 负责 UI
- 状态管理用 Zustand 或 Redux Toolkit
- UI 组件用 shadcn/ui 或 Mantine 都可以

### 本地 runtime 层

独立 Node service：

- agent runtime
- session service
- spec service
- git service
- verify service
- checkpoint service

放在 Electron 主进程旁边，或者单独跑成本地进程。

### 数据层

- SQLite

- 文件系统中的 .spec-code/

- repo 内的 openspec/ 或兼容目录

### 模型层

- Anthropic Agent SDK / Claude runtime
- 工具访问：文件、bash、git、search、verify

## Coming soon

- [ ] 长期复杂 memory 检索系统

- [ ] 真正并发的 sub-agent orchestration

- [ ] 内置 Monaco 大编辑器深度编辑体验

- [ ] 浏览器自动化 e2e

- [ ] 多模型切换

- [ ] 云端账户系统

- [ ] 团队协作与共享 session

## Acknowledge
