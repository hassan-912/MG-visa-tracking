import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AppProvider } from './context/AppContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        className: 'toast-custom',
                        style: {
                            background: '#151c2e',
                            color: '#e2e8f0',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                            padding: '12px 16px',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#0a0e1a' },
                        },
                        error: {
                            iconTheme: { primary: '#f43f5e', secondary: '#0a0e1a' },
                        },
                    }}
                />
            </AppProvider>
        </BrowserRouter>
    </React.StrictMode>
)
