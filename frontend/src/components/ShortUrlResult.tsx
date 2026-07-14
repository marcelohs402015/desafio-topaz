import { useState } from 'react';
import type { UrlResponse } from '../types/url';

interface ShortUrlResultProps {
  result: UrlResponse;
  deleting: boolean;
  onDelete: (id: number) => void;
}

export function ShortUrlResult({ result, deleting, onDelete }: ShortUrlResultProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
      <p className="text-sm font-medium text-green-800">URL encurtada gerada</p>
      <a
        href={result.shortUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block break-all text-blue-700 underline"
      >
        {result.shortUrl}
      </a>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Abrir link
        </a>
        <button
          type="button"
          onClick={() => onDelete(result.id)}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:bg-red-300"
        >
          {deleting ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>
    </div>
  );
}
