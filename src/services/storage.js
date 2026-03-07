import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType } from 'docx'
import { saveAs } from 'file-saver'

const STORAGE_KEY = 'processflow_applications'

export function getApplications() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch { return {} }
}

export function saveApplication(app) {
    const apps = getApplications()
    apps[app.id] = {
        ...app,
        updatedAt: new Date().toISOString(),
        createdAt: apps[app.id]?.createdAt || new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
    return apps
}

export function deleteApplication(id) {
    const apps = getApplications()
    delete apps[id]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
    return apps
}

export function deleteAllApplications() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}))
    return {}
}

export function toggleStarApplication(id) {
    const apps = getApplications()
    if (apps[id]) {
        apps[id].starred = !apps[id].starred
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
    }
    return apps
}

// ── Word document report ──

const STATUS_LABELS = {
    complete: 'Complete',
    waiting_client: 'Waiting for Client',
    waiting_translation: 'Waiting for Translation',
    in_progress: 'In Progress',
    pending: 'Pending',
}

function makeHeader(text) {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 28, color: '7C83F7' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 100 },
    })
}

function makeStepRow(stepLabel, statusLabel, note, bgColor) {
    const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
    const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder }

    return new TableRow({
        children: [
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: stepLabel, size: 20 })] })],
                width: { size: 55, type: WidthType.PERCENTAGE },
                borders,
                shading: bgColor ? { type: ShadingType.SOLID, color: bgColor } : undefined,
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: statusLabel, size: 20, bold: true })] })],
                width: { size: 20, type: WidthType.PERCENTAGE },
                borders,
                shading: bgColor ? { type: ShadingType.SOLID, color: bgColor } : undefined,
            }),
            new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: note || '—', size: 18, color: '64748B' })] })],
                width: { size: 25, type: WidthType.PERCENTAGE },
                borders,
                shading: bgColor ? { type: ShadingType.SOLID, color: bgColor } : undefined,
            }),
        ],
    })
}

function makeTable(rows) {
    const headerBorder = { style: BorderStyle.SINGLE, size: 1, color: '7C83F7' }
    const headerBorders = { top: headerBorder, bottom: headerBorder, left: headerBorder, right: headerBorder }

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: ['Step', 'Status', 'Notes'].map(text =>
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: 'FFFFFF' })] })],
                        borders: headerBorders,
                        shading: { type: ShadingType.SOLID, color: '7C83F7' },
                    })
                ),
            }),
            ...rows,
        ],
    })
}

export async function generateWordReport(app, processSteps) {
    const defs = processSteps[app.processType] || []

    // Categorize steps
    const done = [], inProgress = [], missing = []
    defs.forEach(def => {
        const step = app.steps[def.key] || { status: 'pending' }
        const entry = { label: def.label, status: step.status, note: step.note, fileName: step.fileName }
        if (step.status === 'complete') done.push(entry)
        else if (['waiting_client', 'waiting_translation', 'in_progress'].includes(step.status)) inProgress.push(entry)
        else missing.push(entry)
    })

    const children = []

    // Title
    children.push(new Paragraph({
        children: [new TextRun({ text: 'Case Report', bold: true, size: 40, color: '1E293B' })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
    }))

    children.push(new Paragraph({
        children: [new TextRun({ text: `Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 18, color: '94A3B8' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
    }))

    // Info section
    const infoItems = [
        ['Odoo ID', app.id],
        ['Employee', app.employeeName],
        ['Visa Category', app.processType === 'schengen' ? 'Schengen (EU)' : 'USA'],
        ['Destination', app.destination || 'Not specified'],
        ['Total Steps', `${defs.length}`],
        ['Completed', `${done.length} of ${defs.length}`],
    ]

    children.push(makeHeader('Case Information'))
    infoItems.forEach(([label, value]) => {
        children.push(new Paragraph({
            children: [
                new TextRun({ text: `${label}: `, bold: true, size: 20, color: '475569' }),
                new TextRun({ text: value, size: 20 }),
            ],
            spacing: { after: 60 },
        }))
    })

    // Done section
    if (done.length > 0) {
        children.push(makeHeader(`✅ Completed (${done.length})`))
        children.push(makeTable(
            done.map(s => makeStepRow(
                `${s.label}${s.fileName ? ` — ${s.fileName}` : ''}`,
                STATUS_LABELS[s.status] || s.status,
                s.note,
                'F0FDF4'
            ))
        ))
    }

    // In progress section
    if (inProgress.length > 0) {
        children.push(makeHeader(`🔄 In Progress / Waiting (${inProgress.length})`))
        children.push(makeTable(
            inProgress.map(s => makeStepRow(
                s.label,
                STATUS_LABELS[s.status] || s.status,
                s.note,
                'FFFBEB'
            ))
        ))
    }

    // Missing section
    if (missing.length > 0) {
        children.push(makeHeader(`❌ Missing (${missing.length})`))
        children.push(makeTable(
            missing.map(s => makeStepRow(
                s.label,
                'Not Started',
                s.note,
                'FEF2F2'
            ))
        ))
    }

    // Summary
    children.push(new Paragraph({ spacing: { before: 400 } }))
    children.push(new Paragraph({
        children: [
            new TextRun({ text: 'Summary: ', bold: true, size: 20, color: '475569' }),
            new TextRun({ text: `${done.length} completed, ${inProgress.length} in progress, ${missing.length} missing out of ${defs.length} total steps.`, size: 20 }),
        ],
    }))

    const doc = new Document({
        sections: [{ children }],
        creator: 'MG Tracking',
        title: `Case Report — ${app.id}`,
        description: `Visa application report for ${app.employeeName}`,
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `Report_${app.id}_${new Date().toISOString().split('T')[0]}.docx`)
}
