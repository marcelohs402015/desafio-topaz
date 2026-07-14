import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UrlForm } from '../components/UrlForm';

describe('UrlForm', () => {
  it('should validate url before submit', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<UrlForm disabled={false} loading={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('URL original'), 'url-invalida');
    await user.click(screen.getByRole('button', { name: 'Gerar encurtador' }));

    expect(screen.getByText('Informe uma URL valida com http:// ou https://')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid url', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<UrlForm disabled={false} loading={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('URL original'), 'https://example.com');
    await user.type(screen.getByLabelText('Alias (opcional)'), 'exemplo');
    await user.click(screen.getByRole('button', { name: 'Gerar encurtador' }));

    expect(onSubmit).toHaveBeenCalledWith({
      originalUrl: 'https://example.com',
      alias: 'exemplo',
    });
  });
});
