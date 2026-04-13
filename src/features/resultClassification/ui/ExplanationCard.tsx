type ExplanationCardProps = {
  text: string
}

export function ExplanationCard({ text }: ExplanationCardProps) {
  return (
    <div className="innerPanel">
      <div className="innerPanelTitle">Информация об анализе</div>
      <p style={{ fontSize: 15, margin: 0, color: "#2a2a2a", whiteSpace: "pre-line", lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  )
}