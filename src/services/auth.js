// Admin account credentials — stored in localStorage for dynamic accounts
const AUTH_KEY = 'processflow_ceo_auth'
const ACCOUNTS_KEY = 'processflow_admin_accounts'

// Default admin accounts (seed)
const DEFAULT_ACCOUNTS = [
    {
        username: 'hassan',
        password: 'Hassan123',
        name: 'Hassan',
        role: 'CEO',
        avatar: 'HA',
        isDefault: true,
    },
]

function getAdminAccounts() {
    try {
        const stored = localStorage.getItem(ACCOUNTS_KEY)
        if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    // First load — seed defaults
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS))
    return DEFAULT_ACCOUNTS
}

function saveAdminAccounts(accounts) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function getAllAdmins() {
    return getAdminAccounts()
}

export function createAdmin({ username, password, name, role }) {
    const accounts = getAdminAccounts()
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
        return { error: 'Username already exists' }
    }
    const newAccount = {
        username,
        password,
        name,
        role: role || 'Admin',
        avatar: name.slice(0, 2).toUpperCase(),
        isDefault: false,
    }
    accounts.push(newAccount)
    saveAdminAccounts(accounts)
    return { success: true, account: newAccount }
}

export function deleteAdmin(username) {
    const accounts = getAdminAccounts()
    const target = accounts.find(a => a.username === username)
    if (!target) return { error: 'Account not found' }
    if (target.isDefault) return { error: 'Cannot delete the main admin account' }
    saveAdminAccounts(accounts.filter(a => a.username !== username))
    return { success: true }
}

export function getCEOSession() {
    try {
        const data = localStorage.getItem(AUTH_KEY)
        return data ? JSON.parse(data) : null
    } catch {
        return null
    }
}

export function loginCEO(username, password) {
    const accounts = getAdminAccounts()
    const account = accounts.find(
        (a) => a.username === username && a.password === password
    )
    if (account) {
        const session = {
            username: account.username,
            name: account.name,
            role: account.role,
            avatar: account.avatar,
            loggedInAt: new Date().toISOString(),
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(session))
        return session
    }
    return null
}

export function logoutCEO() {
    localStorage.removeItem(AUTH_KEY)
}
