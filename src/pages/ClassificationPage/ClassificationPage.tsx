import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getBreedsByPropertyValue,
  getProperties,
  getPropertyValues,
} from '../../api/knowledgeApi'
import type { Id, Property, PropertyValue } from '../../api/models'

export default function ClassificationPage() {
  const navigate = useNavigate()

  const [properties, setProperties] = useState<Property[]>([])
  const [propertyValuesAll, setPropertyValuesAll] = useState<PropertyValue[]>([])

  const [selectedPropertyId, setSelectedPropertyId] = useState<Id | null>(null)
  const [selectedValueByProperty, setSelectedValueByProperty] = useState<Record<Id, Id>>({})

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<unknown>(null)

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
    setResult(null)
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

  return (
    <div className="appFrame">
      <div className="topBar">
        <div className="topBarTitle">Выбор исходных значений</div>
        <button className="topBarExit" type="button" onClick={() => navigate('/editor')}>
          Перейти в редактор базы знаний
        </button>
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

            {result !== null && (
              <div style={{ marginTop: 12 }}>
                <div className="innerPanelTitle" style={{ marginBottom: 8 }}>
                  Результат
                </div>
                {Array.isArray(result) ? (
                  result.map((breed: any) => (
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
        </div>
      </div>
    </div>
  )
}

