import { useRepoStore } from './stores/repo-store'
import { WelcomePage } from './pages/WelcomePage'
import { WorkspacePage } from './pages/WorkspacePage'

export function App() {
  const repo = useRepoStore((s) => s.repo)

  if (!repo) {
    return <WelcomePage />
  }

  return <WorkspacePage />
}
