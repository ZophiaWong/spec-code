## 5 个核心能力

1. Repo 工作区管理
2. Session / Plan / Apply
3. Spec 面板
4. 任务执行与日志面板
5. Diff / Verify / Rewind

## Dev Phases

### Phase 1：桌面壳子 + repo 打开

目标：像一个真正 app。

做什么：

Electron 初始化

React UI

打开本地 repo

最近项目列表

git repo 检测

左中右三栏布局

SQLite 初始化

完成标志：

能打开 repo

能显示 repo 基本信息

能保存最近打开历史

### Phase 2：session + chat/run 基础能力

目标：让它不只是静态壳子。

做什么：

session 列表

新建/继续/fork

run 记录

agent 消息流

工具调用日志

完成标志：

能发起一个任务

能看到 agent 运行过程

关闭 app 再打开能恢复 session

### Phase3: plan/apply 模式

目标：做出你的第一个差异化能力。

做什么：

当前 mode 显示

plan 结构化展示

apply 前确认

mode 权限矩阵

高风险命令拦截

完成标志：

plan mode 不写代码

apply mode 真的改 repo

用户能一键批准 plan

### Phase4: spec 面板

目标：真正和“spec-code”这个名字匹配。

做什么：

spec 列表页

spec 详情页

proposal/design/tasks 展示

新建 spec/change 骨架

从 spec 启动 plan/apply

完成标志：

app 中能看 spec

能基于 spec 启动任务

task 状态可见

### Phase 5：diff / verify / checkpoint

目标：闭环交付。

做什么：

changed files panel

diff viewer

verify 按钮

lint/test 结果展示

自动 checkpoint

rewind

完成标志：

用户可以看到成果

用户可以验证成果

用户可以回退
