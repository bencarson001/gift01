import React from 'react'
import ReactDOM from 'react-dom/client'

// Remove Base44 editor badge for end users
function removeBase44Badge() {
  const elements = document.querySelectorAll('[class*="base44"], [id*="base44"], [href*="base44.com"]');
  elements.forEach(el => el.remove());
  // Also check for the fixed-position badge by text content
  document.querySelectorAll('a, div, button').forEach(el => {
    if (el.textContent?.includes('Edit with Base44')) el.closest('[style*="fixed"]')?.remove() || el.remove();
  });
}
setInterval(removeBase44Badge, 1000);
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)