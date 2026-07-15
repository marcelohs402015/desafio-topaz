import type { AuthCredentials } from '../types/url';
import { isValidUrl } from '../utils/validation';

export { isValidUrl };

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export function encodeBasicAuth(credentials: AuthCredentials): string {
  const token = `${credentials.username}:${credentials.password}`;
  return `Basic ${btoa(token)}`;
}

export async function validateCredentials(credentials: AuthCredentials): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`, {
      headers: {
        Authorization: encodeBasicAuth(credentials),
      },
    });

    if (response.status === 401) {
      throw new Error('Usuario ou senha invalidos.');
    }

    if (!response.ok) {
      throw new Error('Nao foi possivel validar as credenciais.');
    }
  } catch (error) {
    if (error instanceof Error && error.message !== 'Failed to fetch') {
      throw error;
    }
    throw new Error('Nao foi possivel conectar ao servidor. Verifique se o backend esta em execucao.');
  }
}
