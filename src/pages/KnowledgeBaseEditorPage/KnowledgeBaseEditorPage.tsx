import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  checkFillKnowledge,
  createBreed,
  createBreedPropertyValue,
  createBreedProperties,
  createProperty,
  createPropertyValue,
  deleteBreed,
  deleteBreedProperties,
  deleteBreedPropertyValue,
  deleteProperty,
  deletePropertyValue,
  getBreeds,
  getBreedPropertiesByBreedId,
  getProperties,
  getPropertyValues,
  getBreedPropertyValues
} from '../../api/knowledgeApi'
import type { BreedPropertyRequest, Id, Property, PropertyValue } from '../../api/models'
import type { Dispatch, SetStateAction } from 'react'
import { ApiError } from '../../api/client'

type EditorSection =
  | 'breeds'
  | 'properties'
  | 'propertyValues'
  | 'breedProperties'
  | 'breedPropertyValues'
  | 'checkFill'

function toggleSet(
  setter: Dispatch<SetStateAction<Set<Id>>>,
  valueId: Id,
) {
  setter((prev) => {
    const next = new Set(prev)
    if (next.has(valueId)) next.delete(valueId)
    else next.add(valueId)
    return next
  })
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Произошла ошибка'
}

export default function KnowledgeBaseEditorPage() {
  const navigate = useNavigate()

  const [section, setSection] = useState<EditorSection>('breeds')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [breeds, setBreeds] = useState<Array<{ id: Id; name: string }>>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyValuesAll, setPropertyValuesAll] = useState<PropertyValue[]>([])

  const [selectedBreedId, setSelectedBreedId] = useState<Id | null>(null)
  const [breedPropertiesSelected, setBreedPropertiesSelected] = useState<Set<Id>>(new Set())
  const [breedPropertiesSaved, setBreedPropertiesSaved] = useState<Set<Id>>(new Set())

  const [selectedPropertyId, setSelectedPropertyId] = useState<Id | null>(null)
  const [propertyValueName, setPropertyValueName] = useState('')

  const [breedName, setBreedName] = useState('')
  const [propertyName, setPropertyName] = useState('')

  const [selectedPropertyIdForBreedValues, setSelectedPropertyIdForBreedValues] = useState<Id | null>(null)
  const [selectedValueIdsForBreedProperty, setSelectedValueIdsForBreedProperty] = useState<Set<Id>>(new Set())
  const [savedValueIdsForBreedProperty, setSavedValueIdsForBreedProperty] = useState<Set<Id>>(new Set())

  const [checkFillResult, setCheckFillResult] = useState<unknown>(null)

  async function reloadAll() {
    const [b, p, pv] = await Promise.all([getBreeds(), getProperties(), getPropertyValues()])
    setBreeds(b)
    setProperties(p)
    setPropertyValuesAll(pv)

    setSelectedBreedId((prev) => prev ?? (b[0]?.id ?? null))
    setSelectedPropertyId((prev) => prev ?? (p[0]?.id ?? null))
  }

  useEffect(() => {
    reloadAll().catch((e) => setError(getErrorMessage(e)))
  }, [])

  useEffect(() => {
    async function run() {
      if (selectedBreedId === null) {
        setBreedPropertiesSaved(new Set())
        setBreedPropertiesSelected(new Set())
        return
      }

      const resp = await getBreedPropertiesByBreedId(selectedBreedId)
      const ids = new Set<Id>(resp.properties.map((x) => x.id))

      setBreedPropertiesSaved(ids)
      setBreedPropertiesSelected(new Set(ids))
    }

    run().catch((e) => setError(getErrorMessage(e)))
  }, [selectedBreedId])

  const breedPropertiesForSelectedBreed = useMemo(() => {
    return properties.filter((p) => breedPropertiesSaved.has(p.id))
  }, [properties, breedPropertiesSaved])

  useEffect(() => {
    if (!breedPropertiesForSelectedBreed.length) {
      setSelectedPropertyIdForBreedValues(null)
      setSavedValueIdsForBreedProperty(new Set())
      setSelectedValueIdsForBreedProperty(new Set())
      return
    }

    if (
      selectedPropertyIdForBreedValues === null ||
      !breedPropertiesSaved.has(selectedPropertyIdForBreedValues)
    ) {
      setSelectedPropertyIdForBreedValues(breedPropertiesForSelectedBreed[0].id)
      setSavedValueIdsForBreedProperty(new Set())
      setSelectedValueIdsForBreedProperty(new Set())
    }
  }, [breedPropertiesForSelectedBreed, breedPropertiesSaved, selectedPropertyIdForBreedValues])

  useEffect(() => {
    async function run() {
      if (
        selectedBreedId === null ||
        selectedPropertyIdForBreedValues === null ||
        !breedPropertiesSaved.has(selectedPropertyIdForBreedValues)
      ) {
        setSavedValueIdsForBreedProperty(new Set())
        setSelectedValueIdsForBreedProperty(new Set())
        return
      }

      const ids = await getBreedPropertyValues(selectedBreedId, selectedPropertyIdForBreedValues)
      const next = new Set<Id>(ids)

      setSavedValueIdsForBreedProperty(next)
      setSelectedValueIdsForBreedProperty(new Set(next))
    }

    run().catch((e) => setError(getErrorMessage(e)))
  }, [selectedBreedId, selectedPropertyIdForBreedValues, breedPropertiesSaved])

  const propertyValuesForSelectedProperty = useMemo(() => {
    if (selectedPropertyId === null) return []
    return propertyValuesAll.filter((v) => v.propertyId === selectedPropertyId)
  }, [propertyValuesAll, selectedPropertyId])

  const possibleValuesForBreedProperty = useMemo(() => {
    if (selectedPropertyIdForBreedValues === null) return []
    if (!breedPropertiesSaved.has(selectedPropertyIdForBreedValues)) return []

    return propertyValuesAll.filter((v) => v.propertyId === selectedPropertyIdForBreedValues)
  }, [propertyValuesAll, selectedPropertyIdForBreedValues, breedPropertiesSaved])

  async function addBreed() {
    if (!breedName.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createBreed({ name: breedName.trim() })
      setBreedName('')
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function removeBreed(id: Id) {
    setLoading(true)
    setError(null)
    try {
      await deleteBreed(id)
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function addProperty() {
    if (!propertyName.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createProperty({ name: propertyName.trim() })
      setPropertyName('')
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function removeProperty(id: Id) {
    setLoading(true)
    setError(null)
    try {
      await deleteProperty(id)
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function addPropertyValue() {
    if (selectedPropertyId === null) return
    if (!propertyValueName.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createPropertyValue({ propertyId: selectedPropertyId, value: propertyValueName.trim() })
      setPropertyValueName('')
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function removePropertyValue(id: Id) {
    setLoading(true)
    setError(null)
    try {
      await deletePropertyValue(id)
      await reloadAll()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function saveBreedProperties() {
    if (selectedBreedId === null) return

    const saved = breedPropertiesSaved
    const selected = breedPropertiesSelected

    const toDelete: Id[] = []
    for (const id of saved) {
      if (!selected.has(id)) toDelete.push(id)
    }

    const toAdd: Id[] = []
    for (const id of selected) {
      if (!saved.has(id)) toAdd.push(id)
    }

    const base: Omit<BreedPropertyRequest, 'propertyIds'> = { breedId: selectedBreedId }

    setLoading(true)
    setError(null)
    try {
      if (toDelete.length) {
        await deleteBreedProperties({ ...base, propertyIds: toDelete })
      }

      if (toAdd.length) {
        await createBreedProperties({ ...base, propertyIds: toAdd })
      }

      const resp = await getBreedPropertiesByBreedId(selectedBreedId)
      const ids = new Set<Id>(resp.properties.map((x) => x.id))

      setBreedPropertiesSaved(ids)
      setBreedPropertiesSelected(new Set(ids))

      if (selectedPropertyIdForBreedValues !== null && !ids.has(selectedPropertyIdForBreedValues)) {
        setSelectedPropertyIdForBreedValues(null)
        setSavedValueIdsForBreedProperty(new Set())
        setSelectedValueIdsForBreedProperty(new Set())
      }
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function saveBreedPropertyValues() {
    if (selectedBreedId === null) return
    if (selectedPropertyIdForBreedValues === null) return
    if (!breedPropertiesSaved.has(selectedPropertyIdForBreedValues)) return

    const saved = savedValueIdsForBreedProperty
    const selected = selectedValueIdsForBreedProperty

    const toDelete: Id[] = []
    for (const id of saved) {
      if (!selected.has(id)) toDelete.push(id)
    }

    const toAdd: Id[] = []
    for (const id of selected) {
      if (!saved.has(id)) toAdd.push(id)
    }

    setLoading(true)
    setError(null)

    try {
      if (toDelete.length) {
        await deleteBreedPropertyValue({
          breedId: selectedBreedId,
          propertyId: selectedPropertyIdForBreedValues,
          propertyValueIds: toDelete,
        })
      }

      if (toAdd.length) {
        await createBreedPropertyValue({
          breedId: selectedBreedId,
          propertyId: selectedPropertyIdForBreedValues,
          propertyValueIds: toAdd,
        })
      }

      const ids = await getBreedPropertyValues(selectedBreedId, selectedPropertyIdForBreedValues)
      const next = new Set<Id>(ids)

      setSavedValueIdsForBreedProperty(next)
      setSelectedValueIdsForBreedProperty(new Set(next))
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  async function runCheckFill() {
    setLoading(true)
    setError(null)
    setCheckFillResult(null)
    try {
      const res = await checkFillKnowledge()
      setCheckFillResult(res)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const main = (() => {
    switch (section) {
      case 'breeds':
        return (
          <div>
            <div className="innerPanelTitle" style={{ textAlign: 'left', marginBottom: 10 }}>
              Породы кошек
            </div>
            {breeds.map((b) => {
              const on = b.id === selectedBreedId
              return (
                <div
                  key={b.id}
                  className="optionLine"
                  style={{
                    background: on ? 'rgba(242, 197, 140, 0.18)' : undefined,
                    borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                  }}
                >
                  <button className="iconBtn" type="button" onClick={() => removeBreed(b.id)} title="Удалить">
                    −
                  </button>
                  <div
                    className="rowName"
                    style={{ flex: 1, cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedBreedId(b.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedBreedId(b.id)
                    }}
                  >
                    {b.name}
                  </div>
                  <div style={{ width: 28 }} />
                </div>
              )
            })}

            <div className="formRow">
              <input
                className="textInput"
                placeholder="Введите название породы кошки"
                value={breedName}
                onChange={(e) => setBreedName(e.target.value)}
              />
              <button className="primaryBtn" type="button" disabled={loading} onClick={addBreed}>
                Добавить
              </button>
            </div>
          </div>
        )

      case 'properties':
        return (
          <div>
            <div className="innerPanelTitle" style={{ textAlign: 'left', marginBottom: 10 }}>
              Свойства
            </div>
            {properties.map((p) => {
              const on = p.id === selectedPropertyId
              return (
                <div
                  key={p.id}
                  className="optionLine"
                  style={{
                    background: on ? 'rgba(242, 197, 140, 0.18)' : undefined,
                    borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                  }}
                >
                  <button className="iconBtn" type="button" onClick={() => removeProperty(p.id)} title="Удалить">
                    −
                  </button>
                  <div
                    className="rowName"
                    style={{ flex: 1, cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPropertyId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedPropertyId(p.id)
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ width: 28 }} />
                </div>
              )
            })}

            <div className="formRow">
              <input
                className="textInput"
                placeholder="Введите название свойства"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
              <button className="primaryBtn" type="button" disabled={loading} onClick={addProperty}>
                Добавить
              </button>
            </div>
          </div>
        )

      case 'propertyValues':
        return (
          <div>
            <div className="innerPanelTitle" style={{ textAlign: 'left', marginBottom: 1 }}>
              Возможные значения
            </div>
            <div className="pillTabs" style={{ marginBottom: 10 }}>
              {properties.map((p) => {
                const on = p.id === selectedPropertyId
                return (
                  <div
                    key={p.id}
                    className={`pillTab ${on ? 'pillTabActive' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPropertyId(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedPropertyId(p.id)
                    }}
                  >
                    {p.name}
                  </div>
                )
              })}
            </div>

            <div>
              {propertyValuesForSelectedProperty.map((v) => (
                <div key={v.id} className="optionLine">
                  <button className="iconBtn" type="button" onClick={() => removePropertyValue(v.id)} title="Удалить">
                    −
                  </button>
                  <div className="rowName" style={{ flex: 1 }}>
                    {v.value}
                  </div>
                  <div style={{ width: 28 }} />
                </div>
              ))}
            </div>

            <div className="formRow">
              <input
                className="textInput"
                placeholder="Введите название значения"
                value={propertyValueName}
                onChange={(e) => setPropertyValueName(e.target.value)}
              />
              <button className="primaryBtn" type="button" disabled={loading} onClick={addPropertyValue}>
                Добавить
              </button>
            </div>
          </div>
        )

      case 'breedProperties':
        return (
          <div className="twoCols">
            <div className="innerPanel">
              <div className="innerPanelTitle">Породы кошек</div>
              {breeds.map((b) => {
                const on = b.id === selectedBreedId
                return (
                  <div
                    key={b.id}
                    className="optionLine"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedBreedId(b.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedBreedId(b.id)
                    }}
                    style={{
                      background: on ? 'rgba(242, 197, 140, 0.24)' : undefined,
                      borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                    }}
                  >
                    <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                    <div className="optionText">{b.name}</div>
                  </div>
                )
              })}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Свойства</div>
              <div className="checkAllRow">
                <span
                  className={`radioLike ${
                    properties.length > 0 && breedPropertiesSelected.size === properties.length ? 'radioLikeOn' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    const all = new Set(properties.map((p) => p.id))
                    setBreedPropertiesSelected((prev) => (prev.size === all.size ? new Set() : all))
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return
                    const all = new Set(properties.map((p) => p.id))
                    setBreedPropertiesSelected((prev) => (prev.size === all.size ? new Set() : all))
                  }}
                />
                <div className="optionText">Выбрать все</div>
              </div>

              {properties.map((p) => {
                const on = breedPropertiesSelected.has(p.id)
                return (
                  <div
                    key={p.id}
                    className="optionLine"
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleSet(setBreedPropertiesSelected, p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') toggleSet(setBreedPropertiesSelected, p.id)
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

              <div className="formRow" style={{ gridTemplateColumns: '1fr' }}>
                <button
                  className="primaryBtn"
                  type="button"
                  disabled={loading || selectedBreedId === null}
                  onClick={saveBreedProperties}
                >
                  Сохранить описание свойств породы
                </button>
              </div>
            </div>
          </div>
        )

      case 'breedPropertyValues':
        return (
          <div className="threeCols" style={{ gridTemplateColumns: '0.9fr 1fr 1.2fr' }}>
            <div className="innerPanel">
              <div className="innerPanelTitle">Породы кошек</div>
              {breeds.map((b) => {
                const on = b.id === selectedBreedId
                return (
                  <div
                    key={b.id}
                    className="optionLine"
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedBreedId(b.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSelectedBreedId(b.id)
                      }
                    }}
                    style={{
                      background: on ? 'rgba(242, 197, 140, 0.24)' : undefined,
                      borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                    }}
                  >
                    <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                    <div className="optionText">{b.name}</div>
                  </div>
                )
              })}
              {!breeds.length && <div className="loadingText">Нет пород</div>}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Свойства</div>
              {!breedPropertiesForSelectedBreed.length ? (
                <div className="loadingText">Для породы нет выбранных свойств</div>
              ) : (
                breedPropertiesForSelectedBreed.map((p) => {
                  const on = p.id === selectedPropertyIdForBreedValues
                  return (
                    <div
                      key={p.id}
                      className="optionLine"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedPropertyIdForBreedValues(p.id)
                        setSelectedValueIdsForBreedProperty(new Set())
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedPropertyIdForBreedValues(p.id)
                          setSelectedValueIdsForBreedProperty(new Set())
                        }
                      }}
                      style={{
                        background: on ? 'rgba(242, 197, 140, 0.24)' : undefined,
                        borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                      }}
                    >
                      <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                      <div className="optionText">{p.name}</div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Возможные значения</div>
              {!selectedPropertyIdForBreedValues ? (
                <div className="loadingText">Выберите свойство</div>
              ) : (
                <div>
                  <div className="checkAllRow">
                    <span
                      className={`radioLike ${
                        possibleValuesForBreedProperty.length > 0 &&
                        selectedValueIdsForBreedProperty.size === possibleValuesForBreedProperty.length
                          ? 'radioLikeOn'
                          : ''
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        const all = new Set(possibleValuesForBreedProperty.map((v) => v.id))
                        setSelectedValueIdsForBreedProperty((prev) => (prev.size === all.size ? new Set() : all))
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return
                        const all = new Set(possibleValuesForBreedProperty.map((v) => v.id))
                        setSelectedValueIdsForBreedProperty((prev) => (prev.size === all.size ? new Set() : all))
                      }}
                    />
                    <div className="optionText">Выбрать все</div>
                  </div>

                  {possibleValuesForBreedProperty.map((v) => {
                    const on = selectedValueIdsForBreedProperty.has(v.id)
                    return (
                      <div
                        key={v.id}
                        className="optionLine"
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleSet(setSelectedValueIdsForBreedProperty, v.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') toggleSet(setSelectedValueIdsForBreedProperty, v.id)
                        }}
                        style={{
                          background: on ? 'rgba(242, 197, 140, 0.18)' : undefined,
                          borderColor: on ? 'rgba(226,169,99,0.8)' : undefined,
                        }}
                      >
                        <span className={`radioLike ${on ? 'radioLikeOn' : ''}`} />
                        <div className="optionText">{v.value}</div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="summaryBox">
                {selectedValueIdsForBreedProperty.size ? (
                  Array.from(selectedValueIdsForBreedProperty).map((valueId) => {
                    const v = possibleValuesForBreedProperty.find((x) => x.id === valueId)
                    return (
                      <div
                        key={valueId}
                        className="summaryLine"
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleSet(setSelectedValueIdsForBreedProperty, valueId)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') toggleSet(setSelectedValueIdsForBreedProperty, valueId)
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {properties.find((p) => p.id === selectedPropertyIdForBreedValues)?.name}: {v?.value ?? ''}
                      </div>
                    )
                  })
                ) : (
                  <div className="loadingText" style={{ padding: 0 }}>
                    Выберите значения
                  </div>
                )}
              </div>

              <div className="formRow" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                <button
                  className="smallActionBtn"
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedValueIdsForBreedProperty(new Set())}
                >
                  Снять все
                </button>
                <button
                  className="primaryBtn"
                  type="button"
                  disabled={
                    loading ||
                    selectedBreedId === null ||
                    selectedPropertyIdForBreedValues === null ||
                    !breedPropertiesSaved.has(selectedPropertyIdForBreedValues)
                  }
                  onClick={saveBreedPropertyValues}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        )

      case 'checkFill': {
        const res = checkFillResult as any
        const allFilled = Boolean(res?.allFilled)
        const breedsMissing: any[] = Array.isArray(res?.breeds) ? res.breeds : []

        return (
          <div>
            <div className="formRow" style={{ gridTemplateColumns: '1fr 170px' }}>
              <button className="primaryBtn" type="button" disabled={loading} onClick={runCheckFill}>
                Проверка полноты знаний
              </button>
              <button
                className="smallActionBtn"
                type="button"
                disabled={loading}
                onClick={() => setCheckFillResult(null)}
              >
                Очистить
              </button>
            </div>

            {!checkFillResult ? null : allFilled ? (
              <div className="alertBox">Все поля заполнены</div>
            ) : (
              <div>
                <div className="alertBox">Есть не заполненные поля</div>
                <div className="twoCols" style={{ gridTemplateColumns: '1fr' }}>
                  <div className="summaryBox">
                    {breedsMissing.length ? (
                      breedsMissing.map((b: any) => (
                        <div key={b.breedId} style={{ marginBottom: 10 }}>
                          <div className="summaryLine" style={{ fontWeight: 700 }}>
                            {b.breedName}
                          </div>
                          <div style={{ color: '#2a2a2a', fontWeight: 500 }}>
                            {Array.isArray(b.unfilledProperties)
                              ? b.unfilledProperties.map((p: any) => p.name).join(', ')
                              : ''}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="loadingText" style={{ padding: 0 }}>
                        Нет данных
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      }
    }
  })()

  return (
    <div className="appFrame">
      <div className="topBar">
        <div className="topBarTitle">Редактор баз знаний</div>
        <button className="topBarExit" type="button" onClick={() => navigate('/')}>
          Перейти к классификации
        </button>
      </div>

      <div className="kbLayout">
        <div className="sidebar">
          <button
            className={`sidebarButton ${section === 'breeds' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('breeds')}
          >
            Породы кошек
          </button>
          <button
            className={`sidebarButton ${section === 'properties' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('properties')}
          >
            Свойства
          </button>
          <button
            className={`sidebarButton ${section === 'propertyValues' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('propertyValues')}
          >
            Возможные значения
          </button>
          <button
            className={`sidebarButton ${section === 'breedProperties' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('breedProperties')}
          >
            Описание свойств породы
          </button>
          <button
            className={`sidebarButton ${section === 'breedPropertyValues' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('breedPropertyValues')}
          >
            Значение для породы
          </button>
          <button
            className={`sidebarButton ${section === 'checkFill' ? 'sidebarButtonActive' : ''}`}
            type="button"
            onClick={() => setSection('checkFill')}
            style={{ marginBottom: 0 }}
          >
            Проверка полноты знаний
          </button>
        </div>

        <div className="contentBox">
          {error && <div className="alertBox">{error}</div>}
          {loading && <div className="loadingText">Подождите...</div>}
          {main}
        </div>
      </div>
    </div>
  )
}