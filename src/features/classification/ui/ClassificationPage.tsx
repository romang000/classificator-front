import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/ui/Header/Header'
import {
  getBreedByModel,
  getBreedsByPropertyValue,
  getProperties,
  getPropertyValues,
} from '../../knowledge-base/api/knowledgeApi'
import type { Id, Property, PropertyValue, BreedGetByPropertyValueResponse, CatFeatures, RankRequest, RankResponse } from '../../../entities/breed/model/types'

export default function ClassificationPage() {
  const navigate = useNavigate()

  const [properties, setProperties] = useState<Property[]>([])
  const [propertyValuesAll, setPropertyValuesAll] = useState<PropertyValue[]>([])

  const [selectedPropertyId, setSelectedPropertyId] = useState<Id | null>(null)
  const [selectedValueByProperty, setSelectedValueByProperty] = useState<Record<Id, Id>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BreedGetByPropertyValueResponse | undefined>(undefined)
  const [modelResult, setModelResult] = useState<RankResponse | undefined>(undefined)

  const multipleResults = Array.isArray(result?.breeds) && result.breeds.length > 1

  useEffect(() => {
    async function run() {
      const [props, values] = await Promise.all([getProperties(), getPropertyValues()])
      setProperties(props)
      setPropertyValuesAll(values)
      if (props.length) setSelectedPropertyId(props[0].id)
    }
    run().catch((e) => setError(String(e)))
  }, [])

  const valuesForSelectedProperty = useMemo(() => {
    if (selectedPropertyId === null) return []
    return propertyValuesAll.filter((v) => v.propertyId === selectedPropertyId)
  }, [propertyValuesAll, selectedPropertyId])

  const selectedValueId = selectedPropertyId !== null ? selectedValueByProperty[selectedPropertyId] : undefined

  function toggleValue(valueId: Id) {
    if (selectedPropertyId === null) return
    setSelectedValueByProperty((prev) => {
      const current = prev[selectedPropertyId]
      if (current === valueId) {
        const next = { ...prev }
        delete next[selectedPropertyId]
        return next
      }
      return { ...prev, [selectedPropertyId]: valueId }
    })
  }

  const summaryLines = useMemo(() => {
    const lines: string[] = []
    for (const [propIdStr, valueId] of Object.entries(selectedValueByProperty)) {
      const propId = Number(propIdStr)
      const p = properties.find((x) => x.id === propId)
      const v = propertyValuesAll.find((x) => x.id === valueId)
      if (!p || !v) continue
      lines.push(`${p.name}: ${v.value}`)
    }
    return lines
  }, [propertyValuesAll, properties, selectedValueByProperty])

  async function submitClassification() {
    setLoading(true)
    setError(null)
    setResult(undefined)
    try {
      const payload = Object.entries(selectedValueByProperty).map(([propertyIdStr, valueId]) => ({
        propertyId: Number(propertyIdStr) as Id,
        valueId: valueId as Id,
      }))
      const data = await getBreedsByPropertyValue(payload)
      setResult(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function refineWithModel() {
    console.log('Уточнение через модель', result)

    if (!result || !Array.isArray(result?.breeds) || result.breeds.length === 0) {
      console.error('Нет результатов для уточнения', result)
      setError('Нет пород для уточнения')
      return
    }

    const candidateBreeds: string[] = result?.breeds.map((breed: any) => breed.name)

    const features: CatFeatures = {
      woolLength: result?.woolLength || null,
      woolColor: result?.woolColor || null,
      woolType: result?.woolType || null,
      earType: result?.earType || null,
      eyeColor: result?.eyeColor || null,
      eyeShape: result?.eyeShape || null,
      physique: result?.physique || null,
      tail: result?.tail || null,
      paws: result?.paws || null,
    }

    const payload: RankRequest = {
      features: features,
      candidateBreeds: candidateBreeds
    }

    setLoading(true)
    setError(null)

    getBreedByModel(payload)
      .then(response => {
        console.log('Результат уточнения:', response)
        // Отображаем результат уточнения
        setModelResult({
          selectedBreed: response.selectedBreed,
          confidence: response.confidence
        })
      })
      .catch(err => {
        console.error('Ошибка при уточнении:', err)
        setError(`Ошибка при уточнении: ${String(err)}`)
      })
      .finally(() => {
        setLoading(false)
      })

  }

  return (
    <>
      <Header title='Классификация' />
      <div className="appFrame">
        <div className="topBar">
          <div className="topBarTitle">Выбор исходных значений</div>
        </div>

        <div className="contentBox">
          <div className="threeCols">
            <div className="innerPanel">
              <div className="innerPanelTitle">Свойства</div>
              {properties.map((p) => {
                const on = p.id === selectedPropertyId
                return (
                  <div
                    key={p.id}
                    className="optionLine"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPropertyId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedPropertyId(p.id)
                    }}
                    style={{
                      background: on ? 'rgba(242, 197, 140, 0.18)' : undefined,
                      borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                    }}
                  >
                    <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                    <div className="optionText">{p.name}</div>
                  </div>
                )
              })}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Возможные значения</div>
              {selectedPropertyId === null ? (
                <div className="loadingText">Выберите свойство</div>
              ) : valuesForSelectedProperty.length === 0 ? (
                <div className="loadingText">Нет значений</div>
              ) : (
                valuesForSelectedProperty.map((v) => {
                  const on = v.id === selectedValueId
                  return (
                    <div
                      key={v.id}
                      className="optionLine"
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleValue(v.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') toggleValue(v.id)
                      }}
                      style={{
                        background: on ? 'rgba(242, 197, 140, 0.22)' : undefined,
                        borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                      }}
                    >
                      <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                      <div className="optionText">{v.value}</div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Итого</div>
              <div className="summaryBox">
                {summaryLines.length ? (
                  summaryLines.map((l, idx) => (
                    <div className="summaryLine" key={`${l}-${idx}`}>
                      {l}
                    </div>
                  ))
                ) : (
                  <div className="loadingText" style={{ padding: 0 }}>
                    Пока ничего не выбрано
                  </div>
                )}
              </div>

              {result?.breeds !== null && (
                <div style={{ marginTop: 12 }}>
                  <div className="innerPanelTitle" style={{ marginBottom: 8 }}>
                    Результат
                  </div>
                  {Array.isArray(result?.breeds) ? (
                    result.breeds.map((breed: any) => (
                      <div key={breed.id} className="summaryLine">
                        {breed.name}
                      </div>
                    ))
                  ) : (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
                      {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && <div className="alertBox" style={{ marginTop: 12 }}>{error}</div>}

          <div className="formRow" style={{ gridTemplateColumns: '1fr 240px' }}>
            <button className="smallActionBtn" type="button" onClick={() => navigate('/view')}>
              Посмотреть базу знаний
            </button>
            <button
              className="primaryBtn"
              type="button"
              disabled={loading}
              onClick={submitClassification}
            >
              {loading ? 'Определяем...' : 'Определить породу кошки'}
            </button>

            {multipleResults && (
              <button
                className="primaryBtn"
                type="button"
                onClick={refineWithModel}
              >
                Уточнить у модели
              </button>
            )}

          </div>

          {modelResult && (
            <div style={{ marginTop: 12 }}>
              <div className="innerPanelTitle" style={{ marginBottom: 8 }}>
                Результат уточнения модели
              </div>
              <div className="summaryLine">
                Порода: {modelResult.selectedBreed}
              </div>
              <div className="summaryLine">
                Уверенность: {(modelResult.confidence * 100).toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

