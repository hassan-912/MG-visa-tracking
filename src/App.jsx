import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/Navbar'

const HomePage = lazy(() => import('./pages/HomePage'))
const EmployeePortal = lazy(() => import('./pages/EmployeePortal'))
const CEODashboard = lazy(() => import('./pages/CEODashboard'))

function Loader() {
    return (
        <div className="flex items-center justify-center min-h-[60dvh]">
            <div className="w-6 h-6 border-2 border-dark-700 border-t-accent-indigo rounded-full animate-spin" />
        </div>
    )
}

export default function App() {
    return (
        <div className="min-h-dvh flex flex-col">
            <Navbar />
            <main className="flex-1 flex flex-col items-center w-full px-6 py-8 safe-bottom">
                <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col">
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/employee" element={<EmployeePortal />} />
                            <Route path="/dashboard" element={<CEODashboard />} />
                        </Routes>
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
