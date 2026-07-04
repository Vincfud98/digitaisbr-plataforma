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

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 48 }}>
          <Result
            status="error"
            title="Algo deu errado"
            subTitle={this.state.error?.message || 'Erro inesperado na aplicação.'}
            extra={
              <Button type="primary" onClick={() => this.setState({ hasError: false, error: null })}>
                Tentar novamente
              </Button>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
