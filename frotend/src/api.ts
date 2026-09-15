export type AssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE'

export type Asset = {
  id: number | string
  name: string
  description: string
  assetTag: string
  status: AssetStatus
}

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } })
  } catch {
    throw new Error(`Cannot connect to the backend at ${API_URL}.`)
  }
  const responseText = await response.text()
  let responseBody: unknown
  try { responseBody = responseText ? JSON.parse(responseText) : undefined } catch { responseBody = responseText }
  if (!response.ok) {
    const message = typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody ? String(responseBody.message) : typeof responseBody === 'string' && responseBody ? responseBody : `Request failed with ${response.status}`
    throw new Error(message)
  }
  return responseBody as T
}

function unwrap<T>(response: T | { data: T } | { asset: T }): T {
  if (typeof response === 'object' && response !== null && 'data' in response) return response.data
  if (typeof response === 'object' && response !== null && 'asset' in response) return response.asset
  return response as T
}

export async function getAssets(): Promise<Asset[]> { return unwrap(await request<Asset[] | { data: Asset[] }>('/assets')) }
export async function createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> { return unwrap(await request<Asset | { data: Asset } | { asset: Asset }>('/assets', { method: 'POST', body: JSON.stringify(asset) })) }
export async function updateAsset(id: number | string, asset: Partial<Omit<Asset, 'id'>>): Promise<Asset> { return unwrap(await request<Asset | { data: Asset } | { asset: Asset }>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(asset) })) }
export async function deleteAsset(id: number | string): Promise<void> { await request<void>(`/assets/${id}`, { method: 'DELETE' }) }
