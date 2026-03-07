import { useState, useMemo, memo } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { getCompletionPercentage, PROCESS_STEPS, STEP_STATUSES, getCaseStatus } from '../constants/steps'
import { generateWordReport } from '../services/storage'
import { getCEOSession, getAllAdmins, createAdmin, deleteAdmin } from '../services/auth'
import Stepper from '../components/Stepper'
import DocumentPreview from '../components/DocumentPreview'
import CEOLogin from './CEOLogin'
import {
    HiOutlineSearch, HiOutlineUser, HiOutlineGlobe,
    HiOutlineDocumentText, HiOutlineCollection,
    HiOutlineDownload, HiOutlineShieldCheck,
    HiOutlineViewGrid, HiOutlineLocationMarker,
    HiOutlineTrash, HiOutlineStar, HiOutlineUserAdd,
    HiOutlineCog, HiOutlineX, HiOutlinePencilAlt
} from 'react-icons/hi'

const ListItem = memo(function ListItem({ app, active, onClick, onStar, onDelete }) {
    const pct = getCompletionPercentage(app.steps, app.processType)
    const status = getCaseStatus(app.steps, app.processType)
    const badgeMap = { done: 'badge-success', active: 'badge-info', in_progress: 'badge-neutral' }
    const labelMap = { done: 'Done', active: 'Active', in_progress: 'New' }

    return (
        <div className={`group relative w-full text-left p-3.5 rounded-xl transition-all cursor-pointer ${active
            ? 'bg-accent-indigo/[0.06]' : 'hover:bg-white/[0.03]'}`}
            onClick={onClick}>
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className="text-sm">{app.processType === 'schengen' ? '🇪🇺' : '🇺🇸'}</span>
                    <span className="text-[13px] font-bold">{app.id}</span>
                    {app.starred && <span className="text-amber-400 text-xs">★</span>}
                </div>
                <span className={`badge text-[9px] ${badgeMap[status] || 'badge-neutral'}`}>{labelMap[status] || 'New'}</span>
            </div>
            <p className="text-xs text-text-secondary truncate mb-0.5">{app.employeeName}</p>
            {app.destination && (
                <p className="text-[10px] text-text-muted truncate flex items-center gap-1 mb-2">
                    <HiOutlineLocationMarker className="text-[10px]" /> {app.destination}
                </p>
            )}
            <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-text-muted font-medium">Progress</span>
                <span className="font-bold">{pct}%</span>
            </div>
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-success' : 'bg-accent-indigo'}`} style={{ width: `${pct}%` }} />
            </div>

            {/* Action buttons on hover */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onStar(app.id) }}
                    className={`p-1.5 rounded-lg transition-colors ${app.starred ? 'text-amber-400 bg-amber-400/10' : 'text-text-muted hover:text-amber-400 hover:bg-amber-400/10'}`}
                    title={app.starred ? 'Unstar' : 'Star'}>
                    <HiOutlineStar className="text-xs" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(app.id) }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete case">
                    <HiOutlineTrash className="text-xs" />
                </button>
            </div>
        </div>
    )
})

function InfoCard({ label, value, icon: Icon }) {
    return (
        <div className="p-3.5 rounded-xl bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="text-sm text-text-muted" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-sm font-bold truncate">{value}</p>
        </div>
    )
}

