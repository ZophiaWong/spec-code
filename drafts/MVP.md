## 5 个核心能力

1. Repo 工作区管理
2. Session / Plan / Apply
3. Spec 面板
4. 任务执行与日志面板
5. Diff / Verify / Rewind

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
