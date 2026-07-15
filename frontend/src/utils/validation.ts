const ALIAS_PATTERN = /^[a-zA-Z0-9-]{3,20}$/;

const RESERVED_ALIASES = new Set([
  'api',
  'actuator',
  'login',
  'shorten',
  'urls',
  'v3',
  'swagger-ui',
]);

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getAliasValidationError(alias: string): string | null {
  const normalized = alias.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (!ALIAS_PATTERN.test(normalized)) {
    return 'Alias deve ter entre 3 e 20 caracteres (letras, numeros ou hifen)';
  }
  if (RESERVED_ALIASES.has(normalized)) {
    return 'Alias reservado pelo sistema';
  }
  return null;
}
