import { ResultPanel } from "./ResultPanel"

type ResultCardProps = {
  breedName: string
}

export function ResultCard({ breedName }: ResultCardProps) {
  return (
    <ResultPanel title="Результат">
      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#2a2a2a" }}>
        {breedName}
      </p>
    </ResultPanel>
  )
}