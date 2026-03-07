import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
    getApplications,
    saveApplication as storageSave,
    deleteApplication as storageDelete,
    deleteAllApplications as storageDeleteAll,
    toggleStarApplication as storageToggleStar,
} from '../services/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [applications, setApplications] = useState(() => getApplications())

    const refreshApplications = useCallback(() => {
        setApplications(getApplications())
    }, [])

    // Listen for storage events from other tabs
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'processflow_applications') {
                refreshApplications()
            }
        }
        window.addEventListener('storage', handler)
        return () => window.removeEventListener('storage', handler)
    }, [refreshApplications])

    const saveApp = useCallback((app) => {
        const saved = storageSave(app)
        refreshApplications()
        return saved
    }, [refreshApplications])

    const deleteApp = useCallback((id) => {
        storageDelete(id)
        refreshApplications()
    }, [refreshApplications])

    const deleteAllApps = useCallback(() => {
        storageDeleteAll()
        refreshApplications()
    }, [refreshApplications])

    const toggleStarApp = useCallback((id) => {
        storageToggleStar(id)
        refreshApplications()
    }, [refreshApplications])

    return (
        <AppContext.Provider
            value={{ applications, saveApp, deleteApp, deleteAllApps, toggleStarApp, refreshApplications }}
        >
            {children}
        </AppContext.Provider>
    )
}

export function useAppContext() {
    const ctx = useContext(AppContext)
    if (!ctx) throw new Error('useAppContext must be used within AppProvider')
    return ctx
}
