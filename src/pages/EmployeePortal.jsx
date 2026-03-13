import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import { PROCESS_STEPS, getDefaultSteps, NON_UPLOAD_STATUSES } from '../constants/steps'
import FileUpload from '../components/FileUpload'
import {
    HiOutlineUser, HiOutlineIdentification, HiOutlineGlobe,
    HiOutlineSave, HiOutlineLocationMarker, HiOutlineChevronDown,
    HiOutlineDocumentAdd, HiOutlinePencilAlt, HiOutlineLink, HiOutlineExclamationCircle
} from 'react-icons/hi'

const StepCard = memo(function StepCard({ stepDef, stepData, statusValue, noteValue, onFile, onStatusChange, onNote, onFollowerName }) {
    const done = stepData.status === 'complete'
    const isWaiting = ['waiting_client', 'waiting_translation', 'in_progress'].includes(stepData.status)

    const bgMap = {
        complete: 'bg-success/[0.03]',
        waiting_client: 'bg-warning/[0.03]',
        waiting_translation: 'bg-info/[0.03]',
        in_progress: 'bg-accent-indigo/[0.03]',
    }

    const statusTextMap = {
        complete: { text: 'Complete', color: 'text-success' },
        waiting_client: { text: 'Waiting for Client', color: 'text-warning' },
        waiting_translation: { text: 'Waiting for Translation', color: 'text-info' },
        in_progress: { text: 'In Progress', color: 'text-accent-indigo' },
        pending: { text: 'Pending', color: 'text-text-muted' },
    }

    const st = statusTextMap[stepData.status] || statusTextMap.pending

    // Helper to simulate file object for custom inputs
    const [file, setFile] = useState(() => {
        if (stepData.fileName && stepData.fileData) {
            return new File([stepData.fileData], stepData.fileName, { type: stepData.fileType });
        }
        return null;
    });

    useEffect(() => {
        if (file) {
            onFile(stepDef.key, file.name, file.name, file.type); // For custom inputs, fileData and fileType can be simplified
        } else if (stepData.fileName && stepData.fileData) {
            setFile(new File([stepData.fileData], stepData.fileName, { type: stepData.fileType }));
        } else {
            setFile(null);
        }
    }, [file, stepDef.key, onFile, stepData.fileName, stepData.fileData, stepData.fileType]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            onFile(stepDef.key, selectedFile.name, selectedFile, selectedFile.type);
        } else {
            setFile(null);
            onFile(stepDef.key, null, null, null);
        }
    };

    return (
        <div className={`p-5 rounded-2xl transition-all duration-300 ${bgMap[stepData.status] || 'bg-white/[0.015] hover:bg-white/[0.03]'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all ${done ? 'bg-success/10' : 'bg-white/[0.05]'}`}>
                    {stepDef.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate mb-0.5">{stepDef.label}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${st.color}`}>
                        {st.text}
                    </span>
                </div>
                {done && (
                    <div className="w-7 h-7 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.1 h-3.1 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                )}
            </div>

            <div className={`grid grid-cols-1 gap-3 ${stepDef.key === 'employee_follow_up' ? '' : 'sm:grid-cols-2'}`}>
                {stepDef.key === 'employee_follow_up' ? (
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Follower Name</p>
                        <input
                            type="text"
                            list="followers-list"
                            value={stepData.followerName || ''}
                            onChange={e => onFollowerName(stepDef.key, e.target.value)}
                            placeholder="Type or select name..."
                            className="input-field text-xs !border-0 !bg-white/[0.04]"
                        />
                        <datalist id="followers-list">
                            <option value="Hussin" />
                            <option value="Moustafa El-Tawil" />
                        </datalist>
                    </div>
                ) : (
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Upload Document</p>
                        <FileUpload onFileSelect={(n, d, t) => onFile(stepDef.key, n, d, t)} currentFileName={stepData.fileName} />
                    </div>
                )}
                {stepDef.key !== 'employee_follow_up' && (
                    <div>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Status</p>
                        <div className="relative">
                            <select value={statusValue || ''} onChange={(e) => onStatusChange(stepDef.key, e.target.value)} className="input-field !appearance-none cursor-pointer pr-8 text-xs !border-0 !bg-white/[0.04]" disabled={done}>
                                <option value="">Select status...</option>
                                {NON_UPLOAD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                            </select>
                            <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {isWaiting && (
                <div className="mt-4 pt-4 border-t border-white/[0.04] anim-slide">
                    <label className="text-[11px] font-bold text-text-secondary mb-1.5 block">Notes</label>
                    <textarea value={noteValue} onChange={e => onNote(stepDef.key, e.target.value)} placeholder="Additional details..." rows={2} className="input-field text-sm resize-none !border-0 !bg-white/[0.04]" />
                </div>
            )}
        </div>
    )
})

export default function EmployeePortal() {
    const { applications, saveApp } = useAppContext()
    const [searchParams] = useSearchParams()
    const [name, setName] = useState('')
    const [odooId, setOdooId] = useState(() => searchParams.get('id') || '')
    const [destination, setDestination] = useState('')
    const [procType, setProcType] = useState('schengen')
    const [whatsappLink, setWhatsappLink] = useState('')
    const [decision, setDecision] = useState('under_processing')
    const [previewRequested, setPreviewRequested] = useState(false)
    const [steps, setSteps] = useState({})
    const [isUpdate, setIsUpdate] = useState(false)
    const [notes, setNotes] = useState({})
    const [statuses, setStatuses] = useState({})
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestRef = useRef(null)

    // Search suggestions
    useEffect(() => {
        if (odooId.trim().length > 0) {
            const q = odooId.trim().toLowerCase()
            const matches = Object.values(applications).filter(a =>
                a.id.toLowerCase().includes(q) || a.employeeName.toLowerCase().includes(q)
            ).slice(0, 5)
            setSuggestions(matches)
        } else {
            setSuggestions([])
        }
    }, [odooId, applications])

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => { if (suggestRef.current && !suggestRef.current.contains(e.target)) setShowSuggestions(false) }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        if (odooId.trim()) {
            const ex = applications[odooId.trim()]
            if (ex) {
                setIsUpdate(true); setName(ex.employeeName); setDestination(ex.destination || ''); setProcType(ex.processType); setSteps(ex.steps)
                setWhatsappLink(ex.whatsappLink || '')
                setDecision(ex.decision || 'under_processing')
                setPreviewRequested(ex.previewRequested || false)
                const s = {}, n = {}
                Object.entries(ex.steps).forEach(([k, st]) => {
                    if (['waiting_client', 'waiting_translation', 'in_progress'].includes(st.status)) { s[k] = st.status; n[k] = st.note || '' }
                })
                setStatuses(s); setNotes(n)
            } else { setIsUpdate(false); setSteps(getDefaultSteps(procType)); setStatuses({}); setNotes({}); setWhatsappLink(''); setDecision('under_processing'); setPreviewRequested(false) }
        } else { setIsUpdate(false) }
    }, [odooId, applications, procType])

    useEffect(() => { if (!isUpdate) { setSteps(getDefaultSteps(procType)); setStatuses({}); setNotes({}); setWhatsappLink(''); setDecision('under_processing'); setPreviewRequested(false) } }, [procType])

    const selectSuggestion = (app) => {
        setOdooId(app.id)
        setShowSuggestions(false)
    }

    const onFile = useCallback((k, fn, fd, ft) => {
        setSteps(p => ({ ...p, [k]: { ...p[k], status: 'complete', fileName: fn, fileData: fd, fileType: ft, note: null, updatedAt: new Date().toISOString() } }))
        setStatuses(p => ({ ...p, [k]: '' })); setNotes(p => ({ ...p, [k]: '' }))
    }, [])

    const onStatusChange = useCallback((k, v) => {
        if (!v) { setSteps(p => ({ ...p, [k]: { ...p[k], status: 'pending', note: null, updatedAt: null } })); setStatuses(p => ({ ...p, [k]: '' })); setNotes(p => ({ ...p, [k]: '' })); return }
        setStatuses(p => ({ ...p, [k]: v }))
        setSteps(p => ({ ...p, [k]: { ...p[k], status: v, fileName: null, fileData: null, fileType: null, note: notes[k] || '', updatedAt: new Date().toISOString() } }))
    }, [notes])

    const onNote = useCallback((k, v) => {
        setNotes(p => ({ ...p, [k]: v }))
        setSteps(p => ({ ...p, [k]: { ...p[k], note: v, updatedAt: new Date().toISOString() } }))
    }, [])

    const onFollowerName = useCallback((k, v) => {
        setSteps(p => ({ ...p, [k]: { ...p[k], followerName: v, status: v.trim() ? 'complete' : 'pending', updatedAt: new Date().toISOString() } }))
    }, [])

    const submit = (e) => {
        e.preventDefault()
        if (!name.trim() || !odooId.trim()) { toast.error('Please fill in all required fields'); return }
        const appPayload = { id: odooId.trim(), employeeName: name.trim(), destination: destination.trim(), processType: procType, whatsappLink: whatsappLink.trim(), decision, steps }
        if (isUpdate && applications[odooId.trim()]?.previewRequested && previewRequested) {
            appPayload.previewRequested = true
        }
        saveApp(appPayload)
        toast.success(isUpdate ? 'Case updated successfully!' : 'New case created!')
        if (!isUpdate) { setOdooId(''); setName(''); setDestination(''); setSteps(getDefaultSteps(procType)); setStatuses({}); setNotes({}); setWhatsappLink(''); setDecision('under_processing'); setPreviewRequested(false) }
    }

    const defs = PROCESS_STEPS[procType] || []

    const visaOptions = [
        { value: 'schengen', label: 'Schengen (EU Tourism)', icon: '🇪🇺' },
        { value: 'usa', label: 'USA (Tourism)', icon: '🇺🇸' },
        { value: 'uk', label: 'UK (Under Dev)', icon: '🇬🇧' },
        { value: 'canada', label: 'Canada (Under Dev)', icon: '🇨🇦' },
    ]

    return (
        <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-8 anim-fade">
                {isUpdate && previewRequested && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3 anim-slide">
                        <HiOutlineExclamationCircle className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-500 mb-1">Preview Requested</h4>
                            <p className="text-xs text-amber-500/80">The Admin has requested a preview of this case. Please ensure all details and the WhatsApp Group link are up to date.</p>
                        </div>
                    </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-indigo/8 border border-accent-indigo/12 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo animate-pulse" />
                    <span className="text-[11px] font-semibold text-accent-indigo uppercase tracking-widest">Employee Portal</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1.5 gradient-text">Case Management</h2>
                <p className="text-sm text-text-secondary max-w-md">Create and manage visa application cases</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {/* Case Details Card */}
                <div className="card !border-0 p-7 bg-white/[0.02] anim-fade" style={{ animationDelay: '100ms' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 flex items-center justify-center">
                            <HiOutlineIdentification className="text-lg text-accent-indigo" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-base font-bold">Case Details</h3>
                            <p className="text-[11px] text-text-muted">Fill in the required information</p>
                        </div>
                        {isUpdate && (
                            <span className="badge badge-indigo text-[10px] flex items-center gap-1">
                                <HiOutlinePencilAlt className="text-[10px]" /> Editing
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5 relative" ref={suggestRef}>
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Client Name (ID) *</label>
                            <input
                                type="text" value={odooId}
                                onChange={e => { setOdooId(e.target.value); setShowSuggestions(true) }}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Search by ID or name..."
                                className={`input-field !border-0 !bg-white/[0.04] ${isUpdate ? '!bg-accent-indigo/[0.06]' : ''}`}
                                autoComplete="off"
                            />
                            {showSuggestions && suggestions.length > 0 && !isUpdate && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 rounded-xl shadow-2xl shadow-black/40 z-30 overflow-hidden">
                                    {suggestions.map(app => (
                                        <button key={app.id} type="button" onClick={() => selectSuggestion(app)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/[0.05] transition-colors flex items-center gap-3">
                                            <span className="text-sm">{app.processType === 'schengen' ? '🇪🇺' : '🇺🇸'}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-text-primary truncate">{app.id}</p>
                                                <p className="text-[10px] text-text-muted truncate">{app.employeeName}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Employee Name *</label>
                            <div className="relative">
                                <HiOutlineUser className="absolute left-0 bottom-2.5 -translate-x-0.1 -translate-y-1/2 text-text-muted text-sm" />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Procedure name" className="input-field !border-0 !bg-white/[0.04] pl-" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Destination</label>
                            <div className="relative">
                                <HiOutlineLocationMarker strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                                <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Where is this client going?" className="input-field !border-0 !bg-white/[0.04] pl-9" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Visa Category</label>
                            <div className="relative">
                                <HiOutlineGlobe strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                                <select
                                    value={procType}
                                    onChange={(e) => !isUpdate && setProcType(e.target.value)}
                                    disabled={isUpdate}
                                    className="input-field !appearance-none !border-0 !bg-white/[0.04] pl-9 pr-9 cursor-pointer text-sm"
                                >
                                    {visaOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                    ))}
                                </select>
                                <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">WhatsApp Group Link</label>
                            <div className="relative">
                                <HiOutlineLink strokeWidth={1.5} className="absolute left-0 bottom-2.5 -translate-x-0.1 -translate-y-1/2 text-text-muted text-sm" />
                                <input type="text" value={whatsappLink} onChange={e => setWhatsappLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="input-field !border-0 !bg-white/[0.04] pl-9" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Case Decision</label>
                            <div className="relative">
                                <select
                                    value={decision}
                                    onChange={(e) => setDecision(e.target.value)}
                                    className="input-field !appearance-none !border-0 !bg-white/[0.04] pl-4 pr-9 cursor-pointer text-sm"
                                >
                                    <option value="under_processing">🔄 Under Processing</option>
                                    <option value="accepted">✅ Accepted</option>
                                    <option value="refused">❌ Refused</option>
                                </select>
                                <HiOutlineChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-xs pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Steps */}
                {odooId.trim() ? (
                    <div className="space-y-4 anim-fade" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HiOutlineDocumentAdd className="text-sm text-accent-cyan" />
                                <h3 className="text-base font-bold">Process Steps</h3>
                            </div>
                            {procType !== 'uk' && procType !== 'canada' && (
                                <span className="badge badge-neutral text-[10px]">
                                    {procType === 'schengen' ? '🇪🇺' : '🇺🇸'} {defs.length} steps
                                </span>
                            )}
                        </div>

                        {procType === 'uk' || procType === 'canada' ? (
                            <div className="card !border-0 p-8 text-center bg-warning/[0.05] border border-warning/20 rounded-2xl">
                                <span className="text-4xl mb-3 block">{procType === 'uk' ? '🇬🇧' : '🇨🇦'}</span>
                                <h4 className="text-warning font-bold mb-1">Under Development</h4>
                                <p className="text-xs text-warning/80">The step process for this visa category is currently being built.</p>
                            </div>
                        ) : (
                            <div className="card !border-0 p-5 space-y-3 bg-white/[0.02]">
                                {defs.map(d => (
                                    <StepCard key={d.key} stepDef={d} stepData={steps[d.key] || { status: 'pending' }} statusValue={statuses[d.key] || ''} noteValue={notes[d.key] || ''} onFile={onFile} onStatusChange={onStatusChange} onNote={onNote} onFollowerName={onFollowerName} />
                                ))}
                            </div>
                        )}

                        <div className="sticky bottom-4 z-20 pt-3">
                            <button type="submit" className="btn-primary w-full py-4 text-sm font-bold shadow-lg shadow-accent-indigo/20 hover:shadow-accent-indigo/30 transition-all">
                                <HiOutlineSave className="text-lg" />
                                {isUpdate ? 'Save Changes' : 'Create Application'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="card !border-0 p-16 text-center bg-white/[0.02] anim-fade" style={{ animationDelay: '200ms' }}>
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                            <HiOutlineIdentification className="text-3xl text-text-muted" />
                        </div>
                        <h4 className="text-lg font-bold mb-1.5">No Case Selected</h4>
                        <p className="text-sm text-text-secondary max-w-xs mx-auto">Enter a Client Name or ID above to start or edit a case.</p>
                    </div>
                )}
            </form>
        </div>
    )
}
