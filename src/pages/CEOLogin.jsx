import { useState } from 'react'
import toast from 'react-hot-toast'
import { loginCEO } from '../services/auth'
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff, HiArrowRight } from 'react-icons/hi'

export default function CEOLogin({ onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setError(''); setLoading(true)
        await new Promise(r => setTimeout(r, 600))
        const session = loginCEO(username, password)
        if (session) { toast.success(`Welcome, ${session.name}`); onLogin(session) }
        else { setError('Invalid credentials'); toast.error('Authentication failed') }
        setLoading(false)
    }

    return (
        <div className="min-h-[75dvh] flex items-center justify-center">
            <div className="w-full max-w-sm anim-fade">
                <div className="text-center mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-indigo/20 to-accent-violet/20 border border-accent-indigo/15 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent-indigo/10">
                        <HiOutlineLockClosed className="text-accent-indigo text-xl" />
                    </div>
                    <h2 className="text-xl font-extrabold mb-0.5">Admin Access</h2>
                    <p className="text-sm text-text-secondary">Sign in to managers dashboard</p>
                </div>

                <div className="card p-6">
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Username</label>
                            <div className="relative">
                                <HiOutlineUser strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="input-field pl-9" required />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="input-field pl-9 pr-10" required />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                                    {showPw ? <HiOutlineEyeOff className="text-sm" /> : <HiOutlineEye className="text-sm" />}
                                </button>
                            </div>
                        </div>

                        {error && <div className="p-3 rounded-xl bg-danger/8 border border-danger/10 text-danger text-xs font-bold text-center anim-slide">{error}</div>}

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
                            {loading ? (
                                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span>
                            ) : (
                                <span className="flex items-center gap-2">Sign In <HiArrowRight className="text-sm" /></span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[10px] text-text-muted/40 mt-5">MG Tracking · Secure Portal</p>
            </div>
        </div>
    )
}
