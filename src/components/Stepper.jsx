import { PROCESS_STEPS, STEP_STATUSES } from '../constants/steps'
import { HiCheck, HiOutlineEye, HiOutlineChevronDown, HiOutlineChevronUp, HiClock } from 'react-icons/hi'
import { useState, memo } from 'react'

const statusStyle = {
    complete: { node: 'bg-success/15 text-success ring-2 ring-success/20', line: 'bg-success/20', badge: 'badge-success', icon: <HiCheck className="text-sm" /> },
    waiting_client: { node: 'bg-warning/15 text-warning ring-2 ring-warning/20', line: 'bg-warning/15', badge: 'badge-warning', icon: <HiClock className="text-sm" /> },
    waiting_translation: { node: 'bg-info/15 text-info ring-2 ring-info/20', line: 'bg-info/15', badge: 'badge-info', icon: <span className="text-xs">🌐</span> },
    in_progress: { node: 'bg-accent-indigo/15 text-accent-indigo ring-2 ring-accent-indigo/20', line: 'bg-accent-indigo/15', badge: 'badge-indigo', icon: <span className="text-xs">🔄</span> },
    pending: { node: 'bg-dark-700 text-text-muted ring-1 ring-white/[0.06]', line: 'bg-white/[0.04]', badge: 'badge-neutral', icon: null },
}

const StepNode = memo(function StepNode({ stepDef, stepData, isLast, index, onPreview, showInline }) {
    const [showNote, setShowNote] = useState(false)
    const [inlineOpen, setInlineOpen] = useState(false)
    const status = stepData.status || 'pending'
    const s = statusStyle[status] || statusStyle.pending
    const info = STEP_STATUSES[status] || STEP_STATUSES.pending
    const isImg = stepData.fileType?.startsWith('image/')
    const isPdf = stepData.fileType === 'application/pdf'
    const hasFile = stepData.fileName && stepData.fileData

    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold z-10 transition-all ${s.node}`}>
                    {s.icon || index + 1}
                </div>
                {!isLast && <div className={`w-px flex-1 my-1.5 ${s.line}`} />}
            </div>

            <div className="flex-1 pb-7 pt-0.5 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{stepDef.icon}</span>
                        <h4 className="text-sm font-semibold truncate">{stepDef.label}</h4>
                    </div>
                    <span className={`badge text-[9px] flex-shrink-0 ${s.badge}`}>{info.label}</span>
                </div>

                {stepData.fileName && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg card-inner text-xs max-w-sm">
                        <span>{isImg ? '🖼️' : isPdf ? '📄' : '📎'}</span>
                        <span className="truncate text-text-secondary font-medium">{stepData.fileName}</span>
                        {hasFile && (isImg || isPdf) && (
                            <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                                {showInline && (
                                    <button onClick={() => setInlineOpen(!inlineOpen)} className="text-accent-cyan hover:text-accent-indigo transition-colors font-semibold flex items-center gap-1">
                                        <HiOutlineEye className="text-sm" /> {inlineOpen ? 'Hide' : 'View'}
                                    </button>
                                )}
                                {onPreview && (
                                    <button onClick={() => onPreview(stepData)} className="text-accent-indigo hover:text-accent-violet transition-colors font-semibold flex items-center gap-1">
                                        <HiOutlineEye className="text-sm" /> Open
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {inlineOpen && hasFile && (
                    <div className="mt-3 preview-frame anim-scale">
                        {isImg ? <img src={stepData.fileData} alt={stepData.fileName} /> : isPdf ? <iframe src={stepData.fileData} title={stepData.fileName} /> : null}
                    </div>
                )}

                {status !== 'pending' && status !== 'complete' && stepData.note && (
                    <div className="mt-2.5">
                        <button onClick={() => setShowNote(!showNote)} className="flex items-center gap-1 text-[11px] font-semibold text-text-muted hover:text-text-secondary transition-colors">
                            {showNote ? <HiOutlineChevronUp className="text-xs" /> : <HiOutlineChevronDown className="text-xs" />} Details
                        </button>
                        {showNote && (
                            <div className="mt-2 p-3 rounded-lg card-inner anim-slide">
                                <p className="text-sm text-text-primary leading-relaxed">{stepData.note}</p>
                                {stepData.updatedAt && <p className="mt-2 text-[10px] text-text-muted">{new Date(stepData.updatedAt).toLocaleString()}</p>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
})

export default memo(function Stepper({ processType, steps, onPreview, showInline = false }) {
    const defs = PROCESS_STEPS[processType] || []
    return (
        <div className="pt-1">
            {defs.map((sd, i) => (
                <StepNode key={sd.key} stepDef={sd} stepData={steps[sd.key] || { status: 'pending' }} isLast={i === defs.length - 1} index={i} onPreview={onPreview} showInline={showInline} />
            ))}
        </div>
    )
})
