import { RoomCredentials } from '../service/auth'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type QueryParams = { [key: string]: string | number | undefined }
export interface ErrorResponse {
  error: string
  status?: number
}

export async function DoRequestNoAuth<SuccessfulResponse>(
  path: string,
  method: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      'Access-Control-Allow-Origin': '*',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }

  return DoRequest<SuccessfulResponse>(path, requestOptions, expectedFields)
}

export async function DoRequestWithRoomCredentials<SuccessfulResponse>(
  path: string,
  method: string,
  credentials: RoomCredentials,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit,
  queryParams?: QueryParams
): Promise<SuccessfulResponse | ErrorResponse> {
  if ('token' in credentials) {
    return DoRequestWithToken(
      path,
      method,
      credentials.token,
      expectedFields,
      body,
      options,
      queryParams
    )
  } else {
    return DoRequestWithPassword(
      path,
      method,
      credentials.guestID,
      credentials.roomPassword,
      expectedFields,
      body,
      options,
      queryParams
    )
  }
}

export async function DoRequestWithToken<SuccessfulResponse>(
  path: string,
  method: string,
  token: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit,
  queryParams?: QueryParams
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      'Access-Control-Allow-Origin': '*',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }

  return DoRequest<SuccessfulResponse>(path, requestOptions, expectedFields, queryParams)
}

export async function DoRequestWithBasic<SuccessfulResponse>(
  path: string,
  method: string,
  username: string,
  password: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit,
  queryParams?: QueryParams
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      Authorization: 'Basic ' + btoa(`${username}:${password}`),
      'Access-Control-Allow-Origin': '*',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }

  return DoRequest<SuccessfulResponse>(path, requestOptions, expectedFields, queryParams)
}

export async function DoRequestWithPassword<SuccessfulResponse>(
  path: string,
  method: string,
  username: string,
  password: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit,
  queryParams?: QueryParams
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      'Access-Control-Allow-Origin': '*',
      ...options?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }

  return DoRequest<SuccessfulResponse>(path, requestOptions, expectedFields, {
    ...queryParams,
    guest_id: username,
    password,
  })
}

export async function DoRequest<SuccessfulResponse>(
  path: string,
  options: RequestInit,
  expectedFields?: string[],
  queryParams?: QueryParams
): Promise<SuccessfulResponse | ErrorResponse> {
  let response: Response
  const url = new URL(import.meta.env.VITE_BACKEND_URL + path)
  if (queryParams) {
    Object.entries(queryParams)?.forEach(
      ([key, value]) => value !== undefined && url.searchParams.set(key, value.toString())
    )
  }
  try {
    response = await fetch(url, options)
  } catch (e) {
    return { error: `${e}` }
  }

  if (response.status === 204 || response.status === 202) {
    return null as SuccessfulResponse
  }

  if (response.status >= 400) {
    return { error: await response.text() }
  }

  const respBody = await response.json()

  if (!response.ok) {
    return {
      error: respBody.error ?? 'HTTP status ' + response.status,
      status: response.status,
    }
  }

  if (expectedFields) {
    const missingFields = expectedFields.filter((field) => !(field in respBody))
    if (missingFields.length > 0) {
      return {
        error: `Response missing expected fields: ${missingFields.join(', ')}`,
      }
    }
  }

  return respBody
}
