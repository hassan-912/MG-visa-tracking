export const PROCESS_STEPS = {
    schengen: [
        { key: 'whatsapp_group', label: 'WhatsApp Group', icon: '💬' },
        { key: 'checklist', label: 'Checklist Sent', icon: '📝' },
        { key: 'employee_follow_up', label: 'Employee Follow Up', icon: '📞' },
        // Existing steps
        { key: 'hotel', label: 'Hotel Reservation', icon: '🏨' },
        { key: 'travel_plane', label: 'Flight Booking', icon: '✈️' },
        { key: 'motivation', label: 'Motivation Letter', icon: '📝' },
        { key: 'application', label: 'Application Form', icon: '📋' },
        { key: 'review', label: 'Review', icon: '🔍' },
        { key: 'translation', label: 'Translation', icon: '🌐' },
        { key: 'submitted', label: 'Submitted Application', icon: '✅' },
    ],
    usa: [
        { key: 'whatsapp_group', label: 'WhatsApp Group', icon: '💬' },
        { key: 'checklist', label: 'Checklist Sent', icon: '📝' },
        { key: 'employee_follow_up', label: 'Employee Follow Up', icon: '📞' },
        // Existing steps
        { key: 'us', label: 'US Documents', icon: '🇺🇸' },
        { key: 'hotel', label: 'Hotel Reservation', icon: '🏨' },
        { key: 'ds160', label: 'DS-160 Form', icon: '📄' },
        { key: 'coaching', label: 'Interview Coaching', icon: '🎓' },
    ],
}

// Step status types
export const STEP_STATUSES = {
    pending: { label: 'Pending', color: 'neutral', icon: '⏳' },
    complete: { label: 'Complete', color: 'success', icon: '✅' },
    waiting_client: { label: 'Waiting for Client', color: 'warning', icon: '👤' },
    waiting_translation: { label: 'Waiting for Translation', color: 'info', icon: '🌐' },
    in_progress: { label: 'In Progress', color: 'indigo', icon: '🔄' },
}

// Non-upload status options for the dropdown
export const NON_UPLOAD_STATUSES = [
    { value: 'waiting_client', label: 'Waiting for Client', icon: '👤', color: 'warning' },
    { value: 'waiting_translation', label: 'Waiting for Translation', icon: '🌐', color: 'info' },
    { value: 'in_progress', label: 'In Progress', icon: '🔄', color: 'indigo' },
]

export function getDefaultSteps(processType) {
    const steps = PROCESS_STEPS[processType] || []
    const result = {}
    steps.forEach((step) => {
        result[step.key] = {
            status: 'pending',
            fileName: null,
            note: null,
            updatedAt: null,
        }
    })
    return result
}

export function getCompletionPercentage(steps, processType) {
    const stepDefs = PROCESS_STEPS[processType] || []
    if (stepDefs.length === 0) return 0
    const completed = stepDefs.filter(
        (s) => steps[s.key]?.status === 'complete'
    ).length
    return Math.round((completed / stepDefs.length) * 100)
}

// Get the overall case status
export function getCaseStatus(steps, processType) {
    const stepDefs = PROCESS_STEPS[processType] || []
    if (stepDefs.length === 0) return 'pending'

    const statuses = stepDefs.map(s => steps[s.key]?.status || 'pending')
    const allComplete = statuses.every(s => s === 'complete')
    const anyActive = statuses.some(s => s !== 'pending')

    if (allComplete) return 'done'
    if (anyActive) return 'active'
    return 'in_progress'
}
