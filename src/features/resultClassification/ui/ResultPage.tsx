import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Header } from "../../../shared/ui/Header/Header"
import { ExplanationCard } from "./ExplanationCard"
import { getBreedByModel } from "../../knowledge-base/api/knowledgeApi"
import type {
  BreedGetByPropertyValueResponse,
  BreedGetByPropertyValueRejectResponse,
  CatFeatures,
  RankRequest,
  RankResponse
} from "../../../entities/breed/model/types"

export function ResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { result: BreedGetByPropertyValueResponse } | null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modelResult, setModelResult] = useState<RankResponse | undefined>(undefined)

  const result = state?.result
  const breedNames = result?.breeds?.map((b) => b.name) || []
  const rejectedBreeds = result?.rejectedBreeds || []
  const multipleResults = breedNames.length > 1

  function refineWithModel() {
    if (!result || !Array.isArray(result.breeds) || result.breeds.length === 0) {
      setError("Нет пород для уточнения")
      return
    }

    const candidateBreeds: string[] = result.breeds.map((breed) => breed.name)

    const features: CatFeatures = {
      woolLength: result.woolLength || null,
      woolColor: result.woolColor || null,
      woolType: result.woolType || null,
      earType: result.earType || null,
      eyeColor: result.eyeColor || null,
      eyeShape: result.eyeShape || null,
      physique: result.physique || null,
      tail: result.tail || null,
      paws: result.paws || null,
    }

    const payload: RankRequest = {
      features,
      candidateBreeds,
    }

    setLoading(true)
    setError(null)

    getBreedByModel(payload)
      .then((response) => {
        console.log("Результат уточнения:", response)
        setModelResult({
          selectedBreed: response.selectedBreed,
          confidence: response.confidence,
        })
      })
      .catch((err) => {
        console.error("Ошибка при уточнении:", err)
        setError(`Ошибка при уточнении: ${String(err)}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <>
      <Header title="Результат классификации" />
      <div className="appFrame">
        <div className="topBar">
          <div className="topBarTitle">Результаты определения</div>
        </div>

        <div className="contentBox">
          {/* Подходящие породы */}
          <div style={{ marginBottom: 20 }}>
            <div className="innerPanel">
              <div className="innerPanelTitle">Определенные породы</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {breedNames.length > 0 ? (
                  breedNames.map((name, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "16px 20px",
                        background: "#f9f9f9",
                        border: "1px solid #e0e0e0",
                        borderRadius: 12,
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#2a2a2a",
                      }}
                    >
                      {name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "16px 20px", color: "#999", fontSize: 16 }}>
                    Порода не определена
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Отклоненные породы */}
          {rejectedBreeds.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div className="innerPanel">
                <div className="innerPanelTitle">Отклоненные породы</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {rejectedBreeds.map((item, idx) => (
                    <RejectedBreedCard key={idx} item={item} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Результат модели */}
          {modelResult && (
            <div style={{ marginBottom: 20 }}>
              <div
                className="innerPanel"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(100, 150, 200, 0.08) 0%, rgba(100, 150, 200, 0.04) 100%)",
                  borderColor: "rgba(100, 150, 200, 0.3)",
                }}
              >
                <div
                  className="innerPanelTitle"
                  style={{ color: "#6496c8", fontSize: 20, marginBottom: 12 }}
                >
                  Уточнение нейросети
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#2a2a2a",
                    marginBottom: 12,
                  }}
                >
                  {modelResult.selectedBreed}
                </div>

                {/* <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 14, color: "#6e6a75", fontWeight: 500 }}>
                    Уверенность:
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#6496c8" }}>
                    {(modelResult.confidence * 100).toFixed(1)}%
                  </div>
                  <div
                    style={{
                      width: 120,
                      height: 6,
                      background: "#e0e0e0",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${modelResult.confidence * 100}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #6496c8, #82aade)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div> */}
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: 12,
                background: "#ffebee",
                border: "1px solid #ffcdd2",
                borderRadius: 10,
                color: "#c62828",
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          {/* Кнопки */}
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 28,
              flexWrap: "wrap",
            }}
          >
            {multipleResults && !modelResult && (
              <button
                className="primaryBtn"
                type="button"
                disabled={loading}
                onClick={refineWithModel}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Уточняем..." : "Уточнить у модели"}
              </button>
            )}

            <button
              className="primaryBtn"
              type="button"
              onClick={handleBack}
              style={{
                background: "#f5f5f5",
                color: "#2a2a2a",
                border: "1px solid #ddd",
              }}
            >
              Назад к классификации
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

type RejectedBreedCardProps = {
  item: BreedGetByPropertyValueRejectResponse
}

function RejectedBreedCard({ item }: RejectedBreedCardProps) {
  const reason = item.rejectReason

  return (
    <div
      style={{
        padding: "16px 20px",
        background: "#fff8f8",
        border: "1px solid #f0d6d6",
        borderRadius: 12,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#2a2a2a",
          marginBottom: 12,
        }}
      >
        {item.breed.name}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
        <div>
          <span style={{ fontWeight: 600, color: "#6e6a75" }}>Свойство: </span>
          <span style={{ color: "#2a2a2a" }}>{reason.propertyName || "—"}</span>
        </div>

        <div>
          <span style={{ fontWeight: 600, color: "#6e6a75" }}>Фактическое значение: </span>
          <span style={{ color: "#2a2a2a" }}>{reason.actualValue || "—"}</span>
        </div>

        <div>
          <span style={{ fontWeight: 600, color: "#6e6a75" }}>Ожидалось: </span>
          <span style={{ color: "#2a2a2a" }}>{reason.expectedValue || "—"}</span>
        </div>

        <div>
          <span style={{ fontWeight: 600, color: "#6e6a75" }}>Причина: </span>
          <span style={{ color: "#c62828", fontWeight: 600 }}>
            {reason.reason || "—"}
          </span>
        </div>
      </div>
    </div>
  )
}