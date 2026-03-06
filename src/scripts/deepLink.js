const MARKER_RESOURCE = 'marker'
const SCHEDULE_RESOURCE = 'schedule'

const parseDeepLinkPath = (pathname) => {
    if (!pathname) return null

    const markerMatch = pathname.match(/^\/markers\/([^/]+)$/)
    if (markerMatch) {
        const id = `${markerMatch[1] || ''}`.trim()
        if (!id) return null
        return {
            resourceType: MARKER_RESOURCE,
            id,
            path: `/markers/${id}`,
        }
    }

    const scheduleMatch = pathname.match(/^\/schedules\/([^/]+)$/)
    if (scheduleMatch) {
        const id = `${scheduleMatch[1] || ''}`.trim()
        if (!id) return null
        return {
            resourceType: SCHEDULE_RESOURCE,
            id,
            path: `/schedules/${id}`,
        }
    }

    return null
}

const parsePositiveIntId = (raw) => {
    const id = Number(raw)
    if (!Number.isInteger(id) || id <= 0) return null
    return id
}

const buildDeepLinkPath = (intent) => {
    if (!intent || !intent.resourceType || !intent.id) return '/home'
    if (intent.resourceType === MARKER_RESOURCE) return `/markers/${intent.id}`
    if (intent.resourceType === SCHEDULE_RESOURCE) return `/schedules/${intent.id}`
    return '/home'
}

const resolvePostLoginNavigation = (intent) => {
    if (!intent || !intent.resourceType || !intent.id) {
        return {
            path: '/home',
            shouldIncrementReplay: false,
            shouldClearIntent: false,
        }
    }

    const replayCount = intent.replayCount || 0
    if (replayCount >= 1) {
        return {
            path: '/home',
            shouldIncrementReplay: false,
            shouldClearIntent: true,
        }
    }

    return {
        path: buildDeepLinkPath(intent),
        shouldIncrementReplay: true,
        shouldClearIntent: false,
    }
}

const deepLink = {
    resources: {
        marker: MARKER_RESOURCE,
        schedule: SCHEDULE_RESOURCE,
    },
    parsePath: parseDeepLinkPath,
    parsePositiveIntId,
    buildPath: buildDeepLinkPath,
    resolvePostLoginNavigation,
}

export default deepLink
