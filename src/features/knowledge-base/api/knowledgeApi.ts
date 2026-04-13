import { apiFetch } from '../../../shared/api/client'
import type {
  BreedCheckFillDto,
  BreedGetByPropertyValueDto,
  BreedPropertyGetResponse,
  BreedPropertyRequest,
  BreedPropertyResponse,
  BreedPropertyValueDeleteDto,
  BreedPropertyValueRequest,
  BreedPropertyValueResponse,
  BreedRequest,
  BreedResponse,
  BreedGetByPropertyValueResponse,
  Id,
  PropertyRequest,
  PropertyResponse,
  PropertyValueRequest,
  PropertyValueResponse,
  RankRequest,
  RankResponse,
} from '../../../entities/breed/model/types'

export async function getBreeds(): Promise<BreedResponse[]> {
  return apiFetch<BreedResponse[]>('/breeds')
}

export async function createBreed(payload: BreedRequest): Promise<BreedResponse> {
  return apiFetch<BreedResponse>('/breeds', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteBreed(id: Id): Promise<void> {
  await apiFetch<void>(`/breeds/${id}`, { method: 'DELETE' })
}

export async function getBreedsByPropertyValue(payload: BreedGetByPropertyValueDto[]): Promise<BreedGetByPropertyValueResponse> {
  return apiFetch<BreedGetByPropertyValueResponse>('/breeds/by-property-value', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function checkFillKnowledge(): Promise<BreedCheckFillDto> {
  return apiFetch<BreedCheckFillDto>('/breeds/check-fill', { method: 'POST' })
}

export async function getProperties(): Promise<PropertyResponse[]> {
  return apiFetch<PropertyResponse[]>('/properties')
}

export async function createProperty(payload: PropertyRequest): Promise<PropertyResponse> {
  return apiFetch<PropertyResponse>('/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteProperty(id: Id): Promise<void> {
  await apiFetch<void>(`/properties/${id}`, { method: 'DELETE' })
}

export async function getPropertyValues(): Promise<PropertyValueResponse[]> {
  return apiFetch<PropertyValueResponse[]>('/property-value')
}

export async function getBreedByModel(payload: RankRequest): Promise<RankResponse> {
  return apiFetch<RankResponse>('/rank', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, true)
}

export async function getPropertyValuesByPropertyId(propertyId: Id): Promise<PropertyValueResponse[]> {
  return apiFetch<PropertyValueResponse[]>(`/property-value/${propertyId}`)
}

export async function createPropertyValue(payload: PropertyValueRequest): Promise<PropertyValueResponse> {
  return apiFetch<PropertyValueResponse>('/property-value', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deletePropertyValue(id: Id): Promise<void> {
  await apiFetch<void>(`/property-value/${id}`, { method: 'DELETE' })
}

export async function getBreedPropertiesByBreedId(breedId: Id): Promise<BreedPropertyGetResponse> {
  return apiFetch<BreedPropertyGetResponse>(`/breed-properties/${breedId}`)
}

export async function createBreedProperties(payload: BreedPropertyRequest): Promise<BreedPropertyResponse> {
  return apiFetch<BreedPropertyResponse>('/breed-properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteBreedProperties(payload: BreedPropertyRequest): Promise<BreedPropertyResponse> {
  return apiFetch<BreedPropertyResponse>('/breed-properties', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

export async function createBreedPropertyValue(
  payload: BreedPropertyValueRequest,
): Promise<BreedPropertyValueResponse> {
  return apiFetch<BreedPropertyValueResponse>('/breed-property-value', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getBreedPropertyValues(
  breedId: number,
  propertyId: number,
): Promise<number[]> {
  return apiFetch<number[]>(`/breed-property-value?breedId=${breedId}&propertyId=${propertyId}`, {
    method: 'GET',
  });
}

export async function deleteBreedPropertyValue(
  payload: BreedPropertyValueRequest,
): Promise<BreedPropertyValueDeleteDto> {
  return apiFetch<BreedPropertyValueDeleteDto>('/breed-property-value', {
    method: 'DELETE',
    body: JSON.stringify(payload),
  })
}

