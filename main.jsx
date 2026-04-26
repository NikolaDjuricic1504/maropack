import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './src/App.jsx'
import { ErrorBoundary } from './src/ErrorBoundary.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
