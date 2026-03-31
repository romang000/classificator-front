import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../../../shared/ui/Header/Header'
import {
  getBreeds,
  getProperties,
  getPropertyValues,
  getBreedPropertiesByBreedId,
  getBreedPropertyValues,
} from '../api/knowledgeApi'
import type { Id, Property, PropertyValue } from '../../../entities/breed/model/types'

export function CheckKnowledgeBase() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [breeds, setBreeds] = useState<Array<{ id: Id; name: string }>>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [propertyValuesAll, setPropertyValuesAll] = useState<PropertyValue[]>([])

  const [selectedBreedId, setSelectedBreedId] = useState<Id | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<Id | null>(null)

  const [breedPropertyIds, setBreedPropertyIds] = useState<Set<Id>>(new Set())
  const [breedPropertyValueIds, setBreedPropertyValueIds] = useState<Set<Id>>(new Set())

  async function loadInitial() {
    setLoading(true)
    setError(null)

    try {
      const [breedsResp, propertiesResp, propertyValuesResp] = await Promise.all([
        getBreeds(),
        getProperties(),
        getPropertyValues(),
      ])

      setBreeds(breedsResp)
      setProperties(propertiesResp)
      setPropertyValuesAll(propertyValuesResp)

      if (breedsResp.length > 0) {
        setSelectedBreedId(breedsResp[0].id)
      }
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitial()
  }, [])

  useEffect(() => {
    async function loadBreedProperties() {
      if (selectedBreedId === null) {
        setBreedPropertyIds(new Set())
        setSelectedPropertyId(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const resp = await getBreedPropertiesByBreedId(selectedBreedId)
        const ids = new Set<Id>(resp.properties.map((x) => x.id))
        setBreedPropertyIds(ids)

        const firstPropertyId = resp.properties[0]?.id ?? null
        setSelectedPropertyId(firstPropertyId)
      } catch (e) {
        setError(String(e))
        setBreedPropertyIds(new Set())
        setSelectedPropertyId(null)
      } finally {
        setLoading(false)
      }
    }

    loadBreedProperties()
  }, [selectedBreedId])

  useEffect(() => {
    async function loadBreedPropertyValues() {
      if (selectedBreedId === null || selectedPropertyId === null) {
        setBreedPropertyValueIds(new Set())
        return
      }

      setLoading(true)
      setError(null)

      try {
        const ids = await getBreedPropertyValues(selectedBreedId, selectedPropertyId)
        setBreedPropertyValueIds(new Set(ids))
      } catch (e) {
        setError(String(e))
        setBreedPropertyValueIds(new Set())
      } finally {
        setLoading(false)
      }
    }

    loadBreedPropertyValues()
  }, [selectedBreedId, selectedPropertyId])

  const breedProperties = useMemo(() => {
    return properties.filter((p) => breedPropertyIds.has(p.id))
  }, [properties, breedPropertyIds])

  const selectedProperty = useMemo(() => {
    return properties.find((p) => p.id === selectedPropertyId) ?? null
  }, [properties, selectedPropertyId])

  const selectedValues = useMemo(() => {
    if (selectedPropertyId === null) return []

    return propertyValuesAll.filter(
      (v) => v.propertyId === selectedPropertyId && breedPropertyValueIds.has(v.id),
    )
  }, [propertyValuesAll, selectedPropertyId, breedPropertyValueIds])

  const selectedBreed = useMemo(() => {
    return breeds.find((b) => b.id === selectedBreedId) ?? null
  }, [breeds, selectedBreedId])

  return (
    <>
      <Header title='Просмотр базы знаний'/>
      <div className="appFrame">
        <div className="topBar">
          <div className="topBarTitle">База знаний</div>
          <button className="topBarExit" type="button" onClick={() => navigate('/')}>
            Перейти к классификации
          </button>
        </div>

        <div className="kbLayout" style={{ gridTemplateColumns: '1fr' }}>
        <div className="contentBox">
          {error && <div className="alertBox">{error}</div>}
          {loading && <div className="loadingText">Подождите...</div>}

          <div className="threeCols" style={{ gridTemplateColumns: '0.9fr 1fr 1.2fr' }}>
            <div className="innerPanel">
              <div className="innerPanelTitle">Породы кошек</div>

              {breeds.length ? (
                breeds.map((breed) => {
                  const active = breed.id === selectedBreedId

                  return (
                    <div
                      key={breed.id}
                      className="optionLine"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedBreedId(breed.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedBreedId(breed.id)
                      }}
                      style={{
                        background: active ? 'rgba(242, 197, 140, 0.24)' : undefined,
                        borderColor: active ? 'rgba(226,169,99,0.8)' : undefined,
                        cursor: 'pointer',
                      }}
                    >
                      <div className="optionText">{breed.name}</div>
                    </div>
                  )
                })
              ) : (
                <div className="loadingText">Нет пород</div>
              )}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Свойства</div>

              {breedProperties.length ? (
                breedProperties.map((property) => {
                  const active = property.id === selectedPropertyId

                  return (
                    <div
                      key={property.id}
                      className="optionLine"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPropertyId(property.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedPropertyId(property.id)
                      }}
                      style={{
                        background: active ? 'rgba(242, 197, 140, 0.24)' : undefined,
                        borderColor: active ? 'rgba(226,169,99,0.8)' : undefined,
                        cursor: 'pointer',
                      }}
                    >
                      <div className="optionText">{property.name}</div>
                    </div>
                  )
                })
              ) : (
                <div className="loadingText">
                  {selectedBreed ? 'У этой породы нет свойств' : 'Выберите породу'}
                </div>
              )}
            </div>

            <div className="innerPanel">
              <div className="innerPanelTitle">Возможные значения</div>

              {!selectedProperty ? (
                <div className="loadingText">Выберите свойство</div>
              ) : selectedValues.length ? (
                <div>
                  {selectedValues.map((value) => (
                    <div
                      key={value.id}
                      className="optionLine"
                      style={{
                        background: 'rgba(242, 197, 140, 0.18)',
                        borderColor: 'rgba(226,169,99,0.8)',
                      }}
                    >
                      <div className="optionText">{value.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="loadingText">Для этого свойства значения не заданы</div>
              )}

              <div className="summaryBox" style={{ marginTop: 16 }}>
                {selectedBreed && selectedProperty ? (
                  selectedValues.length ? (
                    selectedValues.map((value) => (
                      <div key={value.id} className="summaryLine">
                        <strong>{selectedProperty.name}:</strong> {value.value}
                      </div>
                    ))
                  ) : (
                    <div className="loadingText" style={{ padding: 0 }}>
                      Нет значений
                    </div>
                  )
                ) : (
                  <div className="loadingText" style={{ padding: 0 }}>
                    Выберите породу и свойство
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}