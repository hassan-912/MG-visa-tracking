import { HiOutlineX, HiOutlineDownload } from 'react-icons/hi'

export default function DocumentPreview({ stepData, onClose }) {
    if (!stepData?.fileData) return null
    const isImg = stepData.fileType?.startsWith('image/')
    const isPdf = stepData.fileType === 'application/pdf'

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8" onClick={onClose}>
            <div className="absolute inset-0 bg-dark-950/95 backdrop-blur-2xl" />
            <div onClick={(e) => e.stopPropagation()} className="relative card border-white/10 w-full max-w-4xl h-full max-h-[85dvh] flex flex-col overflow-hidden anim-scale">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3 min-w-0">
                        <span className="text-lg">{isImg ? '🖼️' : isPdf ? '📄' : '📎'}</span>
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold truncate">{stepData.fileName}</h3>
                            <p className="text-[10px] text-text-muted">Preview</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={stepData.fileData} download={stepData.fileName} className="btn-ghost text-xs hidden sm:flex">
                            <HiOutlineDownload className="text-sm" /> Download
                        </a>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-danger/15 hover:text-danger text-text-muted transition-colors flex items-center justify-center">
                            <HiOutlineX className="text-lg" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-dark-950/50 overflow-auto flex items-center justify-center p-6">
                    {isImg ? (
                        <img src={stepData.fileData} alt={stepData.fileName} className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : isPdf ? (
                        <iframe src={stepData.fileData} title={stepData.fileName} className="w-full h-full rounded-lg border-none bg-white" />
                    ) : (
                        <div className="text-center space-y-3">
                            <p className="text-4xl opacity-30">📎</p>
                            <p className="font-bold">Can't preview this file</p>
                            <a href={stepData.fileData} download={stepData.fileName} className="btn-primary text-sm mt-2">
                                <HiOutlineDownload /> Download
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
