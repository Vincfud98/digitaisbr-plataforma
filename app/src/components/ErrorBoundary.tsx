import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Result, Button } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function isChunkLoadError(error: Error): boolean {
  const msg = error.message || '';
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('ChunkLoadError') ||
    (error.name === 'TypeError' && msg.includes('Failed to fetch'))
  );
}

const RELOAD_KEY = 'digitaisbr_chunk_reload';

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);

    if (isChunkLoadError(error)) {
      const last = sessionStorage.getItem(RELOAD_KEY);
      const now = Date.now();
      if (!last || now - Number(last) > 10000) {
        sessionStorage.setItem(RELOAD_KEY, String(now));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.error ? isChunkLoadError(this.state.error) : false;
      return (
        <div style={{ padding: 48 }}>
          <Result
            status="error"
            title="Algo deu errado"
            subTitle={
              isChunk
                ? 'Uma nova versão da plataforma foi publicada. Recarregue a página para continuar.'
                : (this.state.error?.message || 'Erro inesperado na aplicação.')
            }
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Recarregar página
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
