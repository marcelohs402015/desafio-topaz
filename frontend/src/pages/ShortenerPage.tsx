import { useState } from 'react';
import { ShortUrlResult } from '../components/ShortUrlResult';
import { UrlForm } from '../components/UrlForm';
import { useAuth } from '../contexts/AuthContext';
import { createShortUrl, deleteShortUrl } from '../services/urlApi';
import type { CreateUrlPayload, UrlResponse } from '../types/url';

export function ShortenerPage() {
  const { credentials } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<UrlResponse | null>(null);

  async function handleCreate(payload: CreateUrlPayload) {
    if (!credentials) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await createShortUrl(payload, credentials);
      setResult(response);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Erro ao criar URL';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!credentials) {
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await deleteShortUrl(id, credentials);
      setResult(null);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Erro ao excluir URL';
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Encurtar URL</h2>
        <p className="text-sm text-slate-600">Crie um novo link encurtado com alias opcional.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <UrlForm disabled={false} loading={loading} onSubmit={handleCreate} />
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        {result && (
          <div className="mt-4">
            <ShortUrlResult result={result} deleting={deleting} onDelete={handleDelete} />
          </div>
        )}
      </section>
    </div>
  );
}
