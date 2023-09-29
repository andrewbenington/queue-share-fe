export interface ErrorResponse {
  networkError?: boolean;
  error: string;
}

export async function DoRequestWithToken<SuccessfulResponse>(
  path: string,
  method: string,
  token: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      Authorization: 'Bearer ' + token,
      ...options?.headers,
    },
    body,
  };

  return doRequest<SuccessfulResponse>(path, requestOptions, expectedFields);
}

export async function DoRequestWithBasic<SuccessfulResponse>(
  path: string,
  method: string,
  username: string,
  password: string,
  expectedFields?: string[],
  body?: any,
  options?: RequestInit
): Promise<SuccessfulResponse | ErrorResponse> {
  const requestOptions = {
    ...options,
    method,
    headers: {
      Authorization: 'Basic ' + btoa(`${username}:${password}`),
      ...options?.headers,
    },
    body,
  };

  return doRequest<SuccessfulResponse>(path, requestOptions, expectedFields);
}

async function doRequest<SuccessfulResponse>(
  path: string,
  options: RequestInit,
  expectedFields?: string[]
): Promise<SuccessfulResponse | ErrorResponse> {
  let response: Response;
  try {
    response = await fetch(import.meta.env.VITE_BACKEND_URL + path, options);
  } catch (e) {
    return { networkError: true, error: `${e}` };
  }

  const respBody = await response.json();

  if (!response.ok) {
    return {
      error: respBody.error ?? 'HTTP status ' + response.status,
    };
  }

  if (expectedFields) {
    const missingFields = expectedFields.filter(
      (field) => !(field in respBody)
    );
    if (missingFields.length > 0) {
      return {
        error: `Response missing expected fields: ${missingFields.join(', ')}`,
      };
    }
  }

  return respBody;
}
