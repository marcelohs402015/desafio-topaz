import { useState, type FormEvent } from 'react';
import { isValidUrl } from '../services/auth';
import { getAliasValidationError } from '../utils/validation';
import type { CreateUrlPayload } from '../types/url';

interface UrlFormProps {
  disabled: boolean;
  loading: boolean;
  onSubmit: (payload: CreateUrlPayload) => void;
}

export function UrlForm({ disabled, loading, onSubmit }: UrlFormProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [validationError, setValidationError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = originalUrl.trim();
    if (!isValidUrl(trimmedUrl)) {
      setValidationError('Informe uma URL valida com http:// ou https://');
      return;
    }
    const aliasError = getAliasValidationError(alias);
    if (aliasError) {
      setValidationError(aliasError);
      return;
    }
    setValidationError('');
    onSubmit({
      originalUrl: trimmedUrl,
      alias: alias.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="originalUrl" className="block text-sm font-medium text-slate-700 mb-1">
          URL original
        </label>
        <input
          id="originalUrl"
          type="url"
          value={originalUrl}
          onChange={(event) => setOriginalUrl(event.target.value)}
          placeholder="https://www.exemplo.com"
          disabled={disabled || loading}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        />
      </div>
      <div>
        <label htmlFor="alias" className="block text-sm font-medium text-slate-700 mb-1">
          Alias (opcional)
        </label>
        <input
          id="alias"
          type="text"
          value={alias}
          onChange={(event) => setAlias(event.target.value)}
          placeholder="meu-link"
          disabled={disabled || loading}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
        />
      </div>
      {validationError && <p className="text-sm text-red-600">{validationError}</p>}
      <button
        type="submit"
        disabled={disabled || loading || !originalUrl.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400"
      >
        {loading ? 'Gerando...' : 'Gerar encurtador'}
      </button>
    </form>
  );
}
