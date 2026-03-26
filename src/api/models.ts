export type Id = number

export interface BreedRequest {
  name: string
}

export interface BreedResponse {
  id: Id
  name: string
}

export interface PropertyRequest {
  name: string
}

export interface PropertyResponse {
  id: Id
  name: string
}

export type Property = PropertyResponse

export interface PropertyValueRequest {
  propertyId: Id
  value: string
}

export interface PropertyValueResponse {
  id: Id
  propertyId: Id
  value: string
}

export type PropertyValue = PropertyValueResponse

export interface BreedGetByPropertyValueDto {
  propertyId: Id
  valueId: Id
}

export interface BreedCheckFillDto {
  breeds: BreedUnfilledDto[]
  allFilled: boolean
}

export interface BreedUnfilledDto {
  breedId: Id
  breedName: string
  unfilledProperties: PropertyResponse[]
}

export interface BreedPropertyRequest {
  breedId: Id
  propertyIds: Id[]
}

export interface BreedPropertyResponse {
  breedId: Id
  addedProperties: Id[]
  skippedProperties: Id[]
}

export interface BreedPropertyGetResponse {
  breedId: Id
  properties: PropertyResponse[]
}

export interface BreedPropertyValueRequest {
  breedId: Id
  propertyId: Id
  propertyValueIds: Id[]
}

export interface BreedPropertyValueResponse {
  breedId: Id
  propertyId: Id
  addedValues: Id[]
  skippedValues: Id[]
}

export interface BreedPropertyValueDeleteDto {
  breedId: Id
  propertyId: Id
  deleteValues: Id[]
  skippedValues: Id[]
}

