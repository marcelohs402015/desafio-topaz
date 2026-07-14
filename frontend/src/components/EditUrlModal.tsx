import { useState, type FormEvent } from 'react';
import { isValidUrl } from '../services/auth';
import type { UpdateUrlPayload, UrlResponse } from '../types/url';

interface EditUrlModalProps {
  url: UrlResponse;
  loading: boolean;
  onClose: () => void;
  onSave: (id: number, payload: UpdateUrlPayload) => void;
}

export function EditUrlModal({ url, loading, onClose, onSave }: EditUrlModalProps) {
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [alias, setAlias] = useState(url.shortCode);
  const [validationError, setValidationError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = originalUrl.trim();
    if (!isValidUrl(trimmedUrl)) {
      setValidationError('Informe uma URL valida com http:// ou https://');
      return;
    }
    setValidationError('');
    onSave(url.id, {
      originalUrl: trimmedUrl,
      alias: alias.trim() || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Editar URL</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="edit-originalUrl" className="mb-1 block text-sm font-medium text-slate-700">
              URL original
            </label>
            <input
              id="edit-originalUrl"
              type="url"
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="edit-alias" className="mb-1 block text-sm font-medium text-slate-700">
              Alias
            </label>
            <input
              id="edit-alias"
              type="text"
              value={alias}
              onChange={(event) => setAlias(event.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
            />
          </div>
          {validationError && <p className="text-sm text-red-600">{validationError}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
