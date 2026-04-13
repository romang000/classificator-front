import type { ReactNode } from "react"

type ResultPanelProps = {
  title: string
  children: ReactNode
}

export function ResultPanel({
  title,
  children,
}: ResultPanelProps) {
  return (
    <div className="innerPanel">
      <div className="innerPanelTitle">{title}</div>
      <div>{children}</div>
    </div>
  )
}