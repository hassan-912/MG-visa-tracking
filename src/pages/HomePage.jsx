import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getCompletionPercentage, getCaseStatus, PROCESS_STEPS, STEP_STATUSES } from '../constants/steps'
import {
    HiOutlineUsers, HiOutlineCheckCircle, HiOutlineClock,
    HiOutlineLightningBolt, HiArrowRight, HiOutlineGlobe,
    HiOutlineLocationMarker, HiOutlineX, HiOutlinePencilAlt,
    HiOutlineDocumentText
} from 'react-icons/hi'

function StatCard({ label, value, icon: Icon, gradient, delay, active, onClick }) {
    return (
        <button onClick={onClick}
            className={`group card !border-0 p-6 text-center anim-fade hover:scale-[1.03] hover:shadow-lg hover:shadow-accent-indigo/5 transition-all duration-300 w-full cursor-pointer bg-white/[0.02] ${active ? 'ring-2 ring-accent-indigo/40 bg-accent-indigo/[0.04]' : ''}`}
            style={{ animationDelay: `${delay}ms` }}>
            <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="text-xl text-white" />
            </div>
            <p className="text-4xl font-extrabold text-text-primary mb-1 tracking-tight">{value}</p>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">{label}</p>
        </button>
    )
}

function RecentCard({ app, onEdit }) {
    const pct = getCompletionPercentage(app.steps, app.processType)
    const status = getCaseStatus(app.steps, app.processType)

    // Case decision tags
    const decisionMap = { under_processing: { label: 'Processing', color: 'badge-warning' }, accepted: { label: 'Accepted', color: 'badge-success' }, refused: { label: 'Refused', color: 'badge-danger' } }
    const statusMap = { done: 'badge-success', active: 'badge-info', in_progress: 'badge-neutral' }
    const dec = decisionMap[app.decision || 'under_processing']

    return (
        <div className="card !border-0 bg-white/[0.02] hover:bg-white/[0.04] p-5 flex flex-col justify-between group transition-all hover:scale-[1.02] cursor-pointer relative" onClick={() => onEdit(app)}>
            {app.previewRequested && (
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-dark-900 shadow-[0_0_8px_rgba(245,158,11,0.5)] z-10" title="Preview Requested by Admin" />
            )}
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-indigo/15 to-accent-violet/15 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                    {app.processType === 'schengen' ? '🇪🇺' : app.processType === 'usa' ? '🇺🇸' : app.processType === 'uk' ? '🇬🇧' : '🇨🇦'}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge text-[9px] ${statusMap[status] || 'badge-neutral'}`}>{status === 'done' ? 'Done' : status === 'active' ? 'Active' : 'New'}</span>
                    <span className={`badge text-[8px] ${dec.color}`}>{dec.label}</span>
                </div>
            </div>

            <div className="mb-4 flex-1">
                <h3 className="text-sm font-bold text-text-primary mb-1 truncate flex items-center gap-1.5">
                    {app.id} {app.starred && <span className="text-amber-400 text-xs text-shadow-sm leading-none">★</span>}
                </h3>
                <p className="text-xs text-text-secondary truncate">{app.employeeName}</p>
                {app.destination && (
                    <p className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1 truncate">
                        <HiOutlineLocationMarker className="text-[10px] flex-shrink-0" /> {app.destination}
                    </p>
                )}
            </div>

            <div className="mt-auto">
                {app.processType !== 'uk' && app.processType !== 'canada' && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-success' : 'bg-accent-indigo'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-text-primary w-8 text-right">{pct}%</span>
                    </div>
                )}
                {(app.processType === 'uk' || app.processType === 'canada') && (
                    <div className="text-[10px] text-warning/80 font-medium italic">Under Development</div>
                )}
            </div>
        </div>
    )
}

// Case Preview Modal — shows case status, steps, files, with ability to edit
function CasePreviewModal({ app, onClose, onGoEdit }) {
    if (!app) return null
    const pct = getCompletionPercentage(app.steps, app.processType)
    const status = getCaseStatus(app.steps, app.processType)
    const defs = PROCESS_STEPS[app.processType] || []
    const statusLabelMap = { done: 'Completed', active: 'Active', in_progress: 'In Progress' }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm anim-fade" onClick={onClose}>
            <div className="bg-dark-900 w-full max-w-xl mx-4 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{app.processType === 'schengen' ? '🇪🇺' : '🇺🇸'}</span>
                        <div>
                            <h3 className="text-base font-bold">{app.id}</h3>
                            <p className="text-xs text-text-muted">{app.employeeName}{app.destination ? ` · ${app.destination}` : ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onGoEdit} className="text-xs font-semibold text-accent-indigo hover:text-accent-indigo/80 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-accent-indigo/10">
                            <HiOutlinePencilAlt className="text-xs" /> Edit in Portal
                        </button>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-text-muted transition-colors">
                            <HiOutlineX className="text-lg" />
                        </button>
                    </div>
                </div>

                {/* Progress summary */}
                <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-text-muted font-medium">Overall Progress</span>
                            <span className="font-bold text-text-primary">{pct}%</span>
                        </div>
                        <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-success' : 'bg-accent-indigo'}`} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                    <span className={`badge text-[10px] ${status === 'done' ? 'badge-success' : status === 'active' ? 'badge-info' : 'badge-warning'}`}>
                        {statusLabelMap[status] || 'New'}
                    </span>
                </div>

                {/* Steps list */}
                <div className="px-6 py-4 max-h-[50vh] overflow-y-auto space-y-2">
                    {defs.map(def => {
                        const step = app.steps[def.key] || { status: 'pending' }
                        const st = STEP_STATUSES[step.status] || STEP_STATUSES.pending
                        const colorMap = { success: 'text-success', warning: 'text-warning', info: 'text-info', indigo: 'text-accent-indigo', neutral: 'text-text-muted' }

                        return (
                            <div key={def.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02]">
                                <span className="text-lg">{def.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{def.label}</p>
                                    <p className={`text-[10px] font-semibold ${colorMap[st.color] || 'text-text-muted'}`}>{st.label}</p>
                                </div>
                                {step.fileName && (
                                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                        <HiOutlineDocumentText className="text-xs" />
                                        <span className="truncate max-w-[100px]">{step.fileName}</span>
                                    </div>
                                )}
                                {step.followerName && (
                                    <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                        <span className="text-xs">👤</span>
                                        <span className="truncate max-w-[100px]">{step.followerName}</span>
                                    </div>
                                )}
                                {step.note && (
                                    <span className="text-[10px] text-text-muted italic truncate max-w-[80px]">{step.note}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default function HomePage() {
    const { applications } = useAppContext()
    const navigate = useNavigate()
    const [visaFilter, setVisaFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState(null)
    const [previewApp, setPreviewApp] = useState(null)

    const allApps = useMemo(() => Object.values(applications), [applications])

    // Listen for search result selection from Navbar
    useEffect(() => {
        const handler = (e) => {
            const app = applications[e.detail.id]
            if (app) setPreviewApp(app)
        }
        window.addEventListener('openCasePreview', handler)
        return () => window.removeEventListener('openCasePreview', handler)
    }, [applications])

    const filtered = useMemo(() => {
        let apps = allApps
        if (visaFilter !== 'all') apps = apps.filter(a => a.processType === visaFilter)
        if (statusFilter) apps = apps.filter(a => getCaseStatus(a.steps, a.processType) === statusFilter)
        return apps
    }, [allApps, visaFilter, statusFilter])

    const stats = useMemo(() => {
        let apps = allApps
        if (visaFilter !== 'all') apps = apps.filter(a => a.processType === visaFilter)
        let inProgress = 0, active = 0, done = 0
        apps.forEach(app => {
            const s = getCaseStatus(app.steps, app.processType)
            if (s === 'done') done++
            else if (s === 'active') active++
            else inProgress++
        })
        return { total: apps.length, inProgress, active, done }
    }, [allApps, visaFilter])

    const recent = useMemo(() =>
        [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 10),
        [filtered]
    )

    const toggleStatus = (status) => setStatusFilter(prev => prev === status ? null : status)
    const editCase = (app) => navigate(`/employee?id=${app.id}`)

    const filterOptions = [
        { value: 'all', label: 'All' },
        { value: 'schengen', label: '🇪🇺 Schengen' },
        { value: 'usa', label: '🇺🇸 USA' },
        { value: 'uk', label: '🇬🇧 UK' },
        { value: 'canada', label: '🇨🇦 Canada' },
    ]

    return (
        <div className="w-full flex-1 flex flex-col justify-center">
            {/* Hero + Filter Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 anim-fade">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-indigo/8 border border-accent-indigo/12 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                        <span className="text-[11px] font-semibold text-accent-indigo uppercase tracking-widest">Dashboard</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1.5 gradient-text">MG Tracking</h1>
                    <p className="text-sm text-text-secondary max-w-md leading-relaxed">Monitor all visa applications in real-time.</p>
                </div>

                {/* Visa Type Filter — right side */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] rounded-xl p-1">
                    {filterOptions.map(f => (
                        <button key={f.value} onClick={() => setVisaFilter(f.value)}
                            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${visaFilter === f.value
                                ? 'bg-accent-indigo/15 text-accent-indigo shadow-sm' : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04]'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Clients" value={stats.total} icon={HiOutlineUsers} gradient="bg-gradient-to-br from-accent-indigo to-accent-violet shadow-accent-indigo/20" delay={100} active={statusFilter === null} onClick={() => setStatusFilter(null)} />
                <StatCard label="In Progress" value={stats.inProgress} icon={HiOutlineClock} gradient="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20" delay={180} active={statusFilter === 'in_progress'} onClick={() => toggleStatus('in_progress')} />
                <StatCard label="Active" value={stats.active} icon={HiOutlineLightningBolt} gradient="bg-gradient-to-br from-accent-cyan to-blue-500 shadow-accent-cyan/20" delay={260} active={statusFilter === 'active'} onClick={() => toggleStatus('active')} />
                <StatCard label="Completed" value={stats.done} icon={HiOutlineCheckCircle} gradient="bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/20" delay={340} active={statusFilter === 'done'} onClick={() => toggleStatus('done')} />
            </div>

            {/* Recent Applications */}
            <div className="anim-fade" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-bold flex items-center gap-2">
                        {statusFilter ? (
                            <>{statusFilter === 'done' ? 'Completed' : statusFilter === 'active' ? 'Active' : 'In Progress'} Cases
                                <button onClick={() => setStatusFilter(null)} className="text-[10px] text-accent-indigo hover:underline font-medium ml-1">Clear</button>
                            </>
                        ) : 'Recent Applications'}
                        {visaFilter !== 'all' && <span className="badge badge-neutral text-[9px]">{visaFilter === 'schengen' ? '🇪🇺 Schengen' : '🇺🇸 USA'}</span>}
                    </h2>
                    <Link to="/dashboard" className="btn-ghost text-xs group flex items-center gap-1.5">
                        View All <HiArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>

                {recent.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {recent.map(app => <RecentCard key={app.id} app={app} onEdit={editCase} />)}
                    </div>
                ) : (
                    <div className="card !border-0 p-16 text-center bg-white/[0.02]">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
                            <HiOutlineGlobe className="text-3xl text-text-muted" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">
                            {statusFilter ? `No ${statusFilter === 'done' ? 'Completed' : statusFilter === 'active' ? 'Active' : 'In Progress'} Cases`
                                : visaFilter !== 'all' ? `No ${visaFilter === 'schengen' ? 'Schengen' : 'USA'} Cases` : 'No Applications Yet'}
                        </h3>
                        <p className="text-sm text-text-secondary mb-6 max-w-sm mx-auto leading-relaxed">
                            {statusFilter || visaFilter !== 'all' ? 'Try adjusting your filters or create a new case.' : 'Create your first visa case to get started.'}
                        </p>
                        {!statusFilter && visaFilter === 'all' && (
                            <Link to="/employee" className="btn-primary text-sm inline-flex items-center gap-2">
                                <HiOutlineLightningBolt className="text-base" /> Create First Case
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Case Preview Modal — opens from search or quick view */}
            {previewApp && (
                <CasePreviewModal
                    app={previewApp}
                    onClose={() => setPreviewApp(null)}
                    onGoEdit={() => { setPreviewApp(null); editCase(previewApp) }}
                />
            )}
        </div>
    )
}
