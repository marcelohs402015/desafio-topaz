import type {
  AuthCredentials,
  CreateUrlPayload,
  ErrorResponse,
  UpdateUrlPayload,
  UrlResponse,
} from '../types/url';
import { encodeBasicAuth } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseError(response: Response): Promise<string> {
  if (response.status === 401) {
    return 'Credenciais invalidas. Faca login novamente.';
  }
  if (response.status === 403) {
    return 'Acesso negado.';
  }
  if (response.status >= 500) {
    return 'Erro no servidor. Tente novamente em instantes.';
  }
  try {
    const body = (await response.json()) as ErrorResponse;
    return body.message || 'Erro inesperado';
  } catch {
    return 'Erro inesperado';
  }
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof TypeError) {
    return new ApiError(
      'Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.',
    );
  }
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') {
      return new ApiError(
        'Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.',
      );
    }
    return new ApiError(error.message);
  }
  return new ApiError('Erro inesperado');
}

function authHeaders(credentials: AuthCredentials): HeadersInit {
  return {
    Authorization: encodeBasicAuth(credentials),
  };
}

export async function listShortUrls(credentials: AuthCredentials): Promise<UrlResponse[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/urls`, {
      headers: authHeaders(credentials),
    });
  } catch (error) {
    throw toApiError(error);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as UrlResponse[];
}

export async function createShortUrl(
  payload: CreateUrlPayload,
  credentials: AuthCredentials,
): Promise<UrlResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(credentials),
      },
      body: JSON.stringify({
        originalUrl: payload.originalUrl,
        alias: payload.alias?.trim() || undefined,
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as UrlResponse;
}

export async function updateShortUrl(
  id: number,
  payload: UpdateUrlPayload,
  credentials: AuthCredentials,
): Promise<UrlResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(credentials),
      },
      body: JSON.stringify({
        originalUrl: payload.originalUrl,
        alias: payload.alias?.trim() || undefined,
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as UrlResponse;
}

export async function deleteShortUrl(id: number, credentials: AuthCredentials): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
      method: 'DELETE',
      headers: authHeaders(credentials),
    });
  } catch (error) {
    throw toApiError(error);
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
}