function AdminPanel({ onClose }) {
    const [admins, setAdmins] = useState(() => getAllAdmins())
    const [newUser, setNewUser] = useState('')
    const [newPass, setNewPass] = useState('')
    const [newName, setNewName] = useState('')
    const [newRole, setNewRole] = useState('Admin')

    const handleCreate = () => {
        if (!newUser.trim() || !newPass.trim() || !newName.trim()) {
            toast.error('Please fill all fields'); return
        }
        const result = createAdmin({ username: newUser.trim(), password: newPass.trim(), name: newName.trim(), role: newRole.trim() })
        if (result.error) { toast.error(result.error); return }
        toast.success(`Admin "${newName.trim()}" created`)
        setAdmins(getAllAdmins())
        setNewUser(''); setNewPass(''); setNewName(''); setNewRole('Admin')
    }

    const handleDelete = (username) => {
        const result = deleteAdmin(username)
        if (result.error) { toast.error(result.error); return }
        toast.success('Admin deleted')
        setAdmins(getAllAdmins())
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm anim-fade" onClick={onClose}>
            <div className="card !border-0 bg-dark-900 w-full max-w-lg mx-4 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <HiOutlineCog className="text-lg text-accent-indigo" />
                        <h3 className="text-lg font-bold">Admin Management</h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-text-muted transition-colors">
                        <HiOutlineX className="text-lg" />
                    </button>
                </div>

                {/* Existing Admins */}
                <div className="mb-6">
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Current Admins</p>
                    <div className="space-y-2">
                        {admins.map(a => (
                            <div key={a.username} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
                                <div className="w-8 h-8 rounded-lg bg-accent-indigo/15 flex items-center justify-center text-[10px] font-bold text-accent-indigo">
                                    {a.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">{a.name}</p>
                                    <p className="text-[10px] text-text-muted">{a.role} · @{a.username}</p>
                                </div>
                                {a.isDefault ? (
                                    <span className="badge badge-indigo text-[9px]">Main</span>
                                ) : (
                                    <button onClick={() => handleDelete(a.username)} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors" title="Delete admin">
                                        <HiOutlineTrash className="text-sm" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Create New Admin */}
                <div>
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Create New Admin</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full Name" className="input-field !border-0 !bg-white/[0.04] text-xs" />
                        <input type="text" value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role" className="input-field !border-0 !bg-white/[0.04] text-xs" />
                        <input type="text" value={newUser} onChange={e => setNewUser(e.target.value)} placeholder="Username" className="input-field !border-0 !bg-white/[0.04] text-xs" />
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Password" className="input-field !border-0 !bg-white/[0.04] text-xs" />
                    </div>
                    <button onClick={handleCreate} className="btn-primary w-full text-xs py-2.5">
                        <HiOutlineUserAdd className="text-sm" /> Create Admin
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function CEODashboard() {
    const { applications, deleteApp, deleteAllApps, toggleStarApp } = useAppContext()
    const navigate = useNavigate()
    const [session, setSession] = useState(() => getCEOSession())
    const [searchId, setSearchId] = useState('')
    const [selected, setSelected] = useState(null)
    const [preview, setPreview] = useState(null)
    const [filter, setFilter] = useState('all')
    const [exporting, setExporting] = useState(false)
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

    const list = useMemo(() => {
        let apps = Object.values(applications).sort((a, b) => {
            // Starred first, then by date
            if (a.starred && !b.starred) return -1
            if (!a.starred && b.starred) return 1
            return new Date(b.updatedAt) - new Date(a.updatedAt)
        })
        if (filter !== 'all') apps = apps.filter(a => a.processType === filter)
        if (searchId.trim()) {
            const q = searchId.trim().toLowerCase()
            apps = apps.filter(a => a.id.toLowerCase().includes(q) || a.employeeName.toLowerCase().includes(q))
        }
        return apps
    }, [applications, filter, searchId])

    if (!session) return <CEOLogin onLogin={setSession} />

    const download = async (app) => {
        setExporting(true)
        try { await generateWordReport(app, PROCESS_STEPS) }
        catch (err) { console.error('Export failed:', err) }
        setExporting(false)
    }

    const handleDeleteCase = (id) => {
        if (selected?.id === id) setSelected(null)
        deleteApp(id)
        toast.success('Case deleted')
    }

    const handleDeleteAll = () => {
        deleteAllApps()
        setSelected(null)
        setConfirmDeleteAll(false)
        toast.success('All cases deleted')
    }

    const handleStar = (id) => {
        toggleStarApp(id)
    }

    const editCase = (app) => navigate(`/employee?id=${app.id}`)

    const pct = selected ? getCompletionPercentage(selected.steps, selected.processType) : 0
    const getCounts = (app) => {
        const defs = PROCESS_STEPS[app.processType] || []
        let c = 0, w = 0, p = 0
        defs.forEach(s => { const st = app.steps[s.key]?.status || 'pending'; if (st === 'complete') c++; else if (['waiting_client', 'waiting_translation', 'in_progress'].includes(st)) w++; else p++ })
        return { c, w, p }
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 anim-fade">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight mb-0.5">Admin Dashboard</h2>
                    <p className="text-sm text-text-secondary">Track and manage all visa processing cases</p>
                </div>
                <div className="flex items-center gap-2">
                    {selected && (
                        <div className="flex items-center gap-2 border-r border-white/[0.06] pr-3 mr-1">
                            <button onClick={() => editCase(selected)} className="btn-ghost !text-accent-indigo text-xs flex items-center gap-1 font-bold">
                                <HiOutlinePencilAlt className="text-sm" /> Edit
                            </button>
                            <button onClick={() => download(selected)} disabled={exporting} className="btn-ghost text-xs disabled:opacity-50">
                                {exporting ? (
                                    <><span className="w-3 h-3 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" /> Exporting...</>
                                ) : (
                                    <><HiOutlineDownload className="text-sm" /> Export .docx</>
                                )}
                            </button>
                            <button onClick={() => handleDeleteCase(selected.id)} className="btn-ghost text-xs flex items-center gap-1 text-danger/70 hover:text-danger">
                                <HiOutlineTrash className="text-sm" /> Delete Case
                            </button>
                        </div>
                    )}
                    <button onClick={() => setShowAdminPanel(true)} className="btn-ghost text-xs flex items-center gap-1.5 font-bold">
                        <HiOutlineCog className="text-sm" /> Admins
                    </button>
                </div>
            </div>

            {/* Layout */}
            <div className="grid lg:grid-cols-12 gap-5 items-start">
                {/* Sidebar */}
                <aside className="lg:col-span-4 lg:sticky lg:top-20">
                    <div className="card !border-0 p-4 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <HiOutlineCollection className="text-accent-indigo text-sm" /> Cases
                            </h3>
                            <span className="badge badge-neutral text-[10px]">{list.length}</span>
                        </div>

                        {/* Search + Filter */}
                        <div className="relative mb-3">
                            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
                            <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
                                placeholder="Search ID or name..."
                                className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-indigo/30 transition-all" />
                        </div>

                        <div className="flex gap-1 mb-3">
                            {[{ v: 'all', l: 'All' }, { v: 'schengen', l: '🇪🇺 EU' }, { v: 'usa', l: '🇺🇸 US' }].map(f => (
                                <button key={f.v} onClick={() => setFilter(f.v)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${filter === f.v ? 'bg-accent-indigo/12 text-accent-indigo' : 'text-text-muted hover:text-text-secondary'}`}>
                                    {f.l}
                                </button>
                            ))}
                        </div>

                        {list.length === 0 ? (
                            <div className="py-10 text-center">
                                <HiOutlineDocumentText className="text-xl mx-auto text-text-muted mb-2 opacity-40" />
                                <p className="text-xs text-text-muted">No cases found</p>
                            </div>
                        ) : (
                            <div className="space-y-1 max-h-[calc(100dvh-240px)] overflow-y-auto pr-1">
                                {list.map(app => (
                                    <ListItem key={app.id} app={app} active={selected?.id === app.id}
                                        onClick={() => { setSelected(app); setSearchId('') }}
                                        onStar={handleStar} onDelete={handleDeleteCase} />
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main */}
                <main className="lg:col-span-8 space-y-5">
                    {selected ? (
                        <div className="space-y-4 anim-fade">
                            {/* Info row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <InfoCard label="Odoo ID" value={selected.id} icon={HiOutlineShieldCheck} />
                                <InfoCard label="Category" value={selected.processType === 'schengen' ? '🇪🇺 Schengen' : '🇺🇸 USA'} icon={HiOutlineGlobe} />
                                <InfoCard label="Assigned To" value={selected.employeeName} icon={HiOutlineUser} />
                                <InfoCard label="Destination" value={selected.destination || '—'} icon={HiOutlineLocationMarker} />
                            </div>

                            {/* Progress */}
                            <div className="card !border-0 p-5 bg-white/[0.02]">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-sm font-bold">Progress Summary</h3>
                                </div>

                                <div className="grid grid-cols-4 gap-3 items-center">
                                    <div className="flex flex-col items-center">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="50%" cy="50%" r="35%" stroke="rgba(255,255,255,0.04)" strokeWidth="5" fill="none" />
                                                <circle cx="50%" cy="50%" r="35%" stroke="url(#g)" strokeWidth="5" fill="none" strokeLinecap="round"
                                                    strokeDasharray="220" strokeDashoffset={220 - (220 * pct) / 100} className="transition-all duration-1000" />
                                                <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c83f7" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-lg font-extrabold">{pct}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    {(() => {
                                        const ct = getCounts(selected); return (<>
                                            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                                                <p className="text-[10px] font-bold text-success uppercase mb-0.5">Done</p>
                                                <p className="text-xl font-extrabold">{ct.c}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                                                <p className="text-[10px] font-bold text-warning uppercase mb-0.5">Waiting</p>
                                                <p className="text-xl font-extrabold">{ct.w}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white/[0.03] text-center">
                                                <p className="text-[10px] font-bold text-text-muted uppercase mb-0.5">Pending</p>
                                                <p className="text-xl font-extrabold">{ct.p}</p>
                                            </div>
                                        </>)
                                    })()}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="card !border-0 p-5 bg-white/[0.02]">
                                <h3 className="text-sm font-bold mb-4">Step Timeline</h3>
                                <Stepper processType={selected.processType} steps={selected.steps} onPreview={setPreview} showInline={true} />
                            </div>
                        </div>
                    ) : (
                        <div className="card !border-0 p-14 text-center bg-white/[0.02] anim-fade flex flex-col items-center justify-center min-h-[50dvh]">
                            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                                <HiOutlineViewGrid className="text-2xl text-text-muted" />
                            </div>
                            <h3 className="text-base font-bold mb-1.5">Select a Case</h3>
                            <p className="text-sm text-text-secondary max-w-xs mx-auto">Pick a case from the sidebar or use the search bar to find one.</p>
                        </div>
                    )}
                </main>
            </div>

            {preview && <DocumentPreview stepData={preview} onClose={() => setPreview(null)} />}
            {showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} />}
        </div>
    )
}
