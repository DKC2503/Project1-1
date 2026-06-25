import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log("[MAIN] Entry point reached");

const container = document.getElementById('root');
if (!container) {
  console.error("[MAIN] Root container not found!");
} else {
  console.log("[MAIN] Root container found, mounting app...");
  createRoot(container).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
