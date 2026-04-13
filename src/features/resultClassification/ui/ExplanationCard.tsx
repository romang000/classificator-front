import { ResultPanel } from "./ResultPanel"

type ExplanationCardProps = {
  text: string
}

export function ExplanationCard({ text }: ExplanationCardProps) {
  return (
    <ResultPanel title="Объяснение">
      <p style={{ fontSize: 16, margin: 0, color: "#2a2a2a", whiteSpace: "pre-line" }}>
        {text}
      </p>
    </ResultPanel>
  )
}