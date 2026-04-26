import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary uhvatio grešku:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 20,
          padding: 24,
          fontFamily: 'system-ui, sans-serif',
          background: '#f1f5f9'
        }}>
          <div style={{fontSize: 72}}>❌</div>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            maxWidth: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{margin: '0 0 12px', color: '#ef4444'}}>Došlo je do greške!</h2>
            <p style={{color: '#64748b', marginBottom: 16}}>
              Aplikacija je naišla na problem. Pokušajte da osvežite stranicu.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#fef2f2',
                padding: 12,
                borderRadius: 8,
                fontSize: 11,
                overflow: 'auto',
                color: '#991b1b',
                border: '1px solid #fecaca'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#1d4ed8',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: 16,
                width: '100%'
              }}
            >
              🔄 Osveži stranicu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
