import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createShortUrl, deleteShortUrl, listShortUrls } from '../services/urlApi';

describe('urlApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should send authorization header on create', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        originalUrl: 'https://example.com',
        shortUrl: 'http://localhost:8080/abc',
        shortCode: 'abc',
        accessCount: 0,
        createdAt: '2026-07-14T00:00:00',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await createShortUrl(
      { originalUrl: 'https://example.com', alias: 'abc' },
      { username: 'admin', password: 'admin' },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/urls',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Basic YWRtaW46YWRtaW4=',
        }),
      }),
    );
  });

  it('should send authorization header on list', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    vi.stubGlobal('fetch', fetchMock);

    await listShortUrls({ username: 'admin', password: 'admin' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/urls',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Basic YWRtaW46YWRtaW4=',
        }),
      }),
    );
  });

  it('should send authorization header on delete', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal('fetch', fetchMock);

    await deleteShortUrl(10, { username: 'admin', password: 'admin' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/urls/10',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Basic YWRtaW46YWRtaW4=',
        }),
      }),
    );
  });
});
