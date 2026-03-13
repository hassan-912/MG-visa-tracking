import { useState, useRef, useEffect, useMemo } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineChartBar, HiOutlineLogout, HiOutlineSearch } from 'react-icons/hi'
import { getCEOSession, logoutCEO } from '../services/auth'
import { useAppContext } from '../context/AppContext'

export default function Navbar() {
    const session = getCEOSession()
    const navigate = useNavigate()
    const location = useLocation()
    const { applications } = useAppContext()
    const [query, setQuery] = useState('')
    const [showResults, setShowResults] = useState(false)
    const searchRef = useRef(null)

    const isHome = location.pathname === '/'

    const results = useMemo(() => {
        if (!query.trim()) return []
        const q = query.trim().toLowerCase()
        return Object.values(applications).filter(a =>
            a.id.toLowerCase().includes(q) || a.employeeName.toLowerCase().includes(q)
        ).slice(0, 6)
    }, [query, applications])

    useEffect(() => {
        const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Clear search when navigating away from home
    useEffect(() => { if (!isHome) { setQuery(''); setShowResults(false) } }, [isHome])

    const selectResult = (app) => {
        setQuery(''); setShowResults(false)
        // Dispatch custom event so HomePage can open the preview modal
        window.dispatchEvent(new CustomEvent('openCasePreview', { detail: { id: app.id } }))
    }

    const link = ({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive
            ? 'bg-accent-indigo/12 text-accent-indigo'
            : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
        }`

    return (
        <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-dark-950/85 backdrop-blur-2xl">
            <div className="w-full max-w-7xl mx-auto px-6 h-[60px] flex items-center justify-between gap-4">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-3 group flex-shrink-0">
                    <img src="/mg-logo.png" alt="MG" className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-accent-indigo/20 group-hover:scale-105 transition-transform" />
                    <span className="text-sm font-bold tracking-tight hidden sm:block">
                        MG<span className="text-accent-indigo ml-0.5">Tracking</span>
                    </span>
                </NavLink>

                {/* Search — only on home screen */}
                {isHome && (
                    <div className="relative flex-1 max-w-xs hidden md:block" ref={searchRef}>
                        <HiOutlineSearch strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                        <input
                            type="text" value={query}
                            onChange={e => { setQuery(e.target.value); setShowResults(true) }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Search by ID or name..."
                            className="w-full h-9 pl-9 pr-4 rounded-xl bg-white/[0.04] text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-indigo/30 transition-all"
                            autoComplete="off"
                        />
                        {showResults && results.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-dark-800 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden border border-white/[0.06]">
                                {results.map(app => (
                                    <button key={app.id} onClick={() => selectResult(app)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors flex items-center gap-3">
                                        <span className="text-sm">{app.processType === 'schengen' ? '🇪🇺' : '🇺🇸'}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-text-primary truncate">{app.id}</p>
                                            <p className="text-[10px] text-text-muted truncate">{app.employeeName}</p>
                                        </div>
                                        {app.starred && <span className="text-amber-400 text-xs">★</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center gap-1">
                    <NavLink to="/" end className={link}>
                        <HiOutlineHome className="text-[15px]" />
                        <span className="hidden sm:inline">Home</span>
                    </NavLink>
                    <NavLink to="/employee" className={link}>
                        <HiOutlineUserGroup className="text-[15px]" />
                        <span className="hidden sm:inline">Portal</span>
                    </NavLink>
                    <NavLink to="/dashboard" className={link}>
                        <HiOutlineChartBar className="text-[15px]" />
                        <span className="hidden sm:inline">Admin</span>
                    </NavLink>

                    {session && location.pathname === '/dashboard' && (
                        <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/[0.06]">
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-accent-indigo/15 flex items-center justify-center text-[10px] font-bold text-accent-indigo">
                                    {session.avatar}
                                </div>
                                <span className="text-xs font-medium text-text-secondary">{session.name}</span>
                            </div>
                            <button
                                onClick={() => { logoutCEO(); navigate('/') }}
                                className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                                title="Logout"
                            >
                                <HiOutlineLogout className="text-[15px]" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
