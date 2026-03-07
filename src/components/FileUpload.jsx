import { useState, useRef } from 'react'
import { HiOutlineCloudUpload, HiOutlineCheck, HiOutlineRefresh } from 'react-icons/hi'

export default function FileUpload({ onFileSelect, currentFileName }) {
    const [isDragging, setIsDragging] = useState(false)
    const fileRef = useRef(null)

    const handleFile = (file) => {
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => onFileSelect(file.name, e.target.result, file.type)
        reader.readAsDataURL(file)
    }

    if (currentFileName) {
        return (
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-success/[0.06] border border-success/10">
                <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0 text-success">
                    <HiOutlineCheck className="text-base" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-success/70 font-bold uppercase tracking-wider leading-none mb-0.5">Uploaded</p>
                    <p className="text-xs font-medium text-text-primary truncate">{currentFileName}</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
                    className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
                    title="Replace"
                >
                    <HiOutlineRefresh className="text-sm" />
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            </div>
        )
    }

    return (
        <div
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-4 flex flex-col items-center gap-1.5 group ${isDragging
                ? 'border-accent-indigo bg-accent-indigo/[0.06]'
                : 'border-white/[0.06] hover:border-accent-indigo/30'
                }`}
        >
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
            <HiOutlineCloudUpload className={`text-xl transition-colors ${isDragging ? 'text-accent-indigo' : 'text-text-muted group-hover:text-accent-indigo'}`} />
            <p className="text-xs font-medium text-text-secondary">{isDragging ? 'Drop here' : 'Upload file'}</p>
        </div>
    )
}
