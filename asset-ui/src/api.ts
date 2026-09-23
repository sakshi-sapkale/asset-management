import { getAccessToken } from './auth'

export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE'

export type Asset = {
  id: number | string
  name: string
  description?: string
  assetTag: string
  status: AssetStatus
}

export type AssetInput = {
  name: string
  description?: string
  assetTag: string
  status: AssetStatus
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

export class ApiError extends Error {
  fieldErrors?: Record<string, string>
  status: number

  constructor(message: string, fieldErrors?: Record<string, string>, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.fieldErrors = fieldErrors
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    const token = await getAccessToken()
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers } })
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_URL}.`)
  }
  const responseText = await response.text()
  let responseBody: unknown
  try { responseBody = responseText ? JSON.parse(responseText) : undefined } catch { responseBody = responseText }
  if (!response.ok) {
    const message = typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody ? String(responseBody.message) : typeof responseBody === 'string' && responseBody ? responseBody : `Request failed with ${response.status}`
    const fieldErrors = typeof responseBody === 'object' && responseBody !== null && 'fieldErrors' in responseBody && typeof responseBody.fieldErrors === 'object' && responseBody.fieldErrors !== null ? responseBody.fieldErrors as Record<string, string> : undefined
    throw new ApiError(message, fieldErrors, response.status)
  }
  return responseBody as T
}

function unwrap<T>(response: T | { data: T } | { asset: T }): T {
  if (typeof response === 'object' && response !== null && 'data' in response) return response.data
  if (typeof response === 'object' && response !== null && 'asset' in response) return response.asset
  return response as T
}

export async function getAssets(): Promise<Asset[]> { return unwrap(await request<Asset[] | { data: Asset[] }>('/assets')) }
export async function createAsset(asset: AssetInput): Promise<Asset> { return unwrap(await request<Asset | { data: Asset } | { asset: Asset }>('/assets', { method: 'POST', body: JSON.stringify(asset) })) }
export async function updateAsset(id: number | string, asset: Partial<AssetInput>): Promise<Asset> { return unwrap(await request<Asset | { data: Asset } | { asset: Asset }>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(asset) })) }
export async function deleteAsset(id: number | string): Promise<void> { await request<void>(`/assets/${id}`, { method: 'DELETE' }) }
