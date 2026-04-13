import { useNavigate } from "react-router-dom"
import { Header } from "../../../shared/ui/Header/Header"
import { ResultCard } from "./ResultCard"
import { ExplanationCard } from "./ExplanationCard"

export function ResultPage() {
  const navigate = useNavigate()

  const result = "Абиссинская"
  const explanation =
    'Порода "Мейн-кун" опровергнута, так как параметр "тип шерсти" не соответствует описанию породы'

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      <Header title="Вывод результата и объяснения" />
      <div className="appFrame">
        <div className="topBar">
          <div className="topBarTitle">Результат классификации</div>
        </div>

        <div className="contentBox">
          <div style={{ marginBottom: 30 }}>
            <ResultCard breedName={result} />
          </div>

          <div style={{ marginBottom: 30 }}>
            <ExplanationCard text={explanation} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button className="primaryBtn" type="button" onClick={handleBack}>
              Назад к классификации
            </button>
          </div>
        </div>
      </div>
    </>
  )
}