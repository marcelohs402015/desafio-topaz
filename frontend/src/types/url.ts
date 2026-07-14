export interface CreateUrlPayload {
  originalUrl: string;
  alias?: string;
}

export interface UpdateUrlPayload {
  originalUrl: string;
  alias?: string;
}

export interface UrlResponse {
  id: number;
  originalUrl: string;
  shortUrl: string;
  shortCode: string;
  accessCount: number;
  createdAt: string;
}

export interface ErrorResponse {
  message: string;
  timestamp: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}
