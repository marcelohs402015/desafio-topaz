import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EditUrlModal } from '../components/EditUrlModal';
import { useAuth } from '../contexts/AuthContext';
import { deleteShortUrl, listShortUrls, updateShortUrl } from '../services/urlApi';
import type { UpdateUrlPayload, UrlResponse } from '../types/url';

function formatDate(value: string): string {
  return new Date(value).toLocaleString('pt-BR');
}

export function UrlListPage() {
  const { credentials } = useAuth();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingUrl, setEditingUrl] = useState<UrlResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUrls = useCallback(async () => {
    if (!credentials) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await listShortUrls(credentials);
      setUrls(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erro ao carregar URLs';
      setError(message);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  async function handleDelete(id: number) {
    if (!credentials) {
      return;
    }
    setDeletingId(id);
    setError('');
    try {
      await deleteShortUrl(id, credentials);
      setUrls((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Erro ao excluir URL';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave(id: number, payload: UpdateUrlPayload) {
    if (!credentials) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateShortUrl(id, payload, credentials);
      setUrls((current) => current.map((item) => (item.id === id ? updated : item)));
      setEditingUrl(null);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Erro ao atualizar URL';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">URLs salvas</h2>
        <p className="text-sm text-slate-600">Visualize, edite ou exclua seus links encurtados.</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-600">Carregando URLs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="space-y-3 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={loadUrls}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && urls.length === 0 && (
          <div className="space-y-2 p-8 text-center">
            <p className="text-sm font-medium text-slate-700">Nenhuma URL salva ainda</p>
            <p className="text-sm text-slate-500">
              Crie seu primeiro link encurtado na pagina de encurtamento.
            </p>
            <Link
              to="/shorten"
              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Encurtar URL
            </Link>
          </div>
        )}

        {!loading && !error && urls.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">URL original</th>
                  <th className="px-4 py-3 font-medium">Encurtada</th>
                  <th className="px-4 py-3 font-medium">Acessos</th>
                  <th className="px-4 py-3 font-medium">Criada em</th>
                  <th className="px-4 py-3 font-medium">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((url) => (
                  <tr key={url.id} className="border-b border-slate-100">
                    <td className="max-w-xs truncate px-4 py-3" title={url.originalUrl}>
                      {url.originalUrl}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={url.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 underline"
                      >
                        {url.shortUrl}
                      </a>
                    </td>
                    <td className="px-4 py-3">{url.accessCount}</td>
                    <td className="px-4 py-3">{formatDate(url.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUrl(url)}
                          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-900"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(url.id)}
                          disabled={deletingId === url.id}
                          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:bg-red-300"
                        >
                          {deletingId === url.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editingUrl && (
        <EditUrlModal
          url={editingUrl}
          loading={saving}
          onClose={() => setEditingUrl(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
